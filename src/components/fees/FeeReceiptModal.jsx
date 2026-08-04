import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiDownload, FiEye } from 'react-icons/fi'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { feesService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { downloadBlob } from '@/utils/format'
import ReceiptDocument from '@/components/fees/ReceiptDocument'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

export function FeeReceiptActions({ receiptId, receiptNumber, listConfig, schoolId, compact = false }) {
  const [viewOpen, setViewOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const resolvedSchoolId = schoolId || listConfig?.params?.school

  if (!receiptId) return <span className="text-slate-400">—</span>

  const handleDownload = async () => {
    if (!resolvedSchoolId) {
      toast.error('School context is required to download the receipt')
      return
    }
    setDownloading(true)
    try {
      const blob = await feesService.receiptPdf(
        receiptId,
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
      <FeeReceiptModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        receiptId={receiptId}
        listConfig={listConfig}
        schoolId={resolvedSchoolId}
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
  const resolvedSchoolId = schoolId || listConfig?.params?.school

  const detailQuery = useQuery({
    queryKey: ['fee-receipt-detail', receiptId, resolvedSchoolId],
    enabled: open && Boolean(receiptId && resolvedSchoolId),
    queryFn: async () => {
      const res = await feesService.receiptDetail(
        receiptId,
        { school: resolvedSchoolId },
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
    if (!resolvedSchoolId) {
      toast.error('School context is required to download the receipt')
      return
    }
    try {
      const blob = await feesService.receiptPdf(
        receiptId,
        { school: resolvedSchoolId },
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
        <p className="py-8 text-center text-red-600">School context is required to view this receipt.</p>
      ) : null}
      {resolvedSchoolId && detailQuery.isLoading ? (
        <p className="py-8 text-center text-slate-500">Loading receipt…</p>
      ) : null}
      {resolvedSchoolId && detailQuery.isError ? (
        <p className="py-8 text-center text-red-600">{getErrorMessage(detailQuery.error, 'Could not load receipt')}</p>
      ) : null}
      {resolvedSchoolId && doc ? <ReceiptDocument doc={doc} /> : null}
    </Modal>
  )
}
