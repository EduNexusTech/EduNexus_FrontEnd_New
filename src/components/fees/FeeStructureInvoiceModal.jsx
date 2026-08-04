import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiDownload, FiEye } from 'react-icons/fi'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { feesService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { downloadBlob } from '@/utils/format'
import { SchoolLetterhead } from '@/components/fees/SchoolLetterhead'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

function StructureInvoiceDocument({ doc }) {
  if (!doc?.invoice_number) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
      <SchoolLetterhead
        institution={doc.institution}
        title={doc.title || 'Fee Structure Invoice'}
        subtitle={doc.notes}
      />

      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <p><span className="font-semibold">Student:</span> {doc.student?.full_name || '—'}</p>
        <p><span className="font-semibold">Date:</span> {doc.issued_date || '—'}</p>
        <p><span className="font-semibold">Structure:</span> {doc.structure?.name || '—'}</p>
        <p><span className="font-semibold">Time:</span> {doc.issued_time || '—'}</p>
        <p><span className="font-semibold">Term:</span> {doc.term || '—'}</p>
        <p><span className="font-semibold">Invoice #:</span> {doc.invoice_number}</p>
        <p><span className="font-semibold">Adm. No.:</span> {doc.student?.admission_number || '—'}</p>
        {doc.student?.class_name ? (
          <p><span className="font-semibold">Class:</span> {doc.student.class_name}</p>
        ) : null}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-300 text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-2 py-2 text-left w-10">No.</th>
              <th className="border border-slate-300 px-2 py-2 text-left w-24">Fee code</th>
              <th className="border border-slate-300 px-2 py-2 text-left">Fee head</th>
              <th className="border border-slate-300 px-2 py-2 text-right w-24">
                Amount ({doc.currency || 'INR'})
              </th>
              <th className="border border-slate-300 px-2 py-2 text-left w-32">Paid on</th>
              <th className="border border-slate-300 px-2 py-2 text-left w-20">Mode</th>
            </tr>
          </thead>
          <tbody>
            {(doc.lines || []).map((line) => {
              const paidOn = [line.paid_date, line.paid_time].filter(Boolean).join(' ')
              return (
                <tr key={line.no}>
                  <td className="border border-slate-300 px-2 py-2 text-center">{line.no}</td>
                  <td className="border border-slate-300 px-2 py-2">{line.fee_head_code || '—'}</td>
                  <td className="border border-slate-300 px-2 py-2">{line.fee_head_name || '—'}</td>
                  <td className="border border-slate-300 px-2 py-2 text-right">{line.amount}</td>
                  <td className="border border-slate-300 px-2 py-2">{paidOn || '—'}</td>
                  <td className="border border-slate-300 px-2 py-2">{line.payment_mode || '—'}</td>
                </tr>
              )
            })}
            <tr className="font-semibold bg-slate-50">
              <td className="border border-slate-300 px-2 py-2" colSpan={3}>Total (fully paid)</td>
              <td className="border border-slate-300 px-2 py-2 text-right">{doc.total_amount}</td>
              <td className="border border-slate-300 px-2 py-2" colSpan={2}>
                <span className="text-emerald-700">FULLY PAID</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {doc.total_amount_words ? (
        <p className="mt-4 rounded-lg border border-slate-200 bg-amber-50/60 px-4 py-3 text-sm">
          <span className="font-semibold">Amount in words: </span>
          {doc.total_amount_words}
        </p>
      ) : null}
    </div>
  )
}

export function FeeStructureInvoiceActions({
  invoiceId,
  invoiceNumber,
  listConfig,
  schoolId,
  compact = false,
}) {
  const [viewOpen, setViewOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const resolvedSchoolId = schoolId || listConfig?.params?.school

  if (!invoiceId) return <span className="text-slate-400">—</span>

  const handleDownload = async () => {
    if (!resolvedSchoolId) {
      toast.error('School context is required to download the invoice')
      return
    }
    setDownloading(true)
    try {
      const blob = await feesService.structureInvoicePdf(
        invoiceId,
        { school: resolvedSchoolId },
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
      downloadBlob(blob, `fee-structure-${invoiceNumber || invoiceId}.pdf`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not download structure invoice PDF'))
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
            title="View structure invoice"
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
        <FeeStructureInvoiceModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          invoiceId={invoiceId}
          listConfig={listConfig}
          schoolId={resolvedSchoolId}
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
      <FeeStructureInvoiceModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        invoiceId={invoiceId}
        listConfig={listConfig}
        schoolId={resolvedSchoolId}
        onDownload={handleDownload}
        downloading={downloading}
      />
    </>
  )
}

export default function FeeStructureInvoiceModal({
  open,
  onClose,
  invoiceId,
  listConfig,
  schoolId,
  onDownload,
  downloading = false,
}) {
  const resolvedSchoolId = schoolId || listConfig?.params?.school

  const detailQuery = useQuery({
    queryKey: ['fee-structure-invoice-detail', invoiceId, resolvedSchoolId],
    enabled: open && Boolean(invoiceId && resolvedSchoolId),
    queryFn: async () => {
      const res = await feesService.structureInvoiceDetail(
        invoiceId,
        { school: resolvedSchoolId },
        listConfig,
      )
      return unwrap(res)
    },
  })

  const doc = detailQuery.data
  const filename = doc?.invoice_number
    ? `fee-structure-${doc.invoice_number}.pdf`
    : `fee-structure-${invoiceId}.pdf`

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload()
      return
    }
    if (!resolvedSchoolId) {
      toast.error('School context is required to download the invoice')
      return
    }
    try {
      const blob = await feesService.structureInvoicePdf(
        invoiceId,
        { school: resolvedSchoolId },
        listConfig,
      )
      downloadBlob(blob, filename)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not download structure invoice PDF'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doc?.invoice_number ? `Structure Invoice ${doc.invoice_number}` : 'Fee Structure Invoice'}
      size="xl"
      footer={(
        <>
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={downloading || detailQuery.isLoading || !resolvedSchoolId}
          >
            <FiDownload className="mr-1.5 h-4 w-4" />
            {downloading ? 'Downloading…' : 'Download PDF'}
          </Button>
        </>
      )}
    >
      {!resolvedSchoolId ? (
        <p className="py-8 text-center text-red-600">School context is required to view this invoice.</p>
      ) : null}
      {resolvedSchoolId && detailQuery.isLoading ? (
        <p className="py-8 text-center text-slate-500">Loading structure invoice…</p>
      ) : null}
      {resolvedSchoolId && detailQuery.isError ? (
        <p className="py-8 text-center text-red-600">
          {getErrorMessage(detailQuery.error, 'Could not load structure invoice')}
        </p>
      ) : null}
      {resolvedSchoolId && doc ? <StructureInvoiceDocument doc={doc} /> : null}
    </Modal>
  )
}
