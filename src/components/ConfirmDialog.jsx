export default function ConfirmDialog({ message, confirmLabel = 'Hapus', busy = false, onConfirm, onCancel }) {
  return (
    <div role="alertdialog" aria-modal="true" aria-label="Konfirmasi" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <p className="text-slate-800">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50">Batal</button>
          <button type="button" disabled={busy} onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500 disabled:opacity-50">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
