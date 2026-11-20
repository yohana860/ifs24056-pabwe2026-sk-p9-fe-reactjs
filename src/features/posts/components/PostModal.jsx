import { useState } from 'react'
import FullScreenModal from '../../../components/FullScreenModal'
import { errorMessage } from '../../../lib/http'
import { createPost, updatePost } from '../api/postApi'
import MarkdownEditor from './MarkdownEditor'

// `post` = artikel yang diedit; `draft` = hasil AI yang diterapkan ke artikel baru.
export default function PostModal({ post, draft, categories, onClose, onSaved }) {
  const source = post ?? draft
  const [form, setForm] = useState({
    title: source?.title ?? '',
    category: source?.category ?? categories[0],
    excerpt: source?.excerpt ?? '',
    cover_image_path: source?.cover_image_path ?? '',
    content: source?.content ?? '',
  })
  const [dark, setDark] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async () => {
    if (!form.title.trim()) return setError('Judul wajib diisi.')
    if (!form.content.trim()) return setError('Konten artikel wajib diisi.')
    setError('')
    setSubmitting(true)
    const body = { ...form, title: form.title.trim() }
    try {
      await (post ? updatePost(post.id, body) : createPost(body))
      onSaved(post ? 'Artikel berhasil diperbarui.' : 'Artikel berhasil dibuat sebagai draf.')
    } catch (err) {
      setError(errorMessage(err, 'Gagal menyimpan artikel.'))
      setSubmitting(false)
    }
  }

  const field = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2'
  return (
    <FullScreenModal title={post ? 'Edit Artikel' : 'Tulis Artikel'} onClose={onClose} onSubmit={submit} submitting={submitting}>
      <div className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium text-slate-700">Judul
          <input name="title" value={form.title} onChange={change} className={field} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">Kategori
            <select name="category" value={form.category} onChange={change} className={field}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">URL gambar sampul
            <input name="cover_image_path" value={form.cover_image_path} onChange={change} placeholder="https://..." className={field} />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">Ringkasan (excerpt)
          <textarea name="excerpt" rows={2} value={form.excerpt} onChange={change} className={field} />
        </label>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Konten (Markdown)</span>
            <button type="button" onClick={() => setDark(!dark)} className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50">
              {dark ? '☀️ Mode terang' : '🌙 Mode gelap'}
            </button>
          </div>
          <MarkdownEditor key={dark ? 'dark' : 'light'} initialValue={form.content} dark={dark} onChange={(content) => setForm((f) => ({ ...f, content }))} />
        </div>
      </div>
    </FullScreenModal>
  )
}
