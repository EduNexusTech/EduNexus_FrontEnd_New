import { SchoolLetterhead } from '@/components/fees/SchoolLetterhead'

function ReceiptDocument({ doc }) {
  if (!doc?.receipt_number) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
      <SchoolLetterhead institution={doc.institution} title="Fee Receipt" />

      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <p><span className="font-semibold">Receipt No.:</span> {doc.receipt_number}</p>
          <p><span className="font-semibold">Date:</span> {doc.issued_date || '—'} {doc.issued_time ? `· ${doc.issued_time}` : ''}</p>
          <p><span className="font-semibold">Received from:</span> {doc.student?.full_name || '—'}</p>
          <p><span className="font-semibold">Adm. No.:</span> {doc.student?.admission_number || '—'}</p>
          <p><span className="font-semibold">Class:</span> {doc.student?.class_name || '—'}</p>
          <p><span className="font-semibold">Academic term:</span> {doc.term || '—'}</p>
          <p><span className="font-semibold">Payment No.:</span> {doc.payment?.payment_number || '—'}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-300 text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-3 py-2 text-left w-12">No.</th>
              <th className="border border-slate-300 px-3 py-2 text-left w-28">Fee code</th>
              <th className="border border-slate-300 px-3 py-2 text-left">Particulars</th>
              <th className="border border-slate-300 px-3 py-2 text-right w-32">
                Amount ({doc.currency || 'INR'})
              </th>
            </tr>
          </thead>
          <tbody>
            {(doc.lines || []).map((line) => (
              <tr key={line.no}>
                <td className="border border-slate-300 px-3 py-2 text-center">{line.no}</td>
                <td className="border border-slate-300 px-3 py-2">{line.fee_head_code || '—'}</td>
                <td className="border border-slate-300 px-3 py-2">{line.fee_head_name || line.description}</td>
                <td className="border border-slate-300 px-3 py-2 text-right">{line.amount}</td>
              </tr>
            ))}
            <tr className="font-semibold bg-slate-50">
              <td className="border border-slate-300 px-3 py-2" colSpan={3}>Total received</td>
              <td className="border border-slate-300 px-3 py-2 text-right">{doc.total_paid}</td>
            </tr>
            <tr className="font-semibold">
              <td className="border border-slate-300 px-3 py-2" colSpan={3}>Total still owed</td>
              <td className="border border-slate-300 px-3 py-2 text-right">{doc.total_still_owed}</td>
            </tr>
            <tr className="font-semibold">
              <td className="border border-slate-300 px-3 py-2" colSpan={3}>Balance due</td>
              <td className="border border-slate-300 px-3 py-2 text-right">{doc.balance}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {doc.total_paid_words ? (
        <p className="mt-4 rounded-lg border border-slate-200 bg-amber-50/60 px-4 py-3 text-sm">
          <span className="font-semibold">Amount in words: </span>
          {doc.total_paid_words}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <p><span className="font-semibold">Payment mode:</span> {doc.payment?.payment_mode || '—'}</p>
        <p><span className="font-semibold">Reference:</span> {doc.payment?.transaction_ref || '—'}</p>
        <p><span className="font-semibold">Received by:</span> {doc.payment?.paid_by || '—'}</p>
        <p><span className="font-semibold">Authorised signatory:</span> ________________</p>
      </div>

      {doc.footer_note ? (
        <p className="mt-4 text-center text-xs italic text-slate-500">{doc.footer_note}</p>
      ) : null}
    </div>
  )
}

export default ReceiptDocument
