import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Spinner from '../../../components/Spinner'
import { errorMessage } from '../../../lib/http'
import { formatDate } from '../../../utils/format'
import { getPublicPost } from '../api/postApi'
import MarkdownViewer from '../components/MarkdownViewer'

export default function PostDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicPost(slug).then(setPost).catch((err) => setError(errorMessage(err, 'Artikel tidak ditemukan.')))
  }, [slug])

  const back = <Link to="/" className="text-sm font-medium text-emerald-800 hover:underline">← Semua artikel</Link>
  if (error) return <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-8"><p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>{back}</main>
  if (!post) return <Spinner />

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      {back}
      {post.cover_image_path && <img src={post.cover_image_path} alt={`Sampul ${post.title}`} className="max-h-96 w-full rounded-2xl object-cover" />}
      <header className="space-y-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">{post.category}</span>
        <h1 className="text-4xl font-bold text-slate-900">{post.title}</h1>
        <p className="text-sm text-slate-500">Oleh {post.author.username} · {formatDate(post.published_at)} · {post.reading_time} menit baca</p>
      </header>
      <article className="rounded-2xl bg-white p-6 text-lg leading-relaxed shadow"><MarkdownViewer content={post.content} /></article>
    </main>
  )
}
