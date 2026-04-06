'use client'

import React, { useEffect } from 'react'

import { useEditor, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

import TextEditor from './TextEditor'

interface QuestionEditorProps {
  content: JSONContent | string
  onChange: (content: JSONContent) => void
  editorRef?: (editor: any) => void
  error?: string
}

const BlogEditor: React.FC<QuestionEditorProps> = ({ content, onChange, editorRef, error }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({
        HTMLAttributes: {
          class: 'text-primary-500 underline',
          target: '_blank',
          rel: 'noopener noreferrer'
        },
        openOnClick: false
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      })
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] p-4'
      }
    }
  })

  useEffect(() => {
    if (editorRef && editor) {
      editorRef(editor) // expose instance editor cho parent
    }
  }, [editor, editorRef])

  useEffect(() => {
    if (editor && content && typeof content === 'string') {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return <TextEditor editor={editor} error={error} />
}

export default BlogEditor
