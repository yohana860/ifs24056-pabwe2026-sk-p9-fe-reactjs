import { screen } from '@testing-library/react'

vi.mock('./features/posts/api/postApi', () => ({
  listCategories: vi.fn().mockResolvedValue([]),
  listPublicPosts: vi.fn().mockResolvedValue([]),
}))

describe('main entry', () => {
  it('me-render aplikasi ke #root dengan Router, Toast, dan Auth', async () => {
    document.body.innerHTML = '<div id="root"></div>'
    window.history.pushState({}, '', '/')
    await import('./main.jsx')
    expect(await screen.findByText('Artikel Terbaru')).toBeInTheDocument()
  })
})
