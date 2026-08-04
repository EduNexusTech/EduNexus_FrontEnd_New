export function SchoolLetterhead({ institution, title, subtitle }) {
  if (!institution?.name && !title) return null

  return (
    <div className="mb-6 border-b border-slate-200 pb-4 text-center">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {institution?.logo_url ? (
          <img
            src={institution.logo_url}
            alt={institution.name || 'School logo'}
            className="h-16 w-16 rounded-lg object-contain"
          />
        ) : null}
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-bold text-slate-900">{institution?.name || '—'}</h2>
          {institution?.address_line ? (
            <p className="text-xs text-slate-600">{institution.address_line}</p>
          ) : null}
          <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-xs text-slate-500 sm:justify-start">
            {institution?.phone ? <span>Ph: {institution.phone}</span> : null}
            {institution?.email ? <span>{institution.email}</span> : null}
            {institution?.affiliation_number ? (
              <span>Aff: {institution.affiliation_number}</span>
            ) : null}
          </div>
        </div>
      </div>
      {title ? (
        <h3 className="mt-4 font-serif text-xl font-bold tracking-wide text-slate-900">{title}</h3>
      ) : null}
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
    </div>
  )
}
