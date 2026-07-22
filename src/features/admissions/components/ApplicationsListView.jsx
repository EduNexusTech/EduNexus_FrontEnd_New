import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiEdit2, FiEye, FiFileText } from 'react-icons/fi'
import dayjs from 'dayjs'
import DataTable, { Pagination, SearchBox } from '@/components/data/DataTable'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import IconActionButton from '@/components/ui/IconActionButton'
import { SelectField } from '@/components/ui/Input'
import { ErrorState, StatusBadge } from '@/components/ui/Feedback'
import { admissionService } from '@/api/services'
import { unwrapList, getErrorMessage } from '@/api/client'
import { usePagination, useDebounce } from '@/hooks/usePagination'
import { resolveRecordId } from '@/utils/record'
import { ADMISSION_STATUS_OPTIONS } from '@/config/constants'
import { useAdmissionSetup } from '../hooks/useAdmissionSetup'

function draftLabel(row) {
  if (row.is_draft) return 'Draft'
  if (row.status === 'lead') return 'Form started'
  return row.status_display || row.status || '—'
}

/**
 * @param {'default' | 'confirmed'} [mode]
 */
export function ApplicationsListView({
  applicationType,
  mode = 'default',
  emptyTitle = 'No applications yet',
  emptyDescription = 'Filled application forms will appear here after you convert an enquiry or create an application.',
}) {
  const isConfirmedMode = mode === 'confirmed'
  const { currentYear } = useAdmissionSetup()
  const pagination = usePagination()
  const debouncedSearch = useDebounce(pagination.search)
  const [statusFilter, setStatusFilter] = useState(isConfirmedMode ? '' : '')
  const [draftFilter, setDraftFilter] = useState('all')

  const yearId = currentYear?.academicYearId || null

  const confirmedStatusOptions = [
    { label: 'All confirmed track', value: '' },
    { label: 'Admission Confirmed', value: 'confirmed' },
    { label: 'Ready for SIS', value: 'ready_for_sis' },
    { label: 'Student Activated', value: 'enrolled' },
  ]

  const listParams = useMemo(() => {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
      search: debouncedSearch || undefined,
      ordering: isConfirmedMode ? '-confirmed_at' : '-created_at',
    }
    if (yearId) params.academic_year = yearId
    if (applicationType) params.application_type = applicationType

    if (isConfirmedMode) {
      params.track = 'confirmed'
      if (statusFilter) params.status = statusFilter
    } else {
      if (statusFilter) params.status = statusFilter
      if (draftFilter === 'draft') params.is_draft = true
      if (draftFilter === 'submitted') params.is_draft = false
    }
    return params
  }, [
    pagination.page,
    pagination.pageSize,
    debouncedSearch,
    yearId,
    statusFilter,
    applicationType,
    draftFilter,
    isConfirmedMode,
  ])

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admission-applications', isConfirmedMode ? 'confirmed-list' : 'filled-list', listParams],
    queryFn: () => admissionService.applications.list(listParams),
  })

  const list = unwrapList(data)
  const rows = list.results || []

  const columns = useMemo(
    () => {
      const base = [
        {
          id: 'application_number',
          header: 'App No.',
          cell: ({ row }) => (
            <span className="font-mono text-xs">
              {row.original.application_number || '—'}
            </span>
          ),
        },
      ]

      if (isConfirmedMode) {
        base.push({
          id: 'admission_number',
          header: 'Adm. No.',
          cell: ({ row }) => (
            <span className="font-mono text-xs" style={{ fontWeight: 500 }}>
              {row.original.admission_number || '—'}
            </span>
          ),
        })
      }

      base.push(
        {
          id: 'student',
          header: 'Student',
          cell: ({ row }) => (
            <div>
              <p className="text-sm" style={{ fontWeight: 500 }}>
                {row.original.full_name || `${row.original.first_name || ''} ${row.original.last_name || ''}`.trim() || '—'}
              </p>
              <p className="text-xs font-normal text-muted-foreground">
                {row.original.parent_name || '—'}
              </p>
            </div>
          ),
        },
        {
          accessorKey: 'mobile_number',
          header: 'Mobile',
          cell: ({ row }) => row.original.parent_mobile || row.original.mobile_number || '—',
        },
        {
          id: 'grade',
          header: isConfirmedMode ? 'Class / Section' : 'Grade',
          cell: ({ row }) =>
            isConfirmedMode
              ? (row.original.class_section_name ||
                row.original.applying_for_grade ||
                row.original.applied_class_name ||
                '—')
              : (row.original.applying_for_grade || row.original.applied_class_name || '—'),
        },
        {
          accessorKey: 'academic_year_name',
          header: 'Year',
        },
      )

      if (!isConfirmedMode) {
        base.push({
          id: 'form_status',
          header: 'Form',
          cell: ({ row }) => (
            <span
              className={`inline-flex rounded-md px-2 py-0.5 text-xs ${
                row.original.is_draft
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {row.original.is_draft ? 'Draft' : 'Submitted'}
            </span>
          ),
        })
      }

      base.push({
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} label={draftLabel(row.original)} />
        ),
      })

      base.push({
        id: 'date',
        header: isConfirmedMode ? 'Confirmed' : 'Created',
        cell: ({ row }) => {
          const value = isConfirmedMode
            ? row.original.confirmed_at || row.original.enrolled_at || row.original.created_at
            : row.original.created_at
          return value ? dayjs(value).format('DD MMM YYYY') : '—'
        },
      })

      base.push({
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const id = resolveRecordId(row.original)
          return (
            <div className="flex items-center gap-1">
              <IconActionButton
                variant="view"
                href={`/admissions/applications/${id}`}
                title="View application"
              >
                <FiEye className="h-4 w-4" />
              </IconActionButton>
              {!isConfirmedMode ? (
                <IconActionButton
                  variant="edit"
                  href={`/admissions/applications/${id}/edit`}
                  title="Edit / continue form"
                >
                  <FiEdit2 className="h-4 w-4" />
                </IconActionButton>
              ) : null}
            </div>
          )
        },
      })

      return base
    },
    [isConfirmedMode],
  )

  if (error) {
    return <ErrorState message={getErrorMessage(error, 'Failed to load applications')} onRetry={refetch} />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={pagination.search}
          onChange={(v) => pagination.setSearch(v)}
          placeholder={
            isConfirmedMode
              ? 'Search student, admission no, mobile…'
              : 'Search student, parent, mobile…'
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          {!isConfirmedMode ? (
            <SelectField
              value={draftFilter}
              onChange={(e) => {
                setDraftFilter(e.target.value)
                pagination.setPage(1)
              }}
              options={[
                { label: 'All forms', value: 'all' },
                { label: 'Drafts only', value: 'draft' },
                { label: 'Submitted only', value: 'submitted' },
              ]}
              className="min-w-[150px]"
            />
          ) : null}
          <SelectField
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              pagination.setPage(1)
            }}
            options={
              isConfirmedMode
                ? confirmedStatusOptions
                : [{ label: 'All statuses', value: '' }, ...ADMISSION_STATUS_OPTIONS]
            }
            className="min-w-[180px]"
          />
          <Button variant="outline" onClick={() => refetch()} loading={isFetching}>
            Refresh
          </Button>
        </div>
      </div>

      <Card padding={false} className="p-4">
        {!isLoading && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FiFileText className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-base font-semibold text-black">{emptyTitle}</p>
              <p className="mt-1 max-w-md text-sm font-normal text-muted-foreground">
                {emptyDescription}
              </p>
            </div>
            <Link to={isConfirmedMode ? '/admissions/applications/internal' : '/admissions/enquiries'}>
              <Button variant="primary">
                {isConfirmedMode ? 'Go to Applications' : 'Go to Enquiries'}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={rows} loading={isLoading} />
            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={list.count || 0}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
            />
          </>
        )}
      </Card>
    </div>
  )
}
