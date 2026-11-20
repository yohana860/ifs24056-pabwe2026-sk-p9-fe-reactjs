import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../../../components/ConfirmDialog'
import Spinner from '../../../components/Spinner'
import { useToast } from '../../../components/Toast'
import { errorMessage } from '../../../lib/http'
import { deletePost, getPostStats, listCategories, listMyPosts, togglePublish } from '../api/postApi'
import AIBlogModal from '../components/AIBlogModal'
import PostModal from '../components/PostModal'
import PostTable from '../components/PostTable'

function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-xl p-5 text-white shadow ${color}`}>
      <p className="text-sm opacity-90">{label}</p>
      <p className="text-3xl font-bold" data-testid={`stat-${label}`}>{value}</p>
    </div>
  )
}

export default function AuthorDashboardPage() {
  const notify = useToast()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, total_terbit: 0, belum_selesai: 0 })
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const reload = () => setReloadKey((k) => k + 1)

  useEffect(() => {
    Promise.all([getPostStats(), listMyPosts(), listCategories()])
      .then(([s, p, c]) => {
        setStats(s)
        setPosts(p)
        setCategories(c)
        setError('')
      })
      .catch((err) => setError(errorMessage(err, 'Gagal memuat data.')))
      .finally(() => setLoading(false))
  }, [reloadKey])

  const saved = (message) => {
    setModal(null)
    notify('success', message)
    reload()
  }

  const toggle = async (post) => {
    try {
      await togglePublish(post.id)
      notify('success', post.is_published ? 'Artikel dikembalikan menjadi draf.' : 'Artikel berhasil diterbitkan.')
      reload()
    } catch (err) {
      notify('error', errorMessage(err, 'Gagal mengubah status publikasi.'))
    }
  }

  const runDelete = async () => {
    try {
      await deletePost(confirm.id)
      notify('success', 'Artikel berhasil dihapus.')
      setConfirm(null)
      reload()
    } catch (err) {
      setConfirm(null)
      notify('error', errorMessage(err, 'Gagal menghapus artikel.'))
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Penulis</h1>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setModal({ type: 'ai' })} className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500">✨ AI Blog Generator</button>
          <button type="button" onClick={() => setModal({ type: 'post' })} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-500">+ Tulis Artikel</button>
        </div>
      </header>

      <section aria-label="Statistik" className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Artikel" value={stats.total} color="bg-emerald-600" />
        <StatCard label="Total Terbit" value={stats.total_terbit} color="bg-sky-600" />
        <StatCard label="Draf" value={stats.belum_selesai} color="bg-amber-500" />
      </section>

      {loading && <Spinner />}
      {!loading && error && (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {error} <button type="button" onClick={() => { setLoading(true); reload() }} className="ml-2 underline">Coba lagi</button>
        </div>
      )}
      {!loading && !error && posts.length === 0 && <p className="rounded-xl bg-white p-8 text-center text-slate-500">Belum ada artikel. Klik “Tulis Artikel” untuk memulai.</p>}
      {!loading && !error && posts.length > 0 && (
        <PostTable
          posts={posts}
          onToggle={toggle}
          onDetail={(p) => navigate(`/author/posts/${p.id}`)}
          onEdit={(p) => setModal({ type: 'post', post: p })}
          onDelete={(p) => setConfirm({ id: p.id, title: p.title })}
        />
      )}

      {modal?.type === 'post' && <PostModal post={modal.post} draft={modal.draft} categories={categories} onClose={() => setModal(null)} onSaved={saved} />}
      {modal?.type === 'ai' && <AIBlogModal categories={categories} onClose={() => setModal(null)} onApply={(draft) => setModal({ type: 'post', draft })} />}
      {confirm && <ConfirmDialog message={`Hapus artikel “${confirm.title}”? Tindakan ini tidak dapat dibatalkan.`} onConfirm={runDelete} onCancel={() => setConfirm(null)} />}
    </main>
  )
}
