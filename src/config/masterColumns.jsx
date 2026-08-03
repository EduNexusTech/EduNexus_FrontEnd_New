/** Shared list columns for master data tables. */

export const DESCRIPTION_COLUMN = {
  accessorKey: 'description',
  header: 'Description',
  enableSorting: false,
  cell: ({ getValue }) => {
    const value = getValue()
    const text = typeof value === 'string' ? value.trim() : value
    return (
      <span className="block min-w-[8rem] max-w-md whitespace-normal break-words text-sm leading-relaxed">
        {text || '—'}
      </span>
    )
  },
}
