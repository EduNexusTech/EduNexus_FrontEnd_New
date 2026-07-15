import { getPaletteItem } from '../constants/fieldPalette'
import { createId } from './createId'

export function createFieldFromPalette(type) {
  const palette = getPaletteItem(type)
  return {
    id: createId('fld'),
    type,
    ...(palette?.defaults || {}),
  }
}

export function isInputField(type) {
  return !['heading', 'subheading', 'paragraph', 'divider', 'spacer', 'logo', 'school-name', 'image', 'submit', 'reset', 'button'].includes(type)
}

export function isLayoutField(type) {
  return ['heading', 'subheading', 'paragraph', 'divider', 'spacer', 'logo', 'school-name', 'image'].includes(type)
}
