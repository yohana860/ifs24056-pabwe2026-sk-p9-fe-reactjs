import { render, screen } from '@testing-library/react'
import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

const created = []

vi.mock('@toast-ui/editor', () => ({
  default: class FakeEditor {
    constructor(options) {
      this.options = options
      this.listeners = {}
      this.destroy = vi.fn()
      created.push(this)
    }
    on(event, fn) { this.listeners[event] = fn }
    getMarkdown() { return this.value }
  },
}))
vi.mock('@toast-ui/editor/dist/toastui-editor-viewer', () => ({
  default: class FakeViewer {
    constructor(options) {
      this.options = options
      this.setMarkdown = vi.fn()
      this.destroy = vi.fn()
      created.push(this)
    }
  },
}))

beforeEach(() => { created.length = 0 })

describe('MarkdownEditor (TOAST UI Editor)', () => {
  it('membuat editor markdown dengan preview, menyinkronkan perubahan ke state, dan destroy saat unmount', () => {
    const onChange = vi.fn()
    const { unmount } = render(<MarkdownEditor initialValue="# Awal" onChange={onChange} dark={false} />)
    const editor = created[0]
    expect(screen.getByTestId('markdown-editor')).toBe(editor.options.el)
    expect(editor.options).toMatchObject({ initialValue: '# Awal', theme: 'light', initialEditType: 'markdown', previewStyle: 'vertical', usageStatistics: false })
    editor.value = '# Baru'
    editor.listeners.change()
    expect(onChange).toHaveBeenCalledWith('# Baru')
    unmount()
    expect(editor.destroy).toHaveBeenCalledTimes(1)
  })

  it('tema gelap', () => {
    render(<MarkdownEditor initialValue="" onChange={() => {}} dark />)
    expect(created[0].options.theme).toBe('dark')
  })

  it('selalu memakai onChange terbaru', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<MarkdownEditor initialValue="" onChange={first} />)
    rerender(<MarkdownEditor initialValue="" onChange={second} />)
    created[0].value = 'x'
    created[0].listeners.change()
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith('x')
  })
})

describe('MarkdownViewer (TOAST UI Viewer)', () => {
  it('merender markdown, memperbarui saat konten berubah, dan destroy saat unmount', () => {
    const { rerender, unmount } = render(<MarkdownViewer content="# Satu" />)
    const viewer = created[0]
    expect(screen.getByTestId('markdown-viewer')).toBe(viewer.options.el)
    expect(viewer.setMarkdown).toHaveBeenLastCalledWith('# Satu')
    rerender(<MarkdownViewer content="# Dua" />)
    expect(viewer.setMarkdown).toHaveBeenLastCalledWith('# Dua')
    unmount()
    expect(viewer.destroy).toHaveBeenCalledTimes(1)
  })
})
