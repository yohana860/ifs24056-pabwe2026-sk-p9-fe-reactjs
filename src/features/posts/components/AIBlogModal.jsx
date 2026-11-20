import { useState } from 'react'
import FullScreenModal from '../../../components/FullScreenModal'
import { errorMessage } from '../../../lib/http'
import { aiGeneratePost } from '../api/postApi'
import MarkdownViewer from './MarkdownViewer'

export default function AIBlogModal({ categories, onClose, onApply }) {
  const [form, setForm] = useState({ topic: '', category: '', include_web_search: true })
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  const generate = async () => {
    if (form.topic.trim().length < 3) return setError('Topik minimal 3 karakter.')
    setError('')
    setDraft(null)
    setGenerating(true)
    const body = { topic: form.topic.trim(), include_web_search: form.include_web_search }
    if (form.category) body.category = form.category
    try {
      setDraft(await aiGeneratePost(body))
    } catch (err) {
      setError(errorMessage(err, 'AI gagal membuat artikel.'))
    }
    setGenerating(false)
  }

  const field = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2'
  return (
    <FullScreenModal title="AI Blog Generator" onClose={onClose} onSubmit={() => onApply(draft)} submitDisabled={!draft} submitLabel="Terapkan ke Editor">
      <div className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium text-slate-700">Topik artikel
          <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Contoh: Tren framework Go 2026" className={field} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">Kategori (opsional)
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={field}>
              <option value="">Biarkan AI memilih</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
            <input type="checkbox" checked={form.include_web_search} onChange={(e) => setForm({ ...form, include_web_search: e.target.checked })} />
            Sertakan penelusuran Search Engine (sumber terkini)
          </label>
        </div>
        <button type="button" onClick={generate} disabled={generating} className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 disabled:opacity-50">
          {generating ? 'AI sedang menulis...' : 'Buat Draf'}
        </button>
        {draft && (
          <section aria-label="Pratinjau draf AI" className="space-y-3 rounded-xl border border-slate-200 p-4">
            <h3 className="text-xl font-semibold text-slate-800">{draft.title}</h3>
            <p className="text-xs text-slate-500">Kategori: {draft.category}</p>
            <p className="text-sm text-slate-600">{draft.excerpt}</p>
            <MarkdownViewer content={draft.content} />
            {draft.searched ? (
              <div aria-label="Sumber rujukan">
                <h4 className="font-medium text-slate-800">Sumber Rujukan Search Engine</h4>
                <ol className="list-decimal pl-5 text-sm">
                  {draft.sources.map((s) => (
                    <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">{s.title}</a></li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Draf dibuat tanpa penelusuran web.</p>
            )}
          </section>
        )}
      </div>
    </FullScreenModal>
  )
}
