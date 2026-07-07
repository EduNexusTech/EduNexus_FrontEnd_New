import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import { menuService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'

const columns = [
  { accessorKey: 'menu_name', header: 'Menu Name' },
  { accessorKey: 'menu_code', header: 'Code' },
  { accessorKey: 'url', header: 'URL' },
  { accessorKey: 'module_name', header: 'Module' },
  { accessorKey: 'sequence', header: 'Order' },
  { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge active={getValue()} /> },
]

const DETAIL_FIELDS = [
  { key: 'menu_name', label: 'Menu Name' },
  { key: 'menu_code', label: 'Code' },
  { key: 'url', label: 'URL' },
  { key: 'module_name', label: 'Module' },
  { key: 'sequence', label: 'Order' },
  { key: 'icon', label: 'Icon' },
  { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
]

export default function MenuList() {
  const { viewId, isOpen, openView, closeView } = useListDetailModal()

  return (
    <>
      <ResourceListPage
        title="Menus"
        subtitle="Manage navigation menu items"
        queryKey="menus"
        listFn={menuService.list}
        deleteFn={menuService.delete}
        basePath="/menus"
        columns={columns}
        onView={(item) => openView(item, resolveRecordId(item))}
      />

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey="menus"
        getFn={menuService.get}
        getTitle={(item) => item.menu_name}
        fields={DETAIL_FIELDS}
        editPath={(item, id) => `/menus/${item.menu_id || item.id || id}/edit`}
      />
    </>
  )
}
