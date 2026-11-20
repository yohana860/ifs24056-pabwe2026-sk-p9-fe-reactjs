import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

// Pembungkus TOAST UI Editor. initialValue dan dark hanya dibaca saat dibuat (ganti `key` untuk membuat ulang).
export default function MarkdownEditor({ initialValue, onChange, dark }) {
  const host = useRef(null)
  const options = useRef({ initialValue, dark })
  const handler = useRef(onChange)

  useEffect(() => {
    handler.current = onChange
  })

  useEffect(() => {
    const editor = new Editor({
      el: host.current,
      height: '520px',
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      initialValue: options.current.initialValue,
      theme: options.current.dark ? 'dark' : 'light',
      usageStatistics: false,
    })
    editor.on('change', () => handler.current(editor.getMarkdown()))
    return () => editor.destroy()
  }, [])

  return <div ref={host} data-testid="markdown-editor" />
}
