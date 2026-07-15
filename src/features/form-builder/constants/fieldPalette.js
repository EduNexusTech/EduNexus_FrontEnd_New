import {
  FiType,
  FiMail,
  FiPhone,
  FiHash,
  FiCalendar,
  FiClock,
  FiAlignLeft,
  FiList,
  FiCheckSquare,
  FiCircle,
  FiUpload,
  FiImage,
  FiMinus,
  FiBook,
  FiSend,
  FiRotateCcw,
  FiLink,
  FiLock,
  FiGlobe,
  FiSliders,
  FiDroplet,
  FiEyeOff,
  FiMaximize2,
  FiLayers,
} from 'react-icons/fi'

/** @type {Array<{ type: string, label: string, icon: import('react').ComponentType, category: string, defaults?: Partial<import('../types').FormField> }>} */
export const FIELD_PALETTE = [
  // Layout & branding
  { type: 'logo', label: 'School Logo', icon: FiImage, category: 'Layout & Branding', defaults: { label: 'School Logo', imageUrl: '' } },
  { type: 'school-name', label: 'School Name', icon: FiBook, category: 'Layout & Branding', defaults: { label: 'School Name', content: 'Greenwood International School' } },
  { type: 'heading', label: 'Heading', icon: FiType, category: 'Layout & Branding', defaults: { label: 'Form Title', content: 'Admission Enquiry Form' } },
  { type: 'subheading', label: 'Subheading', icon: FiType, category: 'Layout & Branding', defaults: { label: 'Subtitle', content: 'Please complete all required fields' } },
  { type: 'paragraph', label: 'Paragraph', icon: FiAlignLeft, category: 'Layout & Branding', defaults: { label: 'Instructions', content: 'Add instructions or policy text here.' } },
  { type: 'divider', label: 'Divider', icon: FiMinus, category: 'Layout & Branding', defaults: { label: 'Divider' } },
  { type: 'spacer', label: 'Spacer', icon: FiMaximize2, category: 'Layout & Branding', defaults: { label: 'Spacer' } },
  { type: 'image', label: 'Banner Image', icon: FiImage, category: 'Layout & Branding', defaults: { label: 'Banner', imageUrl: '' } },

  // Text inputs
  { type: 'text', label: 'Text', icon: FiType, category: 'Input Fields', defaults: { label: 'Text Field', placeholder: 'Enter text', required: false } },
  { type: 'email', label: 'Email', icon: FiMail, category: 'Input Fields', defaults: { label: 'Email Address', placeholder: 'name@email.com', required: true } },
  { type: 'tel', label: 'Phone', icon: FiPhone, category: 'Input Fields', defaults: { label: 'Phone Number', placeholder: '+91', required: false } },
  { type: 'url', label: 'URL', icon: FiLink, category: 'Input Fields', defaults: { label: 'Website URL', placeholder: 'https://', required: false } },
  { type: 'password', label: 'Password', icon: FiLock, category: 'Input Fields', defaults: { label: 'Password', placeholder: '••••••••', required: false } },
  { type: 'number', label: 'Number', icon: FiHash, category: 'Input Fields', defaults: { label: 'Number', placeholder: '0', required: false } },
  { type: 'textarea', label: 'Text Area', icon: FiAlignLeft, category: 'Input Fields', defaults: { label: 'Description', placeholder: 'Enter details...', required: false } },
  { type: 'date', label: 'Date', icon: FiCalendar, category: 'Input Fields', defaults: { label: 'Date', required: false } },
  { type: 'time', label: 'Time', icon: FiClock, category: 'Input Fields', defaults: { label: 'Time', required: false } },
  { type: 'datetime-local', label: 'Date & Time', icon: FiCalendar, category: 'Input Fields', defaults: { label: 'Date & Time', required: false } },
  { type: 'color', label: 'Color Picker', icon: FiDroplet, category: 'Input Fields', defaults: { label: 'Color', required: false } },
  { type: 'range', label: 'Range Slider', icon: FiSliders, category: 'Input Fields', defaults: { label: 'Rating', required: false, defaultValue: '5' } },
  { type: 'hidden', label: 'Hidden Field', icon: FiEyeOff, category: 'Input Fields', defaults: { label: 'Hidden', defaultValue: '' } },

  // Choice inputs
  { type: 'select', label: 'Dropdown', icon: FiList, category: 'Choice Fields', defaults: { label: 'Select Option', required: false, options: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }] } },
  { type: 'radio', label: 'Radio Group', icon: FiCircle, category: 'Choice Fields', defaults: { label: 'Choose One', required: false, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] } },
  { type: 'checkbox', label: 'Checkbox', icon: FiCheckSquare, category: 'Choice Fields', defaults: { label: 'I agree to terms', required: false } },
  { type: 'checkbox-group', label: 'Checkbox Group', icon: FiLayers, category: 'Choice Fields', defaults: { label: 'Select all that apply', options: [{ label: 'Option A', value: 'a' }, { label: 'Option B', value: 'b' }] } },

  // Files
  { type: 'file', label: 'File Upload', icon: FiUpload, category: 'Files', defaults: { label: 'Upload Document', accept: '.pdf,.jpg,.png', required: false } },

  // Buttons
  { type: 'submit', label: 'Submit Button', icon: FiSend, category: 'Buttons', defaults: { label: 'Submit Form', buttonVariant: 'primary' } },
  { type: 'reset', label: 'Reset Button', icon: FiRotateCcw, category: 'Buttons', defaults: { label: 'Reset', buttonVariant: 'outline' } },
  { type: 'button', label: 'Custom Button', icon: FiGlobe, category: 'Buttons', defaults: { label: 'Click Me', buttonVariant: 'secondary' } },
]

export const PALETTE_CATEGORIES = [...new Set(FIELD_PALETTE.map((f) => f.category))]

export function getPaletteItem(type) {
  return FIELD_PALETTE.find((f) => f.type === type)
}
