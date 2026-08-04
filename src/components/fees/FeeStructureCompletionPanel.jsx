import { useMemo } from 'react'
import Button from '@/components/ui/Button'
import { FeeStructureInvoiceActions } from '@/components/fees/FeeStructureInvoiceModal'

function dedupeFeeItems(items = []) {
  const seen = new Map()
  for (const item of items) {
    const key = (item.fee_head_code || item.assignment_id || '').toString().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.set(key, item)
  }
  return Array.from(seen.values())
}

export default function FeeStructureCompletionPanel({
  structures = [],
  onGenerate,
  generating = false,
  schoolId,
  listConfig,
}) {
  const uniqueStructures = useMemo(() => {
    const seen = new Map()
    for (const row of structures) {
      const key = (row.structure_code || row.template_id || row.structure_name || '').toString().toLowerCase()
      if (!key || seen.has(key)) continue
      seen.set(key, row)
    }
    return Array.from(seen.values())
  }, [structures])

  if (!uniqueStructures.length) return null

  return (
    <div className="space-y-4">
      {uniqueStructures.map((row) => (
        <div
          key={row.structure_code || row.template_id || row.structure_name}
          className="rounded-lg border border-slate-200 bg-white overflow-hidden"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div>
              <p className="font-semibold text-slate-900">{row.structure_name}</p>
              {row.structure_code ? (
                <p className="text-xs text-slate-500">Code: {row.structure_code}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-slate-600">
                Total <strong>{row.total_amount}</strong>
              </span>
              <span className="text-emerald-700">
                Paid <strong>{row.paid_amount}</strong>
              </span>
              {Number(row.outstanding) > 0 ? (
                <span className="text-amber-700">
                  Due <strong>{row.outstanding}</strong>
                </span>
              ) : null}
              {row.all_paid ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  Fully paid
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Pending
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white text-slate-600">
                <tr>
                  <th className="px-4 py-2 font-medium">Fee code</th>
                  <th className="px-4 py-2 font-medium">Fee head</th>
                  <th className="px-4 py-2 font-medium">Amount</th>
                  <th className="px-4 py-2 font-medium">Paid</th>
                  <th className="px-4 py-2 font-medium">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {dedupeFeeItems(row.fee_items).map((item) => (
                  <tr key={item.assignment_id || item.fee_head_code} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium">{item.fee_head_code || '—'}</td>
                    <td className="px-4 py-2">{item.fee_head_name}</td>
                    <td className="px-4 py-2">{item.net_amount}</td>
                    <td className="px-4 py-2 text-emerald-700">{item.paid_amount}</td>
                    <td className={`px-4 py-2 ${item.is_paid ? 'text-emerald-700' : 'text-amber-700 font-medium'}`}>
                      {item.is_paid ? '0.00' : item.balance_due}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <div className="text-sm text-slate-600">
              {row.structure_invoice_number ? (
                <span>Invoice: <strong>{row.structure_invoice_number}</strong></span>
              ) : (
                <span className="text-muted">No consolidated invoice yet</span>
              )}
            </div>
            <div>
              {row.structure_invoice_id ? (
                <FeeStructureInvoiceActions
                  invoiceId={row.structure_invoice_id}
                  invoiceNumber={row.structure_invoice_number}
                  schoolId={schoolId}
                  listConfig={listConfig}
                  compact
                />
              ) : row.all_paid && onGenerate ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={generating}
                  onClick={() => onGenerate(row)}
                >
                  Generate invoice
                </Button>
              ) : !row.all_paid ? (
                <span className="text-xs text-muted">Pay all fee codes first</span>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
