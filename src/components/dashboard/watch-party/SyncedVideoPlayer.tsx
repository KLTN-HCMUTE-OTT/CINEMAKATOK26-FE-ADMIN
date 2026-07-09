'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

import { Box, IconButton, Slider, Tooltip, Typography, CircularProgress, Alert } from '@mui/material'

import { streamingControllerGetManifestUrl, streamingControllerGetDrmKeyInfo } from '@/api/streaming'
import type { VideoState } from '@/types/watchPartyRoom'

async function loadShakaPlayer() {
  const shakaModule = await import('shaka-player/dist/shaka-player.compiled.js')

  return shakaModule.default ?? shakaModule
}

const SYNC_THROTTLE_MS = 500
const DRIFT_TOLERANCE_SEC = 1.5
const CONTROLS_HIDE_DELAY = 3000

function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)

  return `${m}:${String(sec).padStart(2, '0')}`
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')

  for (const cookie of cookies) {
    const [key, ...val] = cookie.trim().split('=')

    if (key === name) return decodeURIComponent(val.join('='))
  }

  return null
}

interface SyncedVideoPlayerProps {
  videoState: VideoState | null
  onSync: (state: { isPlaying: boolean; currentTime: number }) => void
  onVideoEnd: (videoId: string) => void
  onPlayNext?: () => void
}

export default function SyncedVideoPlayer({ videoState, onSync, onVideoEnd, onPlayNext }: SyncedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastSyncRef = useRef(0)
  const videoEndSentRef = useRef<string | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shakaPlayerRef = useRef<any>(null)
  const destroyPromiseRef = useRef<Promise<void> | null>(null)

  // Tracks when apply-server-state is the one calling play/pause so the emit
  // effect's handlers don't echo the change back to the server.
  const applyingServerStateRef = useRef(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const awaiting = !videoState || videoState.status === 'awaiting_host'
  const activeVideoId = awaiting ? null : videoState!.videoId

  // ── Secure source: signed manifest + ClearKey DRM via Shaka ───────────────
  useEffect(() => {
    const video = videoRef.current

    if (!video || !activeVideoId) return

    let active = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let shakaPlayer: any = null
    const videoId = activeVideoId

    const initPlayer = async () => {
      setLoading(true)
      setError(null)

      // Await any teardown started by a previous run before re-attaching.
      if (destroyPromiseRef.current) {
        try {
          await destroyPromiseRef.current
        } catch {
          /* ignore */
        }

        destroyPromiseRef.current = null
      }

      if (shakaPlayerRef.current) {
        try {
          await shakaPlayerRef.current.destroy()
        } catch {
          /* ignore */
        }

        shakaPlayerRef.current = null
      }

      try {
        const manifestResult = await streamingControllerGetManifestUrl({ videoId })
        const manifestUrl = manifestResult.data?.data?.manifestUrl

        if (!manifestUrl) throw new Error('Failed to obtain signed manifest URL')

        // Best-effort DRM key info (ClearKey uses the license server, not the keyId directly).
        try {
          await streamingControllerGetDrmKeyInfo({ videoId })
        } catch (drmErr) {
          console.warn('No DRM key found or failed to fetch key info', drmErr)
        }

        const shaka = await loadShakaPlayer()

        if (!shaka?.Player) {
          throw new Error('Failed to load Shaka Player')
        }

        if (!active) return

        shaka.polyfill.installAll()

        if (!shaka.Player.isBrowserSupported()) {
          throw new Error('Browser not supported by Shaka Player')
        }

        const player = new shaka.Player()

        await player.attach(video)

        if (!active) {
          player.destroy()

          return
        }

        shakaPlayerRef.current = player
        shakaPlayer = player

        // ClearKey via the Next.js BFF proxy (relative path).
        player.configure({
          drm: {
            servers: {
              'org.w3.clearkey': '/api/v1/drm/license/clearkey'
            }
          }
        })

        // Inject Content-Type, CSRF token and videoId into the license request.
        const networkingEngine = player.getNetworkingEngine()

        if (networkingEngine) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          networkingEngine.registerRequestFilter((requestType: any, request: any) => {
            if (requestType === shaka.net.NetworkingEngine.RequestType.LICENSE) {
              request.headers['Content-Type'] = 'application/json'
              request.allowCrossSiteCredentials = true

              const csrfToken = getCookie('csrf-token')

              if (csrfToken) {
                request.headers['X-CSRF-Token'] = csrfToken
              }

              if (request.body) {
                try {
                  const body = JSON.parse(new TextDecoder().decode(request.body))

                  body.videoId = videoId
                  request.body = new TextEncoder().encode(JSON.stringify(body))
                } catch (e) {
                  console.error('Failed to parse license request body', e)
                }
              }
            }
          })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player.addEventListener('error', (event: any) => {
          const err = event.detail || event

          console.error('Shaka Player error details:', err)
          if (!active) return
          let errMsg = err?.message || `Playback error (Code ${err?.code})`

          if (err?.category === 6) {
            errMsg =
              err?.code === 6007
                ? 'DRM License Request Failed: You do not have permission or your session has expired.'
                : `DRM Secure Playback Failed (Code ${err?.code}).`
          }

          setError(errMsg)
        })

        await player.load(manifestUrl)
        if (!active) return
        setLoading(false)

        // No autoplay: the host drives playback; the sync effect follows server state.
      } catch (err) {
        console.error('[SyncedVideoPlayer] Shaka init failed:', err)

        if (active) {
          setError((err as { message?: string })?.message || 'Failed to load secure video player')
          setLoading(false)
        }
      }
    }

    initPlayer()

    return () => {
      active = false

      if (shakaPlayer) {
        destroyPromiseRef.current = shakaPlayer.destroy()
      } else if (shakaPlayerRef.current) {
        destroyPromiseRef.current = shakaPlayerRef.current.destroy()
        shakaPlayerRef.current = null
      }
    }
  }, [activeVideoId])

  // ── Reset to a clean paused state on video change ────────────────────────
  useEffect(() => {
    const video = videoRef.current

    if (video && !video.paused) video.pause()
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [videoState?.videoId])

  // ── Sync broadcasters ─────────────────────────────────────────────────────
  // Critical state changes (play/pause/seek) bypass the throttle that exists to
  // tame timeupdate spam — otherwise a pause landing within the window is dropped.
  const emitSync = useCallback(
    (state: { isPlaying: boolean; currentTime: number }) => {
      lastSyncRef.current = Date.now()
      onSync(state)
    },
    [onSync]
  )

  const throttledSync = useCallback(
    (state: { isPlaying: boolean; currentTime: number }) => {
      const now = Date.now()

      if (now - lastSyncRef.current < SYNC_THROTTLE_MS) return
      lastSyncRef.current = now
      onSync(state)
    },
    [onSync]
  )

  // ── Broadcast host events (admin = always host) ──────────────────────────
  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    const onPlay = () => {
      if (applyingServerStateRef.current) {
        applyingServerStateRef.current = false

        return
      }

      emitSync({ isPlaying: true, currentTime: video.currentTime })
    }

    const onPause = () => {
      if (applyingServerStateRef.current) {
        applyingServerStateRef.current = false

        return
      }

      emitSync({ isPlaying: false, currentTime: video.currentTime })
    }

    const onSeeked = () => emitSync({ isPlaying: !video.paused, currentTime: video.currentTime })

    const onEnded = () => {
      const vid = videoState?.videoId

      if (vid && videoEndSentRef.current !== vid) {
        videoEndSentRef.current = vid
        onVideoEnd(vid)
      }
    }

    const onTimeUpdate = () => {
      if (!video.paused) throttledSync({ isPlaying: true, currentTime: video.currentTime })
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('ended', onEnded)
    video.addEventListener('timeupdate', onTimeUpdate)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [videoState?.videoId, emitSync, throttledSync, onVideoEnd])

  // ── Apply server state (drift correction) ────────────────────────────────
  useEffect(() => {
    const video = videoRef.current

    if (!video || !videoState) return

    // Server timestamps are milliseconds; convert the elapsed delta to seconds.
    const expectedTime =
      videoState.isPlaying && videoState.lastUpdatedAt
        ? videoState.currentTime + (Date.now() - videoState.lastUpdatedAt) / 1000
        : videoState.currentTime

    if (Math.abs(video.currentTime - expectedTime) > DRIFT_TOLERANCE_SEC) {
      video.currentTime = expectedTime
    }

    if (videoState.isPlaying && video.paused) {
      applyingServerStateRef.current = true
      video.play().catch(() => {
        applyingServerStateRef.current = false
      })
    } else if (!videoState.isPlaying && !video.paused) {
      applyingServerStateRef.current = true
      video.pause()
    }
  }, [videoState])

  // ── Drive UI state from video element ───────────────────────────────────
  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration || 0)

    const onVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('volumechange', onVolumeChange)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('volumechange', onVolumeChange)
    }
  }, [])

  // Fullscreen change detection
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)

    document.addEventListener('fullscreenchange', onFsChange)

    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // ── Controls auto-hide ───────────────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setShowControls(false), CONTROLS_HIDE_DELAY)
  }, [])

  useEffect(() => {
    resetHideTimer()

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [resetHideTimer])

  // ── Control handlers ─────────────────────────────────────────────────────
  const handleTogglePlay = useCallback(() => {
    const video = videoRef.current

    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }, [])

  const handleSeek = useCallback((_: Event, value: number | number[]) => {
    const video = videoRef.current

    if (!video) return
    video.currentTime = value as number
  }, [])

  const handleSkip = useCallback((seconds: number) => {
    const video = videoRef.current

    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration || Infinity))
  }, [])

  const handleToggleMute = useCallback(() => {
    const video = videoRef.current

    if (!video) return
    video.muted = !video.muted
  }, [])

  const handleToggleFullscreen = useCallback(() => {
    const container = containerRef.current

    if (!container) return
    if (!document.fullscreenElement) container.requestFullscreen().catch(() => {})
    else document.exitFullscreen().catch(() => {})
  }, [])

  // ── Keyboard shortcuts (admin always controls playback) ───────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current

      if (!video) return
      const target = e.target as HTMLElement | null

      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          handleTogglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleSkip(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          handleSkip(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          video.volume = Math.min(1, video.volume + 0.1)
          video.muted = false
          break
        case 'ArrowDown':
          e.preventDefault()
          video.volume = Math.max(0, video.volume - 0.1)
          break
        case 'm':
        case 'M':
          handleToggleMute()
          break
        case 'f':
        case 'F':
          handleToggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleTogglePlay, handleSkip, handleToggleMute, handleToggleFullscreen])

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        bgcolor: '#000',
        borderRadius: 1,
        overflow: 'hidden'
      }}
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
    >
      {/* Always-mounted <video>: a stable element keeps the once-bound UI/sync
          listeners attached across video switches and awaiting-host transitions. */}
      <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} playsInline />

      {/* Awaiting-host overlay */}
      {awaiting && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
            bgcolor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <i className='ri-movie-2-line' style={{ fontSize: 48, color: '#4b5563' }} />
            <Typography color='grey.500' variant='body2' sx={{ mt: 1 }}>
              Queue is empty — add a video to begin
            </Typography>
          </Box>
        </Box>
      )}

      {/* Error overlay */}
      {!awaiting && error && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: 'rgba(0,0,0,0.85)'
          }}
        >
          <Alert severity='error' sx={{ maxWidth: '80%' }}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Loading overlay */}
      {!awaiting && !error && loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.6)'
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Control overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          transition: 'opacity 0.3s',
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)'
        }}
      >
        <Box sx={{ px: 1.5, pb: 1.5, pt: 3 }}>
          {/* Progress slider */}
          <Slider
            size='small'
            value={currentTime}
            min={0}
            max={duration || 3600}
            step={1}
            onChange={handleSeek}
            sx={{
              color: 'primary.main',
              height: 4,
              '& .MuiSlider-thumb': { width: 12, height: 12 },
              mb: 0.5
            }}
          />

          {/* Buttons row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                <IconButton size='small' onClick={handleTogglePlay} sx={{ color: '#fff' }}>
                  <i className={isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} />
                </IconButton>
              </Tooltip>

              {onPlayNext && (
                <Tooltip title='Play Next'>
                  <IconButton size='small' onClick={onPlayNext} sx={{ color: '#fff' }}>
                    <i className='ri-skip-forward-fill' />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                <IconButton size='small' onClick={handleToggleMute} sx={{ color: '#fff' }}>
                  <i className={isMuted || volume === 0 ? 'ri-volume-mute-fill' : 'ri-volume-up-fill'} />
                </IconButton>
              </Tooltip>

              <Typography variant='caption' sx={{ color: '#fff', fontFamily: 'monospace', ml: 0.5 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Box>

            <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              <IconButton size='small' onClick={handleToggleFullscreen} sx={{ color: '#fff' }}>
                <i className={isFullscreen ? 'ri-fullscreen-exit-fill' : 'ri-fullscreen-fill'} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
