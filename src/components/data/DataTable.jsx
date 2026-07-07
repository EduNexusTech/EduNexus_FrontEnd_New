import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { FiChevronDown, FiChevronUp, FiMinus } from 'react-icons/fi'
import { cn } from '@/utils/format'
import { TableSkeleton, EmptyState } from '@/components/ui/Feedback'

export default function DataTable({
  columns,
  data = [],
  loading,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  enableSelection = false,
  stickyHeader = true,
}) {
  const table = useReactTable({
    data,
    columns: enableSelection
      ? [
          {
            id: 'select',
            header: ({ table: t }) => (
              <input
                type="checkbox"
                checked={t.getIsAllPageRowsSelected()}
                onChange={t.getToggleAllPageRowsSelectedHandler()}
                className="rounded border-border"
              />
            ),
            cell: ({ row }) => (
              <input
                type="checkbox"
                checked={row.getIsSelected()}
                onChange={row.getToggleSelectedHandler()}
                className="rounded border-border"
              />
            ),
            size: 40,
          },
          ...columns,
        ]
      : columns,
    state: { sorting, rowSelection },
    onSortingChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: enableSelection,
  })

  if (loading) return <TableSkeleton />

  if (!data.length) return <EmptyState title="No records found" description="Try adjusting your search or filters." />

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <thead className={cn('bg-slate-50', stickyHeader && 'sticky top-0 z-10')}>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted border-b border-border"
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder ? null : (
                    <button
                      type="button"
                      className={cn(
                        'flex items-center gap-1',
                        header.column.getCanSort() && 'cursor-pointer hover:text-text',
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-muted">
                          {header.column.getIsSorted() === 'asc' ? (
                            <FiChevronUp />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <FiChevronDown />
                          ) : (
                            <FiMinus className="opacity-40" />
                          )}
                        </span>
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/80 transition">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-text">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.ceil(total / pageSize) || 1

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
      <p className="text-sm text-muted">
        Showing page {page} of {totalPages} ({total} total)
      </p>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-border px-2 py-1.5 text-sm"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
        >
          Previous
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder = 'Search...' }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full sm:w-72 rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  )
}
