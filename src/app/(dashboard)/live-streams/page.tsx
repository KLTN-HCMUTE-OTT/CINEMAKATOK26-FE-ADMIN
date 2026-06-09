'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography } from '@mui/material'

// Components Imports
import LiveStreamStats from '@components/organisms/LiveStreamStats'
import LiveStreamTable from '@components/organisms/LiveStreamTable'
import LiveStreamModal from '@components/organisms/LiveStreamModal'

// Mock data for live streams
const mockLiveStreams = [
  {
    id: 1,
    title: 'Live Sports: Champions League Final',
    streamer: 'Sports Network',
    status: 'live',
    viewers: 45623,
    duration: '1h 23m',
    quality: '4K',
    thumbnail: '/images/cards/1.png',
    startTime: '2024-03-15 20:00',
    bitrate: '8000 kbps',
    server: 'US-East-1'
  },
  {
    id: 2,
    title: 'Breaking News Live',
    streamer: 'News Channel',
    status: 'live',
    viewers: 12847,
    duration: '45m',
    quality: '1080p',
    thumbnail: '/images/cards/2.png',
    startTime: '2024-03-15 19:30',
    bitrate: '4000 kbps',
    server: 'EU-West-1'
  },
  {
    id: 3,
    title: 'Gaming Tournament Finals',
    streamer: 'ESports Pro',
    status: 'scheduled',
    viewers: 0,
    duration: '0m',
    quality: '1080p',
    thumbnail: '/images/cards/3.png',
    startTime: '2024-03-16 15:00',
    bitrate: '6000 kbps',
    server: 'US-West-1'
  },
  {
    id: 4,
    title: 'Music Concert Live',
    streamer: 'Music Channel',
    status: 'ended',
    viewers: 0,
    duration: '2h 15m',
    quality: '4K',
    thumbnail: '/images/cards/4.png',
    startTime: '2024-03-14 21:00',
    bitrate: '8000 kbps',
    server: 'EU-Central-1'
  }
]

const LiveStreamsPage = () => {
  const [streams, setStreams] = useState(mockLiveStreams)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const handleStartStream = (id: number) => {
    setStreams(prev => prev.map(stream => (stream.id === id ? { ...stream, status: 'live', viewers: 1 } : stream)))
  }

  const handleStopStream = (id: number) => {
    setStreams(prev => prev.map(stream => (stream.id === id ? { ...stream, status: 'ended', viewers: 0 } : stream)))
  }

  const handleEditStream = (id: number) => {
    console.log('Edit stream:', id)
  }

  const handleDeleteStream = (id: number) => {
    setStreams(prev => prev.filter(stream => stream.id !== id))
  }

  const handleAddStream = (streamData: any) => {
    const id = Math.max(...streams.map(s => s.id)) + 1

    const newStreamData = {
      id,
      title: streamData.title,
      streamer: streamData.streamer,
      status: streamData.autoStart ? 'live' : 'scheduled',
      viewers: streamData.autoStart ? 1 : 0,
      duration: '0m',
      quality: streamData.quality,
      thumbnail: '/images/cards/1.png',
      startTime: streamData.scheduledTime || new Date().toISOString(),
      bitrate: streamData.quality === '4K' ? '8000 kbps' : '4000 kbps',
      server: streamData.server
    }

    setStreams(prev => [...prev, newStreamData])
    setAddModalOpen(false)
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Live Streaming Management
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage live streams, schedules and broadcasting
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Box sx={{ mb: 4 }}>
        <LiveStreamStats streams={streams} />
      </Box>

      {/* Data Table */}
      <LiveStreamTable
        streams={streams}
        onStart={handleStartStream}
        onStop={handleStopStream}
        onEdit={handleEditStream}
        onDelete={handleDeleteStream}
        onAddStream={() => setAddModalOpen(true)}
      />

      {/* Add Stream Modal */}
      <LiveStreamModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddStream} />
    </Box>
  )
}

export default LiveStreamsPage
