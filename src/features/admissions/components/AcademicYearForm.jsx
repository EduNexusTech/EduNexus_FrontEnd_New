import { useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { Sheet } from '@/components/ui/Sheet'
import {
  ADMISSION_FEATURE_META,
  DEFAULT_ADMISSION_FEATURES,
} from '../types/setup'

const EMPTY_FORM = {
  label: '',
  startDate: '',
  endDate: '',
  status: 'inactive',
  isCurrent: false,
  features: { ...DEFAULT_ADMISSION_FEATURES },
}

export function AcademicYearForm({ open, onClose, onSubmit, initial, schoolLabel, schoolLocked }) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              label: initial.label,
              startDate: initial.startDate,
              endDate: initial.endDate,
              status: initial.status,
              isCurrent: initial.isCurrent,
              features: { ...initial.features },
            }
          : { ...EMPTY_FORM, features: { ...DEFAULT_ADMISSION_FEATURES } },
      )
    }
  }, [open, initial])

  const updateFeature = (feature, checked) => {
    setForm((prev) => ({
      ...prev,
      features: { ...prev.features, [feature]: checked },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.label.trim() || !form.startDate || !form.endDate) return
    await onSubmit(form)
    onClose()
  }

  const featureKeys = Object.keys(ADMISSION_FEATURE_META)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Academic Year' : 'Add Academic Year'}
      description={
        schoolLabel
          ? `Academic year for ${schoolLabel}.${schoolLocked ? ' (your assigned school)' : ''}`
          : 'Configure the academic year and select which admission modules are active.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {schoolLabel ? (
          <div>
            <p className="block text-sm font-medium text-black">School</p>
            <p className="mt-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium">
              {schoolLabel}
            </p>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Academic Year Label"
              placeholder="e.g. 2026-27"
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
            required
          />
          <div className="space-y-1.5">
            <label htmlFor="year-status" className="block text-sm font-medium">
              Status
            </label>
            <select
              id="year-status"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="lms-select w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <Checkbox
              label="Set as current academic year"
              checked={form.isCurrent}
              onChange={(e) => setForm((p) => ({ ...p, isCurrent: e.target.checked }))}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Active Modules</h4>
            <p className="text-xs text-muted-foreground">
              Check the modules that should be available for this academic year. Unchecked modules
              will be hidden from the admission process.
            </p>
          </div>
          <div className="grid gap-2">
            {featureKeys.map((feature) => {
              const meta = ADMISSION_FEATURE_META[feature]
              return (
                <Checkbox
                  key={feature}
                  label={meta.label}
                  description={meta.description}
                  checked={form.features[feature]}
                  disabled={form.status === 'inactive'}
                  onChange={(e) => updateFeature(feature, e.target.checked)}
                />
              )
            })}
          </div>
          {form.status === 'inactive' ? (
            <p className="text-xs text-amber-600">Set status to Active to enable module selection.</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            <FiPlus className="h-4 w-4" />
            {initial ? 'Save Changes' : 'Add Academic Year'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
