import { useNavigate } from 'react-router-dom'
import ResourceListPage from '@/components/crud/ResourceListPage'
import { libraryService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'

const STATUS_LABELS = {
  available: 'Available',
  unavailable: 'Unavailable',
  archived: 'Archived',
}

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'author', header: 'Author' },
  { accessorKey: 'isbn', header: 'ISBN' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'available_copies', header: 'Available' },
  { accessorKey: 'total_copies', header: 'Total' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => STATUS_LABELS[getValue()] || getValue(),
  },
]

export default function LibraryPage() {
  const navigate = useNavigate()

  return (
    <ResourceListPage
      title="Library"
      subtitle="Books catalog — issue and return workflows connect to student library links"
      breadcrumb={[{ label: 'Library', href: '/library' }]}
      queryKey="library-books"
      listFn={libraryService.books.list}
      deleteFn={libraryService.books.delete}
      basePath="/library"
      columns={columns}
      onView={(item, id) => navigate(`/library/${resolveRecordId(item) || id}/edit`)}
    />
  )
}
