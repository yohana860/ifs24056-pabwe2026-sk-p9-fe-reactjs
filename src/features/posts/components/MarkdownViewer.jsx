import { useEffect, useRef } from 'react'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

// Menampilkan Markdown sebagai HTML yang telah disanitasi oleh TOAST UI Viewer (aman dari XSS).
export default function MarkdownViewer({ content }) {
  const host = useRef(null)
  const viewer = useRef(null)

  useEffect(() => {
    viewer.current = new Viewer({ el: host.current, initialValue: '', usageStatistics: false })
    return () => viewer.current.destroy()
  }, [])

  useEffect(() => {
    viewer.current.setMarkdown(content)
  }, [content])

  return <div ref={host} data-testid="markdown-viewer" className="prose max-w-none" />
}
