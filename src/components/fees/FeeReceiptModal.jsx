import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiDownload, FiEye } from 'react-icons/fi'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { feesService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { downloadBlob } from '@/utils/format'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

function ReceiptDocument({ doc }) {
  if (!doc?.receipt_number) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
      <h3 className="text-center font-serif text-xl font-bold tracking-wide">Fee Receipt</h3>

      <div className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
        <p><span className="font-semibold">Student:</span> {doc.student?.full_name || '—'}</p>
        <p><span className="font-semibold">Date:</span> {doc.issued_date || '—'}</p>
        <p><span className="font-semibold">Institution:</span> {doc.institution?.name || '—'}</p>
        <p><span className="font-semibold">Receipt #:</span> {doc.receipt_number}</p>
        <p><span className="font-semibold">Term:</span> {doc.term || '—'}</p>
        <p><span className="font-semibold">Adm. No.:</span> {doc.student?.admission_number || '—'}</p>
        {doc.student?.class_name ? (
          <p className="sm:col-span-2"><span className="font-semibold">Class:</span> {doc.student.class_name}</p>
        ) : null}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-300 text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-3 py-2 text-left w-12">No.</th>
              <th className="border border-slate-300 px-3 py-2 text-left">Breakdown</th>
              <th className="border border-slate-300 px-3 py-2 text-right w-32">
                Amount ({doc.currency || 'INR'})
              </th>
            </tr>
          </thead>
          <tbody>
            {(doc.lines || []).map((line) => (
              <tr key={line.no}>
                <td className="border border-slate-300 px-3 py-2 text-center">{line.no}</td>
                <td className="border border-slate-300 px-3 py-2">{line.description}</td>
                <td className="border border-slate-300 px-3 py-2 text-right">{line.amount}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="border border-slate-300 px-3 py-2" colSpan={2}>Total Paid</td>
              <td className="border border-slate-300 px-3 py-2 text-right">{doc.total_paid}</td>
            </tr>
            <tr className="font-semibold">
              <td className="border border-slate-300 px-3 py-2" colSpan={2}>Total Still Owed</td>
              <td className="border border-slate-300 px-3 py-2 text-right">{doc.total_still_owed}</td>
            </tr>
            <tr className="font-semibold">
              <td className="border border-slate-300 px-3 py-2" colSpan={2}>Balance</td>
              <td className="border border-slate-300 px-3 py-2 text-right">{doc.balance}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
        <p><span className="font-semibold">Paid by:</span> {doc.payment?.paid_by || '—'}</p>
        <p><span className="font-semibold">Mode:</span> {doc.payment?.payment_mode || '—'}</p>
        <p><span className="font-semibold">Reference:</span> {doc.payment?.transaction_ref || '—'}</p>
        <p><span className="font-semibold">Signature:</span> ________________</p>
      </div>
    </div>
  )
}

export function FeeReceiptActions({ receiptId, receiptNumber, listConfig, schoolId, compact = false }) {
  const [viewOpen, setViewOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  if (!receiptId) return <span className="text-slate-400">—</span>

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await feesService.receiptPdf(
        receiptId,
        { school: schoolId },
        listConfig,
      )
      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error('Empty PDF response from server')
      }
      if (blob.type && blob.type.includes('json')) {
        const text = await blob.text()
        const parsed = JSON.parse(text)
        throw new Error(parsed?.message || parsed?.detail || 'PDF download failed')
      }
      downloadBlob(blob, `fee-receipt-${receiptNumber || receiptId}.pdf`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not download receipt PDF'))
    } finally {
      setDownloading(false)
    }
  }

  if (compact) {
    return (
      <>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setViewOpen(true)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            title="View receipt"
          >
            <FiEye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            title="Download PDF"
          >
            <FiDownload className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>
        <FeeReceiptModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          receiptId={receiptId}
          listConfig={listConfig}
          schoolId={schoolId}
          onDownload={handleDownload}
          downloading={downloading}
        />
      </>
    )
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setViewOpen(true)}>
          <FiEye className="mr-1.5 h-4 w-4" />
          View
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleDownload} disabled={downloading}>
          <FiDownload className="mr-1.5 h-4 w-4" />
          {downloading ? 'Downloading…' : 'Download PDF'}
        </Button>
      </div>
      <FeeReceiptModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        receiptId={receiptId}
        listConfig={listConfig}
        schoolId={schoolId}
        onDownload={handleDownload}
        downloading={downloading}
      />
    </>
  )
}

export default function FeeReceiptModal({
  open,
  onClose,
  receiptId,
  listConfig,
  schoolId,
  onDownload,
  downloading = false,
}) {
  const detailQuery = useQuery({
    queryKey: ['fee-receipt-detail', receiptId, schoolId],
    enabled: open && Boolean(receiptId && schoolId),
    queryFn: async () => {
      const res = await feesService.receiptDetail(
        receiptId,
        { school: schoolId },
        listConfig,
      )
      return unwrap(res)
    },
  })

  const doc = detailQuery.data
  const filename = doc?.receipt_number ? `fee-receipt-${doc.receipt_number}.pdf` : `fee-receipt-${receiptId}.pdf`

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload()
      return
    }
    try {
      const blob = await feesService.receiptPdf(
        receiptId,
        { school: schoolId },
        listConfig,
      )
      downloadBlob(blob, filename)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not download receipt PDF'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doc?.receipt_number ? `Receipt ${doc.receipt_number}` : 'Fee Receipt'}
      size="lg"
      footer={(
        <>
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          <Button type="button" onClick={handleDownload} disabled={downloading || detailQuery.isLoading}>
            <FiDownload className="mr-1.5 h-4 w-4" />
            {downloading ? 'Downloading…' : 'Download PDF'}
          </Button>
        </>
      )}
    >
      {detailQuery.isLoading ? (
        <p className="py-8 text-center text-slate-500">Loading receipt…</p>
      ) : null}
      {detailQuery.isError ? (
        <p className="py-8 text-center text-red-600">{getErrorMessage(detailQuery.error, 'Could not load receipt')}</p>
      ) : null}
      {doc ? <ReceiptDocument doc={doc} /> : null}
    </Modal>
  )
}
