import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField, CheckboxField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { feesService } from '@/api/services'
import { getErrorMessage, unwrapData, unwrapList } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { buildScopedPayload } from '@/utils/scopePayload'
import { CONCESSION_APPLY_SCOPE_OPTIONS, CONCESSION_TYPE_OPTIONS } from '@/config/feeDefinitions'

const BASE_FIELDS = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'concession_type', label: 'Type', type: 'select', options: CONCESSION_TYPE_OPTIONS },
  { name: 'discount_percentage', label: 'Percentage', type: 'number' },
  { name: 'discount_amount', label: 'Flat Amount', type: 'number' },
  { name: 'requires_approval', label: 'Requires Approval', type: 'checkbox' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

function normalizeIds(values) {
  return (values || []).map(String)
}

function ScopeCheckboxList({ label, options, selected, onChange, emptyHint }) {
  return (
    <div className="rounded border border-border p-4">
      <p className="mb-2 text-sm font-medium">{label}</p>
      {!options.length ? (
        <p className="text-sm text-muted">{emptyHint}</p>
      ) : (
        <div className="max-h-52 space-y-2 overflow-y-auto">
          {options.map((opt) => {
            const checked = selected.includes(String(opt.value))
            return (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const id = String(opt.value)
                    if (e.target.checked) {
                      onChange([...selected, id])
                    } else {
                      onChange(selected.filter((v) => v !== id))
                    }
                  }}
                />
                <span>{opt.label}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ConcessionRuleForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isSuperAdmin } = useAuth()
  const schoolScope = useSchoolScopedSelection()

  const listConfig = useMemo(
    () => ({ params: { school: schoolScope.schoolId }, ...schoolScope.listRequestConfig }),
    [schoolScope],
  )

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      code: '',
      concession_type: 'staff_child',
      discount_percentage: '',
      discount_amount: '',
      apply_scope: 'all',
      applies_to_templates: [],
      applies_to_fee_heads: [],
      requires_approval: true,
      is_active: true,
    },
  })

  const applyScope = watch('apply_scope')
  const selectedTemplates = watch('applies_to_templates') || []
  const selectedHeads = watch('applies_to_fee_heads') || []

  const detailQuery = useQuery({
    queryKey: ['fees-master-concession-rules', id],
    queryFn: () => feesService.getConcessionRule(id, listConfig),
    enabled: isEdit && Boolean(schoolScope.schoolId),
  })

  const templatesQuery = useQuery({
    queryKey: ['concession-rule-templates', schoolScope.schoolId],
    queryFn: () => feesService.templates({ page_size: 200, is_active: true }, listConfig),
    enabled: Boolean(schoolScope.schoolId),
  })

  const headsQuery = useQuery({
    queryKey: ['concession-rule-heads', schoolScope.schoolId],
    queryFn: () => feesService.heads({ page_size: 200, is_active: true }, listConfig),
    enabled: Boolean(schoolScope.schoolId),
  })

  const templateOptions = useMemo(() => {
    const { results } = unwrapList(templatesQuery.data)
    return (results || []).map((t) => ({
      value: String(t.id),
      label: t.academic_year_name ? `${t.name} (${t.code}) · ${t.academic_year_name}` : `${t.name} (${t.code})`,
    }))
  }, [templatesQuery.data])

  const headOptions = useMemo(() => {
    const { results } = unwrapList(headsQuery.data)
    return (results || []).map((h) => ({
      value: String(h.id),
      label: `${h.name} (${h.code})`,
    }))
  }, [headsQuery.data])

  useEffect(() => {
    if (!isEdit || !detailQuery.data) return
    const item = unwrapData(detailQuery.data)
    reset({
      name: item.name || '',
      code: item.code || '',
      concession_type: item.concession_type || 'custom',
      discount_percentage: item.discount_percentage ?? '',
      discount_amount: item.discount_amount ?? '',
      apply_scope: item.apply_scope || 'all',
      applies_to_templates: normalizeIds(item.applies_to_templates),
      applies_to_fee_heads: normalizeIds(item.applies_to_fee_heads),
      requires_approval: Boolean(item.requires_approval),
      is_active: item.is_active !== false,
    })
  }, [detailQuery.data, isEdit, reset])

  useEffect(() => {
    if (applyScope === 'all') {
      setValue('applies_to_templates', [])
      setValue('applies_to_fee_heads', [])
    } else if (applyScope === 'fee_structure') {
      setValue('applies_to_fee_heads', [])
    } else if (applyScope === 'fee_codes') {
      setValue('applies_to_templates', [])
    }
  }, [applyScope, setValue])

  const mutation = useMutation({
    mutationFn: (formData) => {
      const payload = buildScopedPayload(
        {
          ...formData,
          applies_to_templates: formData.apply_scope === 'fee_structure'
            ? normalizeIds(formData.applies_to_templates)
            : [],
          applies_to_fee_heads: formData.apply_scope === 'fee_codes'
            ? normalizeIds(formData.applies_to_fee_heads)
            : [],
        },
        user,
        BASE_FIELDS,
        { isSuperAdmin },
      )
      return isEdit
        ? feesService.updateConcessionRule(id, payload, listConfig)
        : feesService.createConcessionRule(payload, listConfig)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees-master-concession-rules'] })
      toast.success(isEdit ? 'Concession rule updated' : 'Concession rule created')
      navigate('/fees/masters/concession-rules')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const onSubmit = (formData) => {
    if (formData.apply_scope === 'fee_structure' && !formData.applies_to_templates?.length) {
      toast.error('Select at least one fee structure')
      return
    }
    if (formData.apply_scope === 'fee_codes' && !formData.applies_to_fee_heads?.length) {
      toast.error('Select at least one fee code')
      return
    }
    mutation.mutate(formData)
  }

  if (isEdit && detailQuery.isLoading) return <PageLoader />
  if (isEdit && detailQuery.error) return <ErrorState message={getErrorMessage(detailQuery.error)} />

  return (
    <div className="lms-page w-full">
      <Breadcrumb
        items={[
          { label: 'Fee Management', href: '/fees' },
          { label: 'Concession Rules', href: '/fees/masters/concession-rules' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />
      <PageHeader title={isEdit ? 'Edit Concession Rule' : 'New Concession Rule'} />

      <Card className="mb-4 p-4">
        <SchoolScopeField
          schoolId={schoolScope.schoolId}
          setSchoolId={schoolScope.setSchoolId}
          schoolOptions={schoolScope.schoolOptions}
          selectedSchoolLabel={schoolScope.selectedSchoolLabel}
          schoolLocked={schoolScope.schoolLocked}
        />
      </Card>

      <Card className="w-full lms-form-card">
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 p-1 [grid-template-columns:minmax(0,1fr)] sm:[grid-template-columns:repeat(2,minmax(0,1fr))] lg:[grid-template-columns:repeat(3,minmax(0,1fr))]"
        >
          {BASE_FIELDS.map((field) => {
            const isDisabled = isEdit && field.readOnlyOnEdit
            if (field.type === 'select') {
              return (
                <SelectField
                  key={field.name}
                  label={field.label}
                  options={field.options}
                  disabled={isDisabled}
                  error={errors[field.name]?.message}
                  {...register(field.name, { required: field.required ? `${field.label} is required` : false })}
                />
              )
            }
            if (field.type === 'checkbox') {
              return (
                <CheckboxField
                  key={field.name}
                  label={field.label}
                  {...register(field.name)}
                />
              )
            }
            return (
              <Input
                key={field.name}
                label={field.label}
                type={field.type === 'number' ? 'number' : 'text'}
                disabled={isDisabled}
                error={errors[field.name]?.message}
                {...register(field.name, {
                  required: field.required ? `${field.label} is required` : false,
                  valueAsNumber: field.type === 'number',
                })}
              />
            )
          })}

          <div className="sm:col-span-2 lg:col-span-3">
            <SelectField
              label="Apply concession to"
              options={CONCESSION_APPLY_SCOPE_OPTIONS}
              {...register('apply_scope')}
            />
            <p className="mt-1 text-xs text-muted">
              Choose whether this concession applies to all fees, only selected fee structures, or only selected fee codes.
            </p>
          </div>

          {applyScope === 'fee_structure' ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <ScopeCheckboxList
                label="Fee structure(s)"
                options={templateOptions}
                selected={selectedTemplates}
                onChange={(next) => setValue('applies_to_templates', next)}
                emptyHint="No fee structures found. Create them under Fee Structure first."
              />
            </div>
          ) : null}

          {applyScope === 'fee_codes' ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <ScopeCheckboxList
                label="Fee code(s)"
                options={headOptions}
                selected={selectedHeads}
                onChange={(next) => setValue('applies_to_fee_heads', next)}
                emptyHint="No fee heads found. Create them under Fee Masters → Fee Heads."
              />
            </div>
          ) : null}

          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3 border-t border-[var(--clay-border)] pt-4">
            <Button type="submit" variant="primary" loading={mutation.isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="cancel" onClick={() => navigate('/fees/masters/concession-rules')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
