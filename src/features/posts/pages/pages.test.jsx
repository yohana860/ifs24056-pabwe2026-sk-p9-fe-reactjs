import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { apiError, renderWithProviders } from '../../../test/utils'
import * as api from '../api/postApi'
import AuthorDashboardPage from './AuthorDashboardPage'
import AuthorPostDetailPage from './AuthorPostDetailPage'
import HomePage from './HomePage'
import PostDetailPage from './PostDetailPage'

vi.mock('../api/postApi')
vi.mock('../components/MarkdownViewer', () => ({ default: ({ content }) => <div data-testid="viewer">{content}</div> }))
vi.mock('../components/MarkdownEditor', () => ({
  default: ({ initialValue, onChange }) => <textarea aria-label="Editor Markdown" defaultValue={initialValue} onChange={(e) => onChange(e.target.value)} />,
}))

const pub = (id, extra = {}) => ({ id, slug: `artikel-${id}`, title: `Artikel ${id}`, category: 'Teknologi', excerpt: 'ringkas', author: { username: 'budi' }, published_at: '2026-01-02T00:00:00Z', reading_time: 2, cover_image_path: '', ...extra })

describe('HomePage (publik)', () => {
  beforeEach(() => {
    api.listCategories.mockResolvedValue(['Teknologi', 'Umum'])
  })

  it('menampilkan galeri artikel, pencarian real-time, dan filter kategori', async () => {
    api.listPublicPosts.mockResolvedValue([pub(1), pub(2)])
    renderWithProviders(<HomePage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(await screen.findByText('Artikel 1')).toBeInTheDocument()
    expect(api.listPublicPosts).toHaveBeenCalledWith({})
    expect(screen.getByRole('button', { name: 'Semua' })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.type(screen.getByLabelText('Cari artikel'), 'go')
    await waitFor(() => expect(api.listPublicPosts).toHaveBeenLastCalledWith({ q: 'go' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Umum' }))
    await waitFor(() => expect(api.listPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: 'Umum' }))
    expect(screen.getByRole('button', { name: 'Umum' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Semua' }))
    await waitFor(() => expect(api.listPublicPosts).toHaveBeenLastCalledWith({ q: 'go' }))
  })

  it('state kosong', async () => {
    api.listPublicPosts.mockResolvedValue([])
    renderWithProviders(<HomePage />)
    expect(await screen.findByText('Belum ada artikel yang cocok.')).toBeInTheDocument()
  })

  it('error artikel dari server; kategori gagal tetap menampilkan Semua', async () => {
    api.listCategories.mockImplementation(() => Promise.reject(new Error('x')))
    api.listPublicPosts.mockImplementation(() => Promise.reject(apiError('server mati', 500)))
    renderWithProviders(<HomePage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('server mati')
    expect(screen.getByRole('button', { name: 'Semua' })).toBeInTheDocument()
  })

  it('fallback pesan error artikel', async () => {
    api.listPublicPosts.mockImplementation(() => Promise.reject(new Error('x')))
    renderWithProviders(<HomePage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Artikel gagal dimuat.')
  })

  it('error hilang saat pencarian berikutnya berhasil', async () => {
    api.listPublicPosts.mockRejectedValueOnce(new Error('x')).mockResolvedValue([pub(1)])
    renderWithProviders(<HomePage />)
    await screen.findByRole('alert')
    await userEvent.type(screen.getByLabelText('Cari artikel'), 'a')
    expect(await screen.findByText('Artikel 1')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('PostDetailPage (publik)', () => {
  const setup = () =>
    renderWithProviders(<Routes><Route path="/posts/:slug" element={<PostDetailPage />} /></Routes>, { route: '/posts/halo' })

  it('menampilkan artikel dengan cover, penulis, reading time, dan viewer markdown', async () => {
    api.getPublicPost.mockResolvedValue({ ...pub(1), content: '# Isi', cover_image_path: 'https://i.test/c.png', reading_time: 4 })
    setup()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(await screen.findByText('Artikel 1')).toBeInTheDocument()
    expect(api.getPublicPost).toHaveBeenCalledWith('halo')
    expect(screen.getByAltText('Sampul Artikel 1')).toBeInTheDocument()
    expect(screen.getByText(/Oleh budi/)).toHaveTextContent('4 menit baca')
    expect(screen.getByTestId('viewer')).toHaveTextContent('# Isi')
  })

  it('tanpa cover', async () => {
    api.getPublicPost.mockResolvedValue({ ...pub(1), content: 'x' })
    setup()
    await screen.findByText('Artikel 1')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('artikel draf/tidak ada: pesan server dan fallback', async () => {
    api.getPublicPost.mockRejectedValueOnce(apiError('artikel tidak ditemukan', 404)).mockRejectedValueOnce(new Error('x'))
    const { unmount } = setup()
    expect(await screen.findByRole('alert')).toHaveTextContent('artikel tidak ditemukan')
    expect(screen.getByText('← Semua artikel')).toHaveAttribute('href', '/')
    unmount()
    setup()
    expect(await screen.findByRole('alert')).toHaveTextContent('Artikel tidak ditemukan.')
  })
})

describe('AuthorPostDetailPage', () => {
  const setup = () =>
    renderWithProviders(<Routes><Route path="/author/posts/:id" element={<AuthorPostDetailPage />} /></Routes>, { route: '/author/posts/3' })

  it('menampilkan detail artikel sendiri (terbit dan draf)', async () => {
    api.getMyPost.mockResolvedValueOnce({ id: 3, title: 'Milik Saya', category: 'Umum', is_published: true, slug: 's', content: '# Isi' })
    const { unmount } = setup()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(await screen.findByText('Milik Saya')).toBeInTheDocument()
    expect(screen.getByText(/Terbit/)).toBeInTheDocument()
    expect(screen.getByTestId('viewer')).toHaveTextContent('# Isi')
    unmount()
    api.getMyPost.mockResolvedValueOnce({ id: 3, title: 'Konsep', category: 'Umum', is_published: false, slug: 's', content: 'x' })
    setup()
    expect(await screen.findByText(/Draf/)).toBeInTheDocument()
  })

  it('error: server dan fallback', async () => {
    api.getMyPost.mockRejectedValueOnce(apiError('artikel tidak ditemukan', 404)).mockRejectedValueOnce(new Error('x'))
    const { unmount } = setup()
    expect(await screen.findByRole('alert')).toHaveTextContent('artikel tidak ditemukan')
    expect(screen.getByText('← Kembali ke dashboard')).toHaveAttribute('href', '/author')
    unmount()
    setup()
    expect(await screen.findByRole('alert')).toHaveTextContent('Artikel tidak dapat dimuat.')
  })
})

describe('AuthorDashboardPage', () => {
  const mine = [
    { id: 1, title: 'Terbit Satu', category: 'Umum', is_published: true, published_at: '2026-01-02T00:00:00Z', slug: 'a', content: 'c', excerpt: '', cover_image_path: '' },
    { id: 2, title: 'Draf Dua', category: 'Bisnis', is_published: false, published_at: null, slug: 'b', content: 'c', excerpt: '', cover_image_path: '' },
  ]
  const mockLoad = () => {
    api.getPostStats.mockResolvedValue({ total: 2, total_terbit: 1, belum_selesai: 1 })
    api.listMyPosts.mockResolvedValue(mine)
    api.listCategories.mockResolvedValue(['Teknologi', 'Umum'])
  }
  const setup = () =>
    renderWithProviders(
      <Routes>
        <Route path="/author" element={<AuthorDashboardPage />} />
        <Route path="/author/posts/:id" element={<p>halaman detail penulis</p>} />
      </Routes>,
      { route: '/author' },
    )

  it('statistik dari API dan daftar artikel dalam tabel', async () => {
    mockLoad()
    setup()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(await screen.findByText('Terbit Satu')).toBeInTheDocument()
    expect(screen.getByTestId('stat-Total Artikel')).toHaveTextContent('2')
    expect(screen.getByTestId('stat-Total Terbit')).toHaveTextContent('1')
    expect(screen.getByTestId('stat-Draf')).toHaveTextContent('1')
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('state kosong dan error + coba lagi (server & fallback)', async () => {
    api.getPostStats.mockResolvedValue({ total: 0, total_terbit: 0, belum_selesai: 0 })
    api.listMyPosts.mockResolvedValueOnce([])
    api.listCategories.mockResolvedValue([])
    const { unmount } = setup()
    expect(await screen.findByText(/Belum ada artikel/)).toBeInTheDocument()
    unmount()

    api.getPostStats.mockRejectedValueOnce(apiError('server mati', 500))
    api.listMyPosts.mockResolvedValue(mine)
    setup()
    expect(await screen.findByRole('alert')).toHaveTextContent('server mati')
    api.getPostStats.mockResolvedValue({ total: 2, total_terbit: 1, belum_selesai: 1 })
    await userEvent.click(screen.getByText('Coba lagi'))
    expect(await screen.findByText('Terbit Satu')).toBeInTheDocument()
  })

  it('fallback pesan error memuat', async () => {
    api.getPostStats.mockRejectedValueOnce(new Error('x'))
    api.listMyPosts.mockResolvedValue([])
    api.listCategories.mockResolvedValue([])
    setup()
    expect(await screen.findByText(/Gagal memuat data\./)).toBeInTheDocument()
  })

  it('toggle publikasi: terbitkan, kembalikan ke draf, dan gagal', async () => {
    mockLoad()
    api.togglePublish.mockResolvedValueOnce({}).mockResolvedValueOnce({}).mockRejectedValueOnce(apiError('ditolak', 403)).mockRejectedValueOnce(new Error('x'))
    setup()
    await screen.findByText('Terbit Satu')
    await userEvent.click(screen.getByLabelText('Status publikasi: Draf Dua'))
    expect(await screen.findByText('Artikel berhasil diterbitkan.')).toBeInTheDocument()
    expect(api.togglePublish).toHaveBeenCalledWith(2)
    await userEvent.click(screen.getByLabelText('Status publikasi: Terbit Satu'))
    expect(await screen.findByText('Artikel dikembalikan menjadi draf.')).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Status publikasi: Terbit Satu'))
    expect(await screen.findByText('ditolak')).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Status publikasi: Terbit Satu'))
    expect(await screen.findByText('Gagal mengubah status publikasi.')).toBeInTheDocument()
  })

  it('kebab: Detail menavigasi dan Edit membuka modal', async () => {
    mockLoad()
    setup()
    await screen.findByText('Terbit Satu')
    await userEvent.click(screen.getByLabelText('Aksi untuk Draf Dua'))
    await userEvent.click(screen.getByRole('menuitem', { name: /Edit/ }))
    expect(screen.getByRole('dialog', { name: 'Edit Artikel' })).toBeInTheDocument()
    await userEvent.click(screen.getByText('Batal'))
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(screen.getByLabelText('Aksi untuk Draf Dua'))
    await userEvent.click(screen.getByRole('menuitem', { name: /Detail/ }))
    expect(await screen.findByText('halaman detail penulis')).toBeInTheDocument()
  })

  it('hapus dengan konfirmasi: batal, sukses, gagal (server & fallback)', async () => {
    mockLoad()
    api.deletePost.mockResolvedValueOnce({}).mockRejectedValueOnce(apiError('tidak boleh', 403)).mockRejectedValueOnce(new Error('x'))
    setup()
    await screen.findByText('Terbit Satu')
    const open = async () => {
      await userEvent.click(screen.getByLabelText('Aksi untuk Terbit Satu'))
      await userEvent.click(screen.getByRole('menuitem', { name: /Hapus/ }))
    }
    await open()
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Terbit Satu')
    await userEvent.click(screen.getByText('Batal'))
    expect(api.deletePost).not.toHaveBeenCalled()
    await open()
    await userEvent.click(within(screen.getByRole('alertdialog')).getByText('Hapus'))
    expect(await screen.findByText('Artikel berhasil dihapus.')).toBeInTheDocument()
    expect(api.deletePost).toHaveBeenCalledWith(1)
    await open()
    await userEvent.click(within(screen.getByRole('alertdialog')).getByText('Hapus'))
    expect(await screen.findByText('tidak boleh')).toBeInTheDocument()
    await open()
    await userEvent.click(within(screen.getByRole('alertdialog')).getByText('Hapus'))
    expect(await screen.findByText('Gagal menghapus artikel.')).toBeInTheDocument()
  })

  it('tulis artikel baru lalu memuat ulang data', async () => {
    mockLoad()
    api.createPost.mockResolvedValue({})
    setup()
    await screen.findByText('Terbit Satu')
    const before = api.getPostStats.mock.calls.length
    await userEvent.click(screen.getByText('+ Tulis Artikel'))
    await userEvent.type(screen.getByLabelText('Judul'), 'Baru')
    await userEvent.type(screen.getByLabelText('Editor Markdown'), 'isi')
    await userEvent.click(screen.getByText('Simpan'))
    expect(await screen.findByText('Artikel berhasil dibuat sebagai draf.')).toBeInTheDocument()
    await waitFor(() => expect(api.getPostStats.mock.calls.length).toBeGreaterThan(before))
  })

  it('AI Blog Generator: tutup dan terapkan hasil ke editor artikel', async () => {
    mockLoad()
    api.aiGeneratePost.mockResolvedValue({ title: 'Dari AI', category: 'Teknologi', excerpt: 'e', content: '# AI', searched: false, sources: [] })
    setup()
    await screen.findByText('Terbit Satu')
    await userEvent.click(screen.getByText('✨ AI Blog Generator'))
    await userEvent.click(screen.getByText('Batal'))
    expect(screen.queryByRole('dialog')).toBeNull()

    await userEvent.click(screen.getByText('✨ AI Blog Generator'))
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'Topik apa saja')
    await userEvent.click(screen.getByText('Buat Draf'))
    await screen.findByLabelText('Pratinjau draf AI')
    await userEvent.click(screen.getByText('Terapkan ke Editor'))
    expect(screen.getByRole('dialog', { name: 'Tulis Artikel' })).toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toHaveValue('Dari AI')
    expect(screen.getByLabelText('Editor Markdown')).toHaveValue('# AI')
  })
})
