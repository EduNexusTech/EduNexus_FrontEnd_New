import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { studentService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import {
  buildStudentLookupKey,
  parseStudentLookupKey,
  resolveStudentId,
  searchStudentsByAdmissionAndName,
} from '@/utils/studentSearch'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

export function useStudentLookup({
  schoolId,
  yearId,
  listConfig,
  queryKeyPrefix = 'student-lookup',
  requireYear = true,
}) {
  const [admissionNo, setAdmissionNo] = useState('')
  const [studentName, setStudentName] = useState('')
  const [lookupKey, setLookupKey] = useState('')
  const [searchCandidates, setSearchCandidates] = useState([])
  const [searching, setSearching] = useState(false)

  const clearLookup = () => {
    setLookupKey('')
    setSearchCandidates([])
  }

  const resetSearchFields = () => {
    setAdmissionNo('')
    setStudentName('')
    clearLookup()
  }

  const handleSearch = async () => {
    const adm = admissionNo.trim()
    const name = studentName.trim()

    if (!adm && !name) {
      toast.error('Enter admission number or student name')
      return false
    }
    if (requireYear && !yearId) {
      toast.error('Select academic year')
      return false
    }
    if (!schoolId) {
      toast.error('Select school')
      return false
    }

    setSearching(true)
    clearLookup()

    try {
      const matches = await searchStudentsByAdmissionAndName(
        {
          schoolId,
          academicYearId: requireYear ? yearId : undefined,
          admissionNo: adm,
          studentName: name,
        },
        listConfig,
      )

      if (matches.length === 1) {
        setLookupKey(
          buildStudentLookupKey(resolveStudentId(matches[0]), requireYear ? yearId : ''),
        )
      } else {
        setSearchCandidates(matches)
      }
      return true
    } catch (err) {
      toast.error(getErrorMessage(err))
      return false
    } finally {
      setSearching(false)
    }
  }

  const selectCandidate = (student) => {
    setSearchCandidates([])
    setLookupKey(buildStudentLookupKey(resolveStudentId(student), requireYear ? yearId : ''))
  }

  const studentQuery = useQuery({
    queryKey: [queryKeyPrefix, schoolId, lookupKey],
    enabled: Boolean(schoolId && lookupKey),
    retry: false,
    queryFn: async () => {
      const parsed = parseStudentLookupKey(lookupKey)
      if (!parsed?.studentId) {
        throw new Error('Invalid student lookup.')
      }
      const res = await studentService.get(parsed.studentId, listConfig)
      return {
        student: unwrap(res),
        yearId: parsed.yearId,
      }
    },
  })

  const student = studentQuery.data?.student
  const studentId = resolveStudentId(student)

  return {
    admissionNo,
    setAdmissionNo,
    studentName,
    setStudentName,
    lookupKey,
    setLookupKey,
    searchCandidates,
    searching: searching || studentQuery.isFetching,
    handleSearch,
    selectCandidate,
    clearLookup,
    resetSearchFields,
    student,
    studentId,
    studentQuery,
  }
}
