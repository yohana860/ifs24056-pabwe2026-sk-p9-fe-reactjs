export default function FullScreenModal({ title, onClose, onSubmit, submitting = false, submitDisabled = false, submitLabel = 'Simpan', children }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex w-screen flex-col bg-white">
      <form onSubmit={handleSubmit} className="flex h-full flex-col" noValidate>
        <header className="flex items-center justify-between bg-emerald-700 px-4 py-4 text-white sm:px-8">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded px-2 text-2xl leading-none hover:bg-emerald-800">×</button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </div>
        <footer className="flex justify-end gap-3 bg-slate-800 px-4 py-4 sm:px-8">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-400 px-5 py-2 text-white hover:bg-slate-700">Batal</button>
          <button type="submit" disabled={submitting || submitDisabled} className="rounded-lg bg-emerald-500 px-5 py-2 font-medium text-white hover:bg-emerald-400 disabled:opacity-50">
            {submitting ? 'Menyimpan...' : submitLabel}
          </button>
        </footer>
      </form>
    </div>
  )
}
