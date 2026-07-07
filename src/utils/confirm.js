import Swal from 'sweetalert2'

const defaultOptions = {
  confirmButtonColor: '#2563eb',
  cancelButtonColor: '#64748b',
  customClass: {
    popup: 'rounded-2xl',
    confirmButton: 'rounded-xl px-4 py-2',
    cancelButton: 'rounded-xl px-4 py-2',
  },
}

export async function confirmDialog(options) {
  const result = await Swal.fire({
    ...defaultOptions,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    ...options,
  })
  return result.isConfirmed
}

export async function confirmDelete(itemName = 'this item') {
  return confirmDialog({
    title: 'Are you sure?',
    text: `You are about to delete ${itemName}. This action cannot be undone.`,
    confirmButtonText: 'Yes, delete',
    icon: 'warning',
  })
}

export function showSuccess(message, title = 'Success') {
  return Swal.fire({ ...defaultOptions, icon: 'success', title, text: message, timer: 2000, showConfirmButton: false })
}

export function showError(message, title = 'Error') {
  return Swal.fire({ ...defaultOptions, icon: 'error', title, text: message })
}
