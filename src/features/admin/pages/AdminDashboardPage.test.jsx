import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiError, renderWithProviders } from '../../../test/utils'
import * as api from '../api/adminApi'
import AdminDashboardPage from './AdminDashboardPage'

vi.mock('../api/adminApi')

const users = [
  { id: 1, username: 'admin', email: 'a@x.co', role: 'admin', total_posts: 0, total_published: 0 },
  { id: 2, username: 'penulis', email: 'p@x.co', role: 'author', total_posts: 3, total_published: 2 },
]
const posts = [
  { id: 1, title: 'Artikel A', author: 'penulis', category: 'Umum', is_published: true, created_at: '2026-01-02T00:00:00Z' },
  { id: 2, title: 'Artikel B', author: 'penulis', category: 'Bisnis', is_published: false, created_at: '2026-01-03T00:00:00Z' },
]

describe('AdminDashboardPage', () => {
  it('statistik sistem, direktori pengguna (ID, username, email, role, jumlah artikel), dan arsip artikel', async () => {
    api.listUsers.mockResolvedValue(users)
    api.listPosts.mockResolvedValue(posts)
    renderWithProviders(<AdminDashboardPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(await screen.findByText('p@x.co')).toBeInTheDocument()
    expect(screen.getByTestId('stat-users')).toHaveTextContent('2')
    expect(screen.getByTestId('stat-posts')).toHaveTextContent('3')
    expect(screen.getByTestId('stat-published')).toHaveTextContent('2')
    const row = screen.getByText('p@x.co').closest('tr')
    expect(row).toHaveTextContent('author')
    const archive = screen.getByLabelText('Arsip artikel')
    expect(within(archive).getByText('Artikel A')).toBeInTheDocument()
    expect(within(archive).getByText('Terbit')).toBeInTheDocument()
    expect(within(archive).getByText('Draf')).toBeInTheDocument()
  })

  it('arsip kosong', async () => {
    api.listUsers.mockResolvedValue(users)
    api.listPosts.mockResolvedValue([])
    renderWithProviders(<AdminDashboardPage />)
    expect(await screen.findByText('Belum ada artikel di sistem.')).toBeInTheDocument()
  })

  it('melihat artikel per pengguna (ada isi, kosong) dan error (server & fallback)', async () => {
    api.listUsers.mockResolvedValue(users)
    api.listPosts.mockResolvedValue(posts)
    api.listUserPosts
      .mockResolvedValueOnce({ user: { username: 'penulis' }, posts: [posts[0]] })
      .mockResolvedValueOnce({ user: { username: 'admin' }, posts: [] })
      .mockRejectedValueOnce(apiError('pengguna tidak ditemukan', 404))
      .mockRejectedValueOnce(new Error('x'))
    renderWithProviders(<AdminDashboardPage />)
    const buttons = await screen.findAllByText('Lihat Artikel')
    await userEvent.click(buttons[1])
    const section = await screen.findByLabelText('Artikel pengguna')
    expect(section).toHaveTextContent('Artikel milik penulis')
    expect(api.listUserPosts).toHaveBeenCalledWith(2)
    await userEvent.click(buttons[0])
    expect(await screen.findByText('Pengguna ini belum menulis artikel.')).toBeInTheDocument()
    await userEvent.click(buttons[0])
    expect(await screen.findByText('pengguna tidak ditemukan')).toBeInTheDocument()
    await userEvent.click(buttons[0])
    expect(await screen.findByText('Artikel pengguna gagal dimuat.')).toBeInTheDocument()
  })

  it('error memuat monitoring (server & fallback)', async () => {
    api.listUsers.mockRejectedValueOnce(apiError('hanya admin', 403))
    api.listPosts.mockResolvedValue([])
    const { unmount } = renderWithProviders(<AdminDashboardPage />)
    expect(await screen.findByText('hanya admin')).toBeInTheDocument()
    unmount()
    api.listUsers.mockRejectedValueOnce(new Error('x'))
    renderWithProviders(<AdminDashboardPage />)
    expect(await screen.findByText('Data monitoring gagal dimuat.')).toBeInTheDocument()
  })
})
