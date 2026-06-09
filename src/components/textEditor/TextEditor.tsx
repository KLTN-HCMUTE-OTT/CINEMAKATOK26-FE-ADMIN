'use client'

import React from 'react'

import { EditorContent, type Editor } from '@tiptap/react'

import { Box, Typography, Paper, FormHelperText } from '@mui/material'

import Toolbar from './Toolbar'
import LinkBubble from './LinkBubble'

type TextEditorProps = {
  title?: string
  editor: Editor | null
  error?: string
}

const TextEditor: React.FC<TextEditorProps> = ({ title, editor, error }) => {
  if (!editor) return null

  return (
    <Box>
      {title && (
        <Typography variant='subtitle2' sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <Toolbar editor={editor} />

        <Box
          sx={{
            minHeight: 200,
            maxHeight: 600,
            overflowY: 'auto',
            '& .ProseMirror': {
              outline: 'none',
              padding: 2,
              minHeight: 200
            },
            '& .ProseMirror p': {
              marginBottom: 1
            },
            '& .ProseMirror h1': {
              fontSize: '2rem',
              fontWeight: 'bold',
              marginTop: 2,
              marginBottom: 1
            },
            '& .ProseMirror h2': {
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginTop: 2,
              marginBottom: 1
            },
            '& .ProseMirror h3': {
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginTop: 2,
              marginBottom: 1
            },
            '& .ProseMirror ul, & .ProseMirror ol': {
              paddingLeft: 3,
              marginBottom: 1
            },
            '& .ProseMirror img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              marginTop: 1,
              marginBottom: 1
            },
            '& .ProseMirror a': {
              color: 'primary.main',
              textDecoration: 'underline'
            }
          }}
        >
          <EditorContent editor={editor} />
        </Box>

        <LinkBubble editor={editor} />
      </Paper>

      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  )
}

export default TextEditor
