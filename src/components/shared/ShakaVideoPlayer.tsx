'use client'

import { useEffect, useRef, useState } from 'react'

import { CircularProgress, Box, Alert } from '@mui/material'

import { streamingControllerGetManifestUrl, streamingControllerGetDrmKeyInfo } from '@/api/streaming'

interface ShakaVideoPlayerProps {
  videoId: string
  poster?: string
  controls?: boolean
  className?: string
}

export default function ShakaVideoPlayer({
  videoId,
  poster,
  controls = true,
  className = ''
}: ShakaVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const initPlayer = async () => {
      setLoading(true)
      setError(null)

      try {
        // 1. Get manifest URL from streaming controller
        const manifestResult = await streamingControllerGetManifestUrl({ videoId })
        const manifestUrl = manifestResult.data?.data?.manifestUrl

        if (!manifestUrl) {
          throw new Error('Failed to obtain signed manifest URL')
        }

        // 2. Get DRM key info
        let drmKeyId: string | null = null

        try {
          const drmResult = await streamingControllerGetDrmKeyInfo({ videoId })

          drmKeyId = drmResult.data?.data?.keyId || null
        } catch (drmErr) {
          console.warn('No DRM key found or failed to fetch key info', drmErr)
        }

        // 3. Dynamically import Shaka Player compiled package
        const shaka = (await import('shaka-player/dist/shaka-player.compiled')).default

        if (!active) return

        shaka.polyfill.installAll()

        if (!shaka.Player.isBrowserSupported()) {
          throw new Error('Browser not supported by Shaka Player')
        }

        const video = videoRef.current

        if (!video) return

        const player = new shaka.Player()

        await player.attach(video)

        if (!active) {
          player.destroy()
          
return
        }

        playerRef.current = player

        // Configure DRM Clearkey servers using relative path to go through Next.js BFF proxy
        player.configure({
          drm: {
            servers: {
              'org.w3.clearkey': '/api/v1/drm/license/clearkey'
            }
          }
        })

        const getCookie = (name: string): string | null => {
          if (typeof document === 'undefined') return null
          const cookies = document.cookie.split(';')

          for (const cookie of cookies) {
            const [key, ...val] = cookie.trim().split('=')

            if (key === name) return decodeURIComponent(val.join('='))
          }

          
return null
        }

        // Request Filter to inject content-type, videoId and CSRF token for license endpoint validation
        const networkingEngine = player.getNetworkingEngine()

        if (networkingEngine) {
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

        // Player error listener
        player.addEventListener('error', (event: any) => {
          const err = event.detail || event

          console.error('Shaka Player error details:', err)

          if (active) {
            let errMsg = err.message || `Playback error (Code ${err.code})`

            if (err.category === 6) {
              if (err.code === 6007) {
                errMsg = 'DRM License Request Failed: You do not have permission or your session has expired.'
              } else {
                errMsg = `DRM Secure Playback Failed (Code ${err.code}).`
              }
            }

            setError(errMsg)
          }
        })

        await player.load(manifestUrl)
        if (!active) return
        setLoading(false)

        // Auto play the video once it is loaded
        if (video) {
          video.play().catch(playErr => {
            console.warn('Autoplay was prevented by browser security policy:', playErr)
          })
        }
      } catch (err: any) {
        console.error('Failed to initialize Shaka Player:', err)

        if (active) {
          setError(err.message || 'Failed to load video player')
          setLoading(false)
        }
      }
    }

    initPlayer()

    return () => {
      active = false

      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [videoId])

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }} className={className}>
      {loading && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <Alert severity='error' sx={{ maxWidth: '80%' }}>{error}</Alert>
        </Box>
      )}
      <video
        ref={videoRef}
        poster={poster}
        controls={controls}
        autoPlay
        style={{ width: '100%', height: '100%', display: loading || error ? 'none' : 'block' }}
      />
    </Box>
  )
}
