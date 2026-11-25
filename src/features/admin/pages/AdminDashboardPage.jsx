import { useEffect, useState } from 'react'
import Spinner from '../../../components/Spinner'
import { errorMessage } from '../../../lib/http'
import { formatDate } from '../../../utils/format'
import { listPosts, listUserPosts, listUsers } from '../api/adminApi'

function PostsTable({ posts }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr><th className="px-4 py-3">Judul</th><th className="px-4 py-3">Penulis</th><th className="hidden px-4 py-3 md:table-cell">Kategori</th><th className="px-4 py-3">Status</th><th className="hidden px-4 py-3 sm:table-cell">Dibuat</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {posts.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 font-medium">{p.title}</td><td className="px-4 py-3">{p.author}</td>
              <td className="hidden px-4 py-3 md:table-cell">{p.category}</td>
              <td className="px-4 py-3">{p.is_published ? 'Terbit' : 'Draf'}</td>
              <td className="hidden px-4 py-3 sm:table-cell">{formatDate(p.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState(null)
  const [posts, setPosts] = useState(null)
  const [filtered, setFiltered] = useState(null)
  const [error, setError] = useState('')
  const [filterError, setFilterError] = useState('')

  useEffect(() => {
    Promise.all([listUsers(), listPosts()])
      .then(([u, p]) => {
        setUsers(u)
        setPosts(p)
      })
      .catch((err) => setError(errorMessage(err, 'Data monitoring gagal dimuat.')))
  }, [])

  const showUser = async (user) => {
    setFilterError('')
    setFiltered(null)
    try {
      setFiltered(await listUserPosts(user.id))
    } catch (err) {
      setFilterError(errorMessage(err, 'Artikel pengguna gagal dimuat.'))
    }
  }

  if (error) return <main className="mx-auto max-w-4xl px-4 py-8"><p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p></main>
  if (!users) return <Spinner />

  const totalPosts = users.reduce((sum, u) => sum + u.total_posts, 0)
  const totalPublished = users.reduce((sum, u) => sum + u.total_published, 0)
  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-800">Monitoring Admin</h1>
      <section aria-label="Statistik sistem" className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-emerald-800 p-5 text-white"><p className="text-sm font-semibold text-white">Total Pengguna</p><p className="text-3xl font-bold" data-testid="stat-users">{users.length}</p></div>
        <div className="rounded-xl bg-sky-800 p-5 text-white"><p className="text-sm font-semibold text-white">Total Artikel</p><p className="text-3xl font-bold" data-testid="stat-posts">{totalPosts}</p></div>
        <div className="rounded-xl bg-amber-900 p-5 text-white"><p className="text-sm font-semibold text-white">Artikel Terbit</p><p className="text-3xl font-bold" data-testid="stat-published">{totalPublished}</p></div>
      </section>

      <section aria-label="Direktori pengguna" className="space-y-2">
        <h2 className="text-lg font-semibold">Direktori Pengguna</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Username</th><th className="hidden px-4 py-3 md:table-cell">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Artikel</th><th className="px-4 py-3">Terbit</th><th className="px-4 py-3 text-right">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.id}</td><td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="hidden px-4 py-3 md:table-cell">{u.email}</td><td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{u.total_posts}</td><td className="px-4 py-3">{u.total_published}</td>
                  <td className="px-4 py-3 text-right"><button type="button" onClick={() => showUser(u)} className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50">Lihat Artikel</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {filterError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{filterError}</p>}
      {filtered && (
        <section aria-label="Artikel pengguna" className="space-y-2">
          <h2 className="text-lg font-semibold">Artikel milik {filtered.user.username}</h2>
          {filtered.posts.length === 0 ? <p className="text-slate-500">Pengguna ini belum menulis artikel.</p> : <PostsTable posts={filtered.posts} />}
        </section>
      )}

      <section aria-label="Arsip artikel" className="space-y-2">
        <h2 className="text-lg font-semibold">Arsip Seluruh Artikel</h2>
        {posts.length === 0 ? <p className="text-slate-500">Belum ada artikel di sistem.</p> : <PostsTable posts={posts} />}
      </section>
    </main>
  )
}
