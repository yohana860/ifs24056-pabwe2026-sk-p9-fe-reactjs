import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiError, renderWithProviders } from '../../../test/utils'
import * as api from '../api/postApi'
import AIBlogModal from './AIBlogModal'
import PostCard from './PostCard'
import PostModal from './PostModal'
import PostTable from './PostTable'

vi.mock('../api/postApi')
vi.mock('./MarkdownEditor', () => ({
  default: ({ initialValue, onChange, dark }) => (
    <textarea aria-label="Editor Markdown" data-dark={String(dark)} defaultValue={initialValue} onChange={(e) => onChange(e.target.value)} />
  ),
}))
vi.mock('./MarkdownViewer', () => ({ default: ({ content }) => <div data-testid="viewer">{content}</div> }))

const categories = ['Teknologi', 'Umum']

describe('PostCard', () => {
  const base = { id: 1, slug: 'halo', title: 'Halo', category: 'Teknologi', excerpt: 'Ringkas', author: { username: 'budi' }, published_at: '2026-01-02T00:00:00Z', reading_time: 3 }

  it('dengan cover', () => {
    renderWithProviders(<PostCard post={{ ...base, cover_image_path: 'https://img.test/a.png' }} />)
    expect(screen.getByAltText('Sampul Halo')).toHaveAttribute('src', 'https://img.test/a.png')
    expect(screen.getByText('Halo')).toHaveAttribute('href', '/posts/halo')
    expect(screen.getByText(/budi/)).toHaveTextContent('3 mnt baca')
  })

  it('tanpa cover memakai placeholder', () => {
    renderWithProviders(<PostCard post={{ ...base, cover_image_path: '' }} />)
    expect(screen.queryByRole('img')).toBeNull()
  })
})

describe('PostTable', () => {
  const posts = [
    { id: 1, title: 'Terbit', category: 'Umum', is_published: true, published_at: '2026-01-02T00:00:00Z' },
    { id: 2, title: 'Konsep', category: 'Bisnis', is_published: false, published_at: null },
  ]
  it('toggle status dan kebab menu Detail/Edit/Hapus', async () => {
    const h = { onToggle: vi.fn(), onDetail: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() }
    renderWithProviders(<PostTable posts={posts} {...h} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByLabelText('Status publikasi: Terbit')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByLabelText('Status publikasi: Konsep')).toHaveTextContent('Draf')
    await userEvent.click(screen.getByLabelText('Status publikasi: Konsep'))
    expect(h.onToggle).toHaveBeenCalledWith(posts[1])
    for (const [label, fn] of [['Detail', h.onDetail], ['Edit', h.onEdit], ['Hapus', h.onDelete]]) {
      await userEvent.click(screen.getByLabelText('Aksi untuk Terbit'))
      await userEvent.click(screen.getByRole('menuitem', { name: new RegExp(label) }))
      expect(fn).toHaveBeenCalledWith(posts[0])
    }
  })
})

describe('PostModal', () => {
  const setup = (props = {}) => {
    const onClose = vi.fn()
    const onSaved = vi.fn()
    renderWithProviders(<PostModal categories={categories} onClose={onClose} onSaved={onSaved} {...props} />)
    return { onClose, onSaved }
  }

  it('validasi judul dan konten', async () => {
    setup()
    await userEvent.click(screen.getByText('Simpan'))
    expect(screen.getByRole('alert')).toHaveTextContent('Judul wajib diisi.')
    await userEvent.type(screen.getByLabelText('Judul'), 'Judul')
    await userEvent.click(screen.getByText('Simpan'))
    expect(screen.getByRole('alert')).toHaveTextContent('Konten artikel wajib diisi.')
    expect(api.createPost).not.toHaveBeenCalled()
  })

  it('membuat artikel baru dari editor', async () => {
    api.createPost.mockResolvedValue({})
    const { onSaved } = setup()
    expect(screen.getByRole('dialog', { name: 'Tulis Artikel' })).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Judul'), '  Artikel  ')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Umum')
    await userEvent.type(screen.getByLabelText('URL gambar sampul'), 'https://i.test/x.png')
    await userEvent.type(screen.getByLabelText('Ringkasan (excerpt)'), 'ringkas')
    await userEvent.type(screen.getByLabelText('Editor Markdown'), 'isi')
    await userEvent.click(screen.getByText('Simpan'))
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('Artikel berhasil dibuat sebagai draf.'))
    expect(api.createPost).toHaveBeenCalledWith({ title: 'Artikel', category: 'Umum', excerpt: 'ringkas', cover_image_path: 'https://i.test/x.png', content: 'isi' })
  })

  it('mengedit artikel yang ada', async () => {
    api.updatePost.mockResolvedValue({})
    const post = { id: 5, title: 'Lama', category: 'Umum', excerpt: 'e', cover_image_path: '', content: 'konten lama' }
    const { onSaved } = setup({ post })
    expect(screen.getByRole('dialog', { name: 'Edit Artikel' })).toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toHaveValue('Lama')
    expect(screen.getByLabelText('Editor Markdown')).toHaveValue('konten lama')
    await userEvent.click(screen.getByText('Simpan'))
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('Artikel berhasil diperbarui.'))
    expect(api.updatePost).toHaveBeenCalledWith(5, expect.objectContaining({ title: 'Lama', content: 'konten lama' }))
  })

  it('draf AI mengisi form dan kategori default dari daftar', async () => {
    setup({ draft: { title: 'Dari AI', category: 'Teknologi', excerpt: 'x', content: '# AI' } })
    expect(screen.getByLabelText('Judul')).toHaveValue('Dari AI')
    expect(screen.getByLabelText('Editor Markdown')).toHaveValue('# AI')
  })

  it('mode gelap/terang pada editor', async () => {
    setup()
    expect(screen.getByLabelText('Editor Markdown')).toHaveAttribute('data-dark', 'false')
    await userEvent.click(screen.getByText('🌙 Mode gelap'))
    expect(screen.getByLabelText('Editor Markdown')).toHaveAttribute('data-dark', 'true')
    await userEvent.click(screen.getByText('☀️ Mode terang'))
    expect(screen.getByLabelText('Editor Markdown')).toHaveAttribute('data-dark', 'false')
  })

  it('error server dan fallback; Batal menutup', async () => {
    api.createPost.mockRejectedValueOnce(apiError('cover tidak valid')).mockRejectedValueOnce(new Error('x'))
    const { onClose } = setup({ draft: { title: 'T', category: 'Umum', excerpt: '', content: 'c' } })
    await userEvent.click(screen.getByText('Simpan'))
    expect(await screen.findByText('cover tidak valid')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Simpan'))
    expect(await screen.findByText('Gagal menyimpan artikel.')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Batal'))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('AIBlogModal', () => {
  const draft = { title: 'Berita Go', category: 'Teknologi', excerpt: 'Ringkas', content: '# Isi [1]', searched: true, sources: [{ title: 'Rilis Go', url: 'https://go.dev/blog', snippet: 's' }] }
  const setup = () => {
    const onClose = vi.fn()
    const onApply = vi.fn()
    renderWithProviders(<AIBlogModal categories={categories} onClose={onClose} onApply={onApply} />)
    return { onClose, onApply }
  }

  it('validasi topik', async () => {
    setup()
    expect(screen.getByText('Terapkan ke Editor')).toBeDisabled()
    await userEvent.click(screen.getByText('Buat Draf'))
    expect(screen.getByRole('alert')).toHaveTextContent('Topik minimal 3 karakter.')
  })

  it('membuat draf dengan search engine, menampilkan sumber transparan, lalu menerapkan', async () => {
    api.aiGeneratePost.mockResolvedValue(draft)
    const { onApply } = setup()
    await userEvent.type(screen.getByLabelText('Topik artikel'), ' Rilis Go ')
    await userEvent.selectOptions(screen.getByLabelText('Kategori (opsional)'), 'Teknologi')
    await userEvent.click(screen.getByText('Buat Draf'))
    const preview = await screen.findByLabelText('Pratinjau draf AI')
    expect(api.aiGeneratePost).toHaveBeenCalledWith({ topic: 'Rilis Go', include_web_search: true, category: 'Teknologi' })
    expect(within(preview).getByTestId('viewer')).toHaveTextContent('# Isi [1]')
    const link = within(screen.getByLabelText('Sumber rujukan')).getByText('Rilis Go')
    expect(link).toHaveAttribute('href', 'https://go.dev/blog')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await userEvent.click(screen.getByText('Terapkan ke Editor'))
    expect(onApply).toHaveBeenCalledWith(draft)
  })

  it('tanpa penelusuran web: tidak mengklaim ada sumber', async () => {
    api.aiGeneratePost.mockResolvedValue({ ...draft, searched: false, sources: [] })
    setup()
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'Topik')
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByText('Buat Draf'))
    expect(await screen.findByText('Draf dibuat tanpa penelusuran web.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Sumber rujukan')).toBeNull()
    expect(api.aiGeneratePost).toHaveBeenCalledWith({ topic: 'Topik', include_web_search: false })
  })

  it('loading dan error (server & fallback) menghapus draf lama', async () => {
    api.aiGeneratePost.mockResolvedValueOnce(draft).mockRejectedValueOnce(apiError('Penelusuran Search Engine gagal', 502)).mockRejectedValueOnce(new Error('x')).mockReturnValueOnce(new Promise(() => {}))
    setup()
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'Topik')
    await userEvent.click(screen.getByText('Buat Draf'))
    await screen.findByLabelText('Pratinjau draf AI')
    await userEvent.click(screen.getByText('Buat Draf'))
    expect(await screen.findByText('Penelusuran Search Engine gagal')).toBeInTheDocument()
    expect(screen.queryByLabelText('Pratinjau draf AI')).toBeNull()
    await userEvent.click(screen.getByText('Buat Draf'))
    expect(await screen.findByText('AI gagal membuat artikel.')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Buat Draf'))
    expect(screen.getByText('AI sedang menulis...')).toBeDisabled()
  })

  it('Batal menutup modal', async () => {
    const { onClose } = setup()
    await userEvent.click(screen.getByText('Batal'))
    expect(onClose).toHaveBeenCalled()
  })
})
