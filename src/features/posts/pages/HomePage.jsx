import { useEffect, useState } from 'react'
import Spinner from '../../../components/Spinner'
import { errorMessage } from '../../../lib/http'
import { CATEGORY_ALL } from '../../../utils/format'
import { listCategories, listPublicPosts } from '../api/postApi'
import PostCard from '../components/PostCard'

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState(CATEGORY_ALL)
  const [q, setQ] = useState('')
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const params = {}
    if (q) params.q = q
    if (category !== CATEGORY_ALL) params.category = category
    listPublicPosts(params)
      .then((list) => {
        setPosts(list)
        setError('')
      })
      .catch((err) => setError(errorMessage(err, 'Artikel gagal dimuat.')))
  }, [q, category])

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Artikel Terbaru</h1>
        <p className="text-slate-600">Bacaan pilihan dari para penulis Delcom Blog.</p>
      </header>
      <input type="search" aria-label="Cari artikel" placeholder="Cari artikel secara real-time..." value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3" />
      <div role="group" aria-label="Filter kategori" className="flex flex-wrap gap-2">
        {[CATEGORY_ALL, ...categories].map((c) => (
          <button key={c} type="button" aria-pressed={c === category} onClick={() => setCategory(c)} className={`rounded-full px-4 py-1.5 text-sm ${c === category ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 hover:bg-emerald-50'}`}>{c}</button>
        ))}
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!error && !posts && <Spinner />}
      {!error && posts && posts.length === 0 && <p className="rounded-xl bg-white p-8 text-center text-slate-500">Belum ada artikel yang cocok.</p>}
      {!error && posts && posts.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </main>
  )
}
