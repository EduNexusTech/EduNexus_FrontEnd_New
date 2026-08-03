import Swal from 'sweetalert2'

const baseCustomClass = {
  container: 'nexus-swal-container',
  popup: 'nexus-swal-popup',
  title: 'nexus-swal-title',
  htmlContainer: 'nexus-swal-text',
  actions: 'nexus-swal-actions',
  confirmButton: 'nexus-swal-btn nexus-swal-btn-primary',
  cancelButton: 'nexus-swal-btn nexus-swal-btn-cancel',
  denyButton: 'nexus-swal-btn nexus-swal-btn-cancel',
  icon: 'nexus-swal-icon',
  closeButton: 'nexus-swal-close',
  timerProgressBar: 'nexus-swal-timer',
}

const swalTheme = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  customClass: baseCustomClass,
  backdrop: 'rgba(15, 23, 42, 0.45)',
  showClass: {
    popup: 'nexus-swal-animate-in',
    backdrop: 'swal2-backdrop-show',
  },
  hideClass: {
    popup: 'nexus-swal-animate-out',
    backdrop: 'swal2-backdrop-hide',
  },
})

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function mergeCustomClass(overrides = {}) {
  return { ...baseCustomClass, ...overrides }
}

/**
 * @param {object} options
 * @param {'primary'|'danger'} [options.confirmVariant='primary']
 */
export async function confirmDialog(options = {}) {
  const { confirmVariant = 'primary', customClass, ...rest } = options
  const confirmButton =
    confirmVariant === 'danger'
      ? 'nexus-swal-btn nexus-swal-btn-danger'
      : 'nexus-swal-btn nexus-swal-btn-primary'

  const result = await swalTheme.fire({
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    focusCancel: true,
    customClass: mergeCustomClass({
      confirmButton,
      ...customClass,
    }),
    ...rest,
  })
  return result.isConfirmed
}

export async function confirmDelete(itemName = 'this item') {
  const safeName = escapeHtml(itemName)
  return confirmDialog({
    title: 'Delete item?',
    html: `<p class="nexus-swal-message">Delete <strong>${safeName}</strong>? This action cannot be undone.</p>`,
    icon: 'warning',
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    confirmVariant: 'danger',
  })
}

export function showSuccess(message, title = 'Success') {
  return swalTheme.fire({
    icon: 'success',
    title,
    text: message,
    timer: 2200,
    timerProgressBar: true,
    showConfirmButton: false,
  })
}

export function showError(message, title = 'Something went wrong') {
  return swalTheme.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'OK',
    customClass: mergeCustomClass({
      confirmButton: 'nexus-swal-btn nexus-swal-btn-primary',
    }),
  })
}
