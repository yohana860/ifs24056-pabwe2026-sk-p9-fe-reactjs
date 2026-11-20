import { http, unwrap } from '../../../lib/http'

export const listUsers = () => http.get('/admin/users').then(unwrap)
export const listPosts = () => http.get('/admin/posts').then(unwrap)
export const listUserPosts = (id) => http.get(`/admin/users/${id}/posts`).then(unwrap)
