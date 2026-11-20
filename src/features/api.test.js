import { http } from '../lib/http'
import * as authApi from './auth/api/authApi'
import * as postApi from './posts/api/postApi'
import * as adminApi from './admin/api/adminApi'

const ok = (data) => ({ data: { status: 'success', data } })

describe('API clients memakai endpoint /api yang benar', () => {
  beforeEach(() => {
    for (const m of ['get', 'post', 'put', 'patch', 'delete']) vi.spyOn(http, m).mockResolvedValue(ok('hasil'))
  })

  it('auth', async () => {
    expect(await authApi.login({ a: 1 })).toBe('hasil')
    await authApi.register({ a: 1 })
    await authApi.logout()
    await authApi.getProfile()
    await authApi.updateProfile({ a: 1 })
    expect(http.post).toHaveBeenCalledWith('/auth/login', { a: 1 })
    expect(http.post).toHaveBeenCalledWith('/auth/register', { a: 1 })
    expect(http.post).toHaveBeenCalledWith('/auth/logout')
    expect(http.get).toHaveBeenCalledWith('/auth/profile')
    expect(http.put).toHaveBeenCalledWith('/auth/profile', { a: 1 })
  })

  it('artikel publik dan penulis', async () => {
    await postApi.listCategories()
    await postApi.listPublicPosts({ q: 'go' })
    await postApi.getPublicPost('slug-a')
    await postApi.listMyPosts()
    await postApi.getMyPost(3)
    await postApi.createPost({ t: 1 })
    await postApi.updatePost(3, { t: 2 })
    await postApi.deletePost(3)
    await postApi.togglePublish(3)
    await postApi.getPostStats()
    await postApi.aiGeneratePost({ topic: 'x' })
    expect(http.get).toHaveBeenCalledWith('/public/categories')
    expect(http.get).toHaveBeenCalledWith('/public/posts', { params: { q: 'go' } })
    expect(http.get).toHaveBeenCalledWith('/public/posts/slug-a')
    expect(http.get).toHaveBeenCalledWith('/posts')
    expect(http.get).toHaveBeenCalledWith('/posts/3')
    expect(http.post).toHaveBeenCalledWith('/posts', { t: 1 })
    expect(http.put).toHaveBeenCalledWith('/posts/3', { t: 2 })
    expect(http.delete).toHaveBeenCalledWith('/posts/3')
    expect(http.patch).toHaveBeenCalledWith('/posts/3/toggle-publish')
    expect(http.get).toHaveBeenCalledWith('/posts/stats')
    expect(http.post).toHaveBeenCalledWith('/posts/ai-generate', { topic: 'x' })
  })

  it('admin', async () => {
    await adminApi.listUsers()
    await adminApi.listPosts()
    await adminApi.listUserPosts(4)
    expect(http.get).toHaveBeenCalledWith('/admin/users')
    expect(http.get).toHaveBeenCalledWith('/admin/posts')
    expect(http.get).toHaveBeenCalledWith('/admin/users/4/posts')
  })
})
