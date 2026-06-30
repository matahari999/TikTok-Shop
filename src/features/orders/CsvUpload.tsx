import { useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import Button from '@/shared/ui/Button'
import { parseTikTokCsv, type CsvRow } from '@/shared/lib/csvParser'
import { formatCurrency } from '@/shared/lib/utils'
import { useLang } from '@/shared/lib/langStore'

interface Props {
  onImport: (rows: CsvRow[]) => Promise<void>
}

export default function CsvUpload({ onImport }: Props) {
  const { t } = useLang()
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<CsvRow[]>([])
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const processFile = (file: File) => {
    setError('')
    if (!file.name.endsWith('.csv')) {
      setError(t('csv.wrongFormat'))
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const content = e.target?.result as string
      try {
        const parsed = parseTikTokCsv(content)
        if (!parsed.length) { setError(t('csv.empty')); return }
        setRows(parsed)
      } catch {
        setError(t('csv.parseError'))
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleImport = async () => {
    setLoading(true)
    try { await onImport(rows) } finally { setLoading(false) }
  }

  const reset = () => {
    setRows([])
    setFileName('')
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {!rows.length ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-[#EE1D52] bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">{t('csv.dropHere')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('csv.hint')}</p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4 text-green-500" />
              <span className="font-medium">{fileName}</span>
              <span className="text-gray-400">· {t('csv.rowCount', { n: rows.length })}</span>
            </div>
            <button onClick={reset} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-3 py-2 font-medium">{t('csv.colOrder')}</th>
                  <th className="px-3 py-2 font-medium">{t('csv.colProduct')}</th>
                  <th className="px-3 py-2 font-medium">{t('csv.colQty')}</th>
                  <th className="px-3 py-2 font-medium">{t('csv.colPrice')}</th>
                  <th className="px-3 py-2 font-medium">{t('csv.colDate')}</th>
                  <th className="px-3 py-2 font-medium">{t('csv.colStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className={r.is_refund ? 'bg-red-50' : ''}>
                    <td className="px-3 py-2 text-gray-500 truncate max-w-[100px]">{r.order_number}</td>
                    <td className="px-3 py-2 text-gray-800 truncate max-w-[160px]">{r.product_name}</td>
                    <td className="px-3 py-2 text-gray-600">{r.quantity}</td>
                    <td className="px-3 py-2 text-gray-800">{formatCurrency(r.selling_price)}</td>
                    <td className="px-3 py-2 text-gray-500">{r.order_date}</td>
                    <td className="px-3 py-2">
                      {r.is_refund
                        ? <span className="text-red-600 font-medium">{t('csv.refund')}</span>
                        : <span className="text-green-600">{t('csv.normal')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && (
            <p className="text-xs text-gray-400 text-right">{t('csv.moreRows', { n: rows.length - 10 })}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={reset}>{t('csv.cancel')}</Button>
            <Button onClick={handleImport} loading={loading}>
              {t('csv.import', { n: rows.length })}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}
    </div>
  )
}
