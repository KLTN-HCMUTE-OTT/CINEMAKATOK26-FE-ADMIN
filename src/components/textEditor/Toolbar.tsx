'use client'

import React, { useState, useRef } from 'react'

import { type Editor } from '@tiptap/react'
import { Box, IconButton, Divider, Tooltip, CircularProgress } from '@mui/material'

import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '@/configs/cloudinary'

type ToolbarProps = {
  editor: Editor
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data = await response.json()

    return data.secure_url
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')

      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')

      return
    }

    try {
      setUploading(true)
      const url = await uploadImageToCloudinary(file)

      editor.chain().focus().setImage({ src: url }).run()
    } catch (err: any) {
      console.error('Error uploading image:', err)
      alert(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const addImage = () => {
    fileInputRef.current?.click()
  }

  const setLink = () => {
    const url = window.prompt('Enter URL:')

    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const removeImage = () => {
    editor.chain().focus().deleteSelection().run()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      <Tooltip title='Bold'>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleBold().run()}
          color={editor.isActive('bold') ? 'primary' : 'default'}
        >
          <i className='ri-bold' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Italic'>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          color={editor.isActive('italic') ? 'primary' : 'default'}
        >
          <i className='ri-italic' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Strike'>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleStrike().run()}
          color={editor.isActive('strike') ? 'primary' : 'default'}
        >
          <i className='ri-strikethrough' />
        </IconButton>
      </Tooltip>

      <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

      <Tooltip title='Heading 1'>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
        >
          <i className='ri-h-1' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Heading 2'>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
        >
          <i className='ri-h-2' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Heading 3'>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          color={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
        >
          <i className='ri-h-3' />
        </IconButton>
      </Tooltip>

      <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

      <Tooltip title='Bullet List'>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          color={editor.isActive('bulletList') ? 'primary' : 'default'}
        >
          <i className='ri-list-unordered' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Ordered List'>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          color={editor.isActive('orderedList') ? 'primary' : 'default'}
        >
          <i className='ri-list-ordered' />
        </IconButton>
      </Tooltip>

      <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

      <Tooltip title='Code Block'>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          color={editor.isActive('codeBlock') ? 'primary' : 'default'}
        >
          <i className='ri-code-box-line' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Blockquote'>
        <IconButton
          size='small'
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          color={editor.isActive('blockquote') ? 'primary' : 'default'}
        >
          <i className='ri-double-quotes-l' />
        </IconButton>
      </Tooltip>

      <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

      <Tooltip title='Add Link'>
        <IconButton size='small' onClick={setLink} color={editor.isActive('link') ? 'primary' : 'default'}>
          <i className='ri-link' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Add Image'>
        <IconButton size='small' onClick={addImage} disabled={uploading}>
          {uploading ? <CircularProgress size={20} /> : <i className='ri-image-add-line' />}
        </IconButton>
      </Tooltip>

      <Tooltip title='Remove Image'>
        <IconButton
          size='small'
          onClick={removeImage}
          disabled={!editor.isActive('image')}
          color={editor.isActive('image') ? 'error' : 'default'}
        >
          <i className='ri-delete-bin-line' />
        </IconButton>
      </Tooltip>

      <input type='file' ref={fileInputRef} onChange={handleImageUpload} accept='image/*' style={{ display: 'none' }} />

      <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

      <Tooltip title='Undo'>
        <IconButton size='small' onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <i className='ri-arrow-go-back-line' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Redo'>
        <IconButton size='small' onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <i className='ri-arrow-go-forward-line' />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default Toolbar
