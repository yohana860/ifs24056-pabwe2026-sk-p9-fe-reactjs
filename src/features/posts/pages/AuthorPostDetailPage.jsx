import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Spinner from '../../../components/Spinner'
import { errorMessage } from '../../../lib/http'
import { getMyPost } from '../api/postApi'
import MarkdownViewer from '../components/MarkdownViewer'

export default function AuthorPostDetailPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyPost(id).then(setPost).catch((err) => setError(errorMessage(err, 'Artikel tidak dapat dimuat.')))
  }, [id])

  const back = <Link to="/author" className="text-sm font-medium text-emerald-800 hover:underline">← Kembali ke dashboard</Link>
  if (error) return <main className="mx-auto max-w-4xl space-y-4 px-4 py-8"><p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>{back}</main>
  if (!post) return <Spinner />

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      {back}
      <h1 className="text-3xl font-bold text-slate-900">{post.title}</h1>
      <p className="text-sm text-slate-500">{post.category} · {post.is_published ? 'Terbit' : 'Draf'} · slug: {post.slug}</p>
      <article className="rounded-2xl bg-white p-6 shadow"><MarkdownViewer content={post.content} /></article>
    </main>
  )
}
