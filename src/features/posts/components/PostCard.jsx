import { Link } from 'react-router-dom'
import { formatDate } from '../../../utils/format'

export default function PostCard({ post }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-lg">
      {post.cover_image_path ? (
        <img src={post.cover_image_path} alt={`Sampul ${post.title}`} className="h-44 w-full object-cover" loading="lazy" />
      ) : (
        <div aria-hidden="true" className="flex h-44 items-center justify-center bg-emerald-100 text-4xl">📝</div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">{post.category}</span>
        <h2 className="text-lg font-semibold text-slate-800"><Link to={`/posts/${post.slug}`} className="hover:text-emerald-700">{post.title}</Link></h2>
        <p className="line-clamp-3 flex-1 text-sm text-slate-600">{post.excerpt}</p>
        <p className="text-xs text-slate-500">{post.author.username} · {formatDate(post.published_at)} · {post.reading_time} mnt baca</p>
      </div>
    </article>
  )
}
