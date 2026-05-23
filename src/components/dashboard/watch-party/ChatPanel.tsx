'use client'

import { Box, Chip, Divider, IconButton, InputAdornment, OutlinedInput, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '@/types/watchPartyRoom'

const SYSTEM_USER_ID = 'system'

interface ChatPanelProps {
  messages: ChatMessage[]
  onSend: (text: string) => void
}

const ChatPanel = ({ messages, onSend }: ChatPanelProps) => {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }, [draft, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Message history */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 0.5 }}>
        {messages.length === 0 ? (
          <Typography color='text.secondary' variant='body2' sx={{ p: 2, textAlign: 'center' }}>
            No messages yet
          </Typography>
        ) : (
          messages.map(msg => {
            const isSystem = msg.userId === SYSTEM_USER_ID
            return (
              <Box key={msg.id} sx={{ mb: 1 }}>
                {isSystem ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                    <Chip
                      label={msg.text}
                      size='small'
                      variant='outlined'
                      sx={{ fontSize: '0.7rem', color: 'text.secondary' }}
                    />
                  </Box>
                ) : (
                  <>
                    <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                      {msg.displayName}
                    </Typography>
                    <Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
                      {msg.text}
                    </Typography>
                  </>
                )}
              </Box>
            )
          })
        )}
        <div ref={bottomRef} />
      </Box>

      <Divider />

      {/* Composer */}
      <Box sx={{ p: 1 }}>
        <OutlinedInput
          fullWidth
          size='small'
          placeholder='Type a message…'
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline
          maxRows={3}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton size='small' onClick={handleSend} disabled={!draft.trim()}>
                <i className='ri-send-plane-fill' />
              </IconButton>
            </InputAdornment>
          }
        />
      </Box>
    </Box>
  )
}

export default ChatPanel
