import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { LogOut, Trash2, TriangleAlert } from 'lucide-react'

const KonfirmasiContext = createContext(null)

const IKON = { hapus: Trash2, keluar: LogOut, peringatan: TriangleAlert }

/**
 * Dialog konfirmasi bergaya BulkUp, pengganti window.confirm().
 * Pakai: const konfirmasi = useKonfirmasi()
 *        if (!(await konfirmasi({ judul, pesan, labelYa, ikon: 'hapus', bahaya: true }))) return
 */
export function KonfirmasiProvider({ children }) {
  const [opsi, setOpsi] = useState(null)
  const refDialog = useRef(null)
  const refBatal = useRef(null)
  const refSelesai = useRef(null)

  const konfirmasi = useCallback((o) => new Promise((resolve) => {
    refSelesai.current = resolve
    setOpsi(o)
  }), [])

  const tutup = useCallback((hasil) => {
    refDialog.current?.close()
    setOpsi(null)
    refSelesai.current?.(hasil)
    refSelesai.current = null
  }, [])

  useEffect(() => {
    const d = refDialog.current
    if (!opsi || !d) return
    if (!d.open) d.showModal()
    refBatal.current?.focus() // fokus awal di tombol aman
  }, [opsi])

  const Ikon = IKON[opsi?.ikon] ?? TriangleAlert

  return (
    <KonfirmasiContext.Provider value={konfirmasi}>
      {children}
      <dialog
        ref={refDialog}
        className="dialog-konfirmasi"
        role="alertdialog"
        aria-labelledby="konfirmasi-judul"
        aria-describedby="konfirmasi-pesan"
        onCancel={(e) => { e.preventDefault(); tutup(false) }}          // tombol Esc
        onClick={(e) => { if (e.target === e.currentTarget) tutup(false) }} // klik latar
      >
        {opsi && (
          <div className="dialog-isi">
            <span className={`dialog-ikon ${opsi.bahaya ? 'dialog-ikon-bahaya' : ''}`} aria-hidden="true">
              <Ikon size={28} strokeWidth={2.4} />
            </span>
            <h2 id="konfirmasi-judul">{opsi.judul}</h2>
            <p id="konfirmasi-pesan">{opsi.pesan}</p>
            <div className="dialog-aksi">
              <button ref={refBatal} type="button" className="tombol tombol-garis" onClick={() => tutup(false)}>
                {opsi.labelBatal ?? 'Batal'}
              </button>
              <button type="button" className={`tombol ${opsi.bahaya ? 'tombol-bahaya' : 'tombol-hitam'}`}
                onClick={() => tutup(true)}>
                {opsi.labelYa ?? 'Ya'}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </KonfirmasiContext.Provider>
  )
}

export function useKonfirmasi() {
  return useContext(KonfirmasiContext)
}
