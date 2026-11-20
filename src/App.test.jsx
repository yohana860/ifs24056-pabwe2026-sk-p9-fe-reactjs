import { screen } from '@testing-library/react'
import { renderWithProviders } from './test/utils'
import App from './App'

vi.mock('./features/posts/api/postApi', () => ({
  listCategories: vi.fn().mockResolvedValue([]),
  listPublicPosts: vi.fn().mockResolvedValue([]),
  getPostStats: vi.fn().mockResolvedValue({ total: 0, total_terbit: 0, belum_selesai: 0 }),
  listMyPosts: vi.fn().mockResolvedValue([]),
  getMyPost: vi.fn().mockReturnValue(new Promise(() => {})),
  getPublicPost: vi.fn().mockReturnValue(new Promise(() => {})),
}))
vi.mock('./features/admin/api/adminApi', () => ({ listUsers: vi.fn().mockResolvedValue([]), listPosts: vi.fn().mockResolvedValue([]) }))

describe('App routing', () => {
  it('halaman publik (/ dan /public) tanpa login, dengan sticky navbar dan tanpa sidebar', async () => {
    const { unmount } = renderWithProviders(<App />, { route: '/' })
    expect(await screen.findByText('Artikel Terbaru')).toBeInTheDocument()
    expect(screen.getByRole('navigation').className).toContain('sticky')
    expect(screen.queryByRole('complementary')).toBeNull()
    unmount()
    renderWithProviders(<App />, { route: '/public' })
    expect(await screen.findByText('Artikel Terbaru')).toBeInTheDocument()
  })

  it('detail artikel publik, login, dan register dapat diakses guest', () => {
    const { unmount } = renderWithProviders(<App />, { route: '/posts/halo' })
    expect(screen.getByRole('status')).toBeInTheDocument()
    unmount()
    const second = renderWithProviders(<App />, { route: '/login' })
    expect(document.getElementById('login-submit')).toBeInTheDocument()
    second.unmount()
    renderWithProviders(<App />, { route: '/register' })
    expect(document.getElementById('register-submit')).toBeInTheDocument()
  })

  it('guest tidak bisa masuk /author, detail penulis, atau /admin', () => {
    for (const route of ['/author', '/author/posts/1', '/admin']) {
      const { unmount } = renderWithProviders(<App />, { route })
      expect(document.getElementById('login-username')).toBeInTheDocument()
      unmount()
    }
  })

  it('author tidak bisa masuk admin; admin diarahkan dari /author', async () => {
    const { unmount } = renderWithProviders(<App />, { route: '/admin', auth: { user: { username: 'p', role: 'author' } } })
    expect(await screen.findByText('Dashboard Penulis', { selector: 'h1' })).toBeInTheDocument()
    unmount()
    renderWithProviders(<App />, { route: '/author', auth: { user: { username: 'a', role: 'admin' } } })
    expect(await screen.findByText('Monitoring Admin')).toBeInTheDocument()
  })

  it('detail artikel penulis untuk author', () => {
    renderWithProviders(<App />, { route: '/author/posts/1', auth: { user: { username: 'p', role: 'author' } } })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('rute tidak dikenal menampilkan 404', () => {
    renderWithProviders(<App />, { route: '/tidak-ada' })
    expect(screen.getByText('404')).toBeInTheDocument()
  })
})
