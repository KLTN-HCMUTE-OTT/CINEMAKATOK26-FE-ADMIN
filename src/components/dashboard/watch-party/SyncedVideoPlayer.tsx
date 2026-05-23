'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { Box, IconButton, Slider, Tooltip, Typography } from '@mui/material'
import type { VideoState } from '@/types/watchPartyRoom'

const SYNC_THROTTLE_MS = 500
const DRIFT_TOLERANCE_SEC = 1.5
const CONTROLS_HIDE_DELAY = 3000

function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
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
  const dashPlayerRef = useRef<any>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // ── Load DASH stream when videoId changes ────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoState?.videoId) return

    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''
    const manifestUrl = `${apiBase}/local-videos/${videoState.videoId}/dash/manifest.mpd`

    let cancelled = false

    const initDash = async () => {
      try {
        const dashjs = (await import('dashjs')).default
        if (cancelled) return

        if (dashPlayerRef.current) {
          dashPlayerRef.current.reset()
        }
        const player = dashjs.MediaPlayer().create()
        player.initialize(video, manifestUrl, false)
        player.updateSettings({ streaming: { buffer: { bufferTimeAtTopQuality: 12 } } })
        dashPlayerRef.current = player
      } catch (err) {
        if (!cancelled) console.error('[SyncedVideoPlayer] dashjs init failed:', err)
      }
    }

    initDash()

    return () => {
      cancelled = true
    }
  }, [videoState?.videoId])

  // Cleanup dashjs on unmount
  useEffect(() => {
    return () => {
      if (dashPlayerRef.current) {
        try { dashPlayerRef.current.reset() } catch { /* ignore */ }
        dashPlayerRef.current = null
      }
    }
  }, [])

  // ── Throttled sync broadcaster ───────────────────────────────────────────
  const throttledSync = useCallback(
    (state: { isPlaying: boolean; currentTime: number }) => {
      const now = Date.now()
      if (now - lastSyncRef.current < SYNC_THROTTLE_MS) return
      lastSyncRef.current = now
      onSync(state)
    },
    [onSync],
  )

  // ── Broadcast host events (admin = always host) ──────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => throttledSync({ isPlaying: true, currentTime: video.currentTime })
    const onPause = () => throttledSync({ isPlaying: false, currentTime: video.currentTime })
    const onSeeked = () => throttledSync({ isPlaying: !video.paused, currentTime: video.currentTime })
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
  }, [videoState?.videoId, throttledSync, onVideoEnd])

  // ── Apply server state (drift correction when not playing) ───────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoState) return

    const expectedTime =
      videoState.isPlaying && videoState.lastUpdatedAt
        ? videoState.currentTime + (Date.now() / 1000 - videoState.lastUpdatedAt)
        : videoState.currentTime

    if (Math.abs(video.currentTime - expectedTime) > DRIFT_TOLERANCE_SEC) {
      video.currentTime = expectedTime
    }

    if (videoState.isPlaying && video.paused) {
      video.play().catch(() => {})
    } else if (!videoState.isPlaying && !video.paused) {
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
    const onVolumeChange = () => { setVolume(video.volume); setIsMuted(video.muted) }

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
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current) }
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

  // ── Awaiting host state ──────────────────────────────────────────────────
  if (!videoState || videoState.status === 'awaiting_host') {
    return (
      <Box
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          bgcolor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <i className='ri-movie-2-line' style={{ fontSize: 48, color: '#4b5563' }} />
          <Typography color='grey.500' variant='body2' sx={{ mt: 1 }}>
            Queue is empty — add a video to begin
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', bgcolor: '#000', borderRadius: 1, overflow: 'hidden' }}
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
    >
      <video
        ref={videoRef}
        key={videoState.videoId}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        playsInline
      />

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
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)',
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
              mb: 0.5,
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
