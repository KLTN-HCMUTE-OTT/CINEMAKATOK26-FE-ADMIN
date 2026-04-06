'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface HLSVideoPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
  controls?: boolean
  className?: string
  onError?: (error: any) => void
}

export default function HLSVideoPlayer({
  src,
  poster,
  autoPlay = false,
  controls = true,
  className = '',
  onError
}: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      })

      hlsRef.current = hls

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed, ready to play')
        if (autoPlay) {
          video.play().catch(err => {
            console.error('Auto-play failed:', err)
          })
        }
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error encountered, trying to recover')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error encountered, trying to recover')
              hls.recoverMediaError()
              break
            default:
              console.error('Fatal error, cannot recover')
              hls.destroy()
              if (onError) onError(data)
              break
          }
        }
      })

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy()
          hlsRef.current = null
        }
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src
      if (autoPlay) {
        video.play().catch(err => {
          console.error('Auto-play failed:', err)
        })
      }
    } else {
      console.error('HLS is not supported in this browser')
      if (onError) onError(new Error('HLS not supported'))
    }
  }, [src, autoPlay, onError])

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls={controls}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
