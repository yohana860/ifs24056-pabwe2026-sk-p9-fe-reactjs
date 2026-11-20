import { http, unwrap } from '../../../lib/http'

export const listCategories = () => http.get('/public/categories').then(unwrap)
export const listPublicPosts = (params) => http.get('/public/posts', { params }).then(unwrap)
export const getPublicPost = (slug) => http.get(`/public/posts/${slug}`).then(unwrap)

export const listMyPosts = () => http.get('/posts').then(unwrap)
export const getMyPost = (id) => http.get(`/posts/${id}`).then(unwrap)
export const createPost = (body) => http.post('/posts', body).then(unwrap)
export const updatePost = (id, body) => http.put(`/posts/${id}`, body).then(unwrap)
export const deletePost = (id) => http.delete(`/posts/${id}`).then(unwrap)
export const togglePublish = (id) => http.patch(`/posts/${id}/toggle-publish`).then(unwrap)
export const getPostStats = () => http.get('/posts/stats').then(unwrap)
export const aiGeneratePost = (body) => http.post('/posts/ai-generate', body).then(unwrap)
