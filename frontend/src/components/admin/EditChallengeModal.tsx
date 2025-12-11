import { useEffect, useState, useRef } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'

interface EditChallengeModalProps {
  challengeId: number | null
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
}

interface Category {
  id: number
  name: string
  description?: string
  challenge_count?: number
  is_active: boolean
}

interface Difficulty {
  id: number
  name: string
}

interface ExistingFile {
  id: number
  name: string
  size: string
  type: string
  url: string
}

interface ChallengeDetail {
  id: number
  title: string
  description: string
  category_id: number
  difficulty_id: number
  is_draft: boolean
  is_visible: boolean
  connection_info?: string | null
  flag_value?: string | null
  score_config?: {
    base_score: number
    scoring_mode: 'static' | 'dynamic'
    decay_factor?: number | null
    min_score?: number | null
  }
  rule_config?: {
    attempt_limit: number
    is_case_sensitive: boolean
  }
  files: ExistingFile[]
  submission_count: number
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export default function EditChallengeModal({ challengeId, isOpen, onClose, onUpdated }: EditChallengeModalProps) {
  const { token } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [difficulties, setDifficulties] = useState<Difficulty[]>([])
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [loading, setLoading] = useState(false)
  const [scoringLocked, setScoringLocked] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit Category Modal State
  const [editCategoryModal, setEditCategoryModal] = useState<{
    isOpen: boolean
    categoryId: number | null
    currentName: string
    currentDescription: string
  }>({
    isOpen: false,
    categoryId: null,
    currentName: '',
    currentDescription: ''
  })

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'info' | 'warning' | 'error'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {}
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    difficulty_id: '',
    scoringType: 'static',
    baseScore: '100',
    minimumScore: '10',
    decayFactor: '0.9',
    attemptLimit: '5',
    isCaseSensitive: true,
    visibility: 'Hidden',
    flag: '',
    connectionInfo: '',
    isDraft: true,
  })

  useEffect(() => {
    if (!isOpen || !token) return
    setLoading(true)
    setError('')
    
    const loadData = async () => {
      try {
        await Promise.all([fetchCategories(), fetchDifficulties()])
        
        if (challengeId) {
          await fetchChallengeDetail(challengeId)
        } else {
          // Reset form for create mode
          setFormData({
            title: '',
            description: '',
            category_id: '',
            difficulty_id: '',
            scoringType: 'static',
            baseScore: '100',
            minimumScore: '10',
            decayFactor: '0.9',
            attemptLimit: '5',
            isCaseSensitive: true,
            visibility: 'Hidden',
            flag: '',
            connectionInfo: '',
            isDraft: true,
          })
          setExistingFiles([])
          setNewFiles([])
          setScoringLocked(false)
        }
      } catch (err) {
        setError('Unable to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isOpen, challengeId, token])

  const fetchCategories = async () => {
    try {
      const data = await api.challenges.categories(token!, true)
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories', error)
    }
  }

  const fetchDifficulties = async () => {
    try {
      const data = await api.challenges.difficulties(token!)
      setDifficulties(data)
    } catch (error) {
      console.error('Failed to fetch difficulties', error)
    }
  }

  const fetchChallengeDetail = async (id: number) => {
    try {
      const data: ChallengeDetail = await api.challenges.admin.get(token!, id)
      setExistingFiles(data.files || [])
      setScoringLocked((data.is_visible ?? false) && data.submission_count > 0)
      setFormData({
        title: data.title,
        description: data.description,
        category_id: data.category_id?.toString() || '',
        difficulty_id: data.difficulty_id?.toString() || '',
        scoringType: (data.score_config?.scoring_mode || 'static') as 'static' | 'dynamic',
      baseScore: (data.score_config?.base_score ?? 100).toString(),
      minimumScore: (data.score_config?.min_score ?? 10).toString(),
      decayFactor: (data.score_config?.decay_factor ?? 0.9).toString(),
      attemptLimit: (data.rule_config?.attempt_limit ?? 5).toString(),
      isCaseSensitive: data.rule_config?.is_case_sensitive ?? true,
      visibility: data.is_visible ? 'Visible' : 'Hidden',
      flag: data.flag_value || '',
      connectionInfo: data.connection_info || '',
      isDraft: data.is_draft,
    })
    } catch (error) {
      console.error('Failed to fetch challenge details', error)
      setError('Failed to load challenge details')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const filesArray = Array.from(selectedFiles)
      
      // Validation
      const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
      const MAX_TOTAL_SIZE_MB = 500 // 500MB
      
      // Check individual file sizes
      const oversizedFile = filesArray.find(f => f.size > MAX_FILE_SIZE)
      if (oversizedFile) {
        setUploadError(`File ${oversizedFile.name} exceeds the 100MB limit.`)
        e.target.value = ''
        return
      }

      // Check for duplicates in existing files
      const duplicateExisting = filesArray.find(nf => existingFiles.some(ef => ef.name === nf.name))
      if (duplicateExisting) {
        setUploadError(`File '${duplicateExisting.name}' already exists in this challenge.`)
        e.target.value = ''
        return
      }

      // Check for duplicates in new files (staged)
      const duplicateNew = filesArray.find(nf => newFiles.some(sf => sf.name === nf.name))
      if (duplicateNew) {
        setUploadError(`File '${duplicateNew.name}' is already selected.`)
        e.target.value = ''
        return
      }
      
      // Calculate total size in MB
      // Existing files size
      const existingSizeMB = existingFiles.reduce((acc, f) => {
        const match = f.size.match(/([\d.]+)\s*MB/)
        return acc + (match ? parseFloat(match[1]) : 0)
      }, 0)
      
      // New files size (convert bytes to MB)
      const currentNewFilesSizeMB = newFiles.reduce((acc, f) => acc + f.size / (1024 * 1024), 0)
      const incomingFilesSizeMB = filesArray.reduce((acc, f) => acc + f.size / (1024 * 1024), 0)
      
      if (existingSizeMB + currentNewFilesSizeMB + incomingFilesSizeMB > MAX_TOTAL_SIZE_MB) {
        setUploadError('Total file size cannot exceed 500MB.')
        e.target.value = ''
        return
      }

      setNewFiles(prev => [...prev, ...filesArray])
      setUploadError('')
      e.target.value = ''
    }
  }

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingFile = async (fileId: number) => {
    if (!challengeId || !token) return
    try {
      await api.challenges.admin.deleteFile(token, challengeId, fileId)
      setExistingFiles(prev => prev.filter(f => f.id !== fileId))
    } catch (err) {
      console.error('Failed to delete file', err)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return
    setError('')
    setUploadError('')
    setIsSubmitting(true)

    const body: any = {
      title: formData.title,
      description: formData.description,
      category_id: parseInt(formData.category_id),
      difficulty_id: parseInt(formData.difficulty_id),
      is_draft: formData.visibility === 'Hidden',
      connection_info: formData.connectionInfo || null,
      flag_value: formData.flag,
      rule_config: {
        attempt_limit: parseInt(formData.attemptLimit),
        is_case_sensitive: formData.isCaseSensitive,
      },
      visibility_config: {
        is_visible: formData.visibility === 'Visible',
      },
    }

    if (!scoringLocked) {
      body.score_config = {
        base_score: parseInt(formData.baseScore),
        scoring_mode: formData.scoringType,
        decay_factor: formData.scoringType === 'dynamic' ? parseFloat(formData.decayFactor) : null,
        min_score: formData.scoringType === 'dynamic' ? parseInt(formData.minimumScore) : null,
      }
    }

    try {
      let targetId = challengeId

      if (challengeId) {
        // Update existing challenge
        await api.challenges.admin.update(token, challengeId, body)
      } else {
        // Create new challenge
        const data = await api.challenges.admin.create(token, body)
        targetId = data.id
      }

      // Upload new files if provided
      if (newFiles.length > 0 && targetId) {
        try {
          await api.challenges.admin.uploadFiles(token, targetId, newFiles)
        } catch (uploadErr: any) {
          // If create mode and upload fails, rollback
          if (!challengeId) {
             try {
              await api.challenges.admin.delete(token, targetId)
            } catch (e) { /* ignore */ }
          }

          setUploadError(uploadErr.message || 'Challenge saved but files failed to upload.')
          
          if (!challengeId) {
             // If we rolled back, stop here
             setIsSubmitting(false)
             return
          }
        }
      }

      onUpdated()
      onClose()
      setNewFiles([])
    } catch (caught: any) {
      setError(caught.message || 'Unable to save challenge')
      console.error('Save challenge failed', caught)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box w-full max-w-2xl p-0 max-h-[90vh] bg-base-100 border border-base-300">
        <form onSubmit={handleSubmit} className="w-full h-full flex flex-col">
          <div className="flex items-center justify-between border-b border-base-300 p-6">
            <div>
              <h2 className="text-xl font-bold text-base-content">
                {challengeId ? 'Edit Challenge' : 'Create Challenge'}
              </h2>
              <p className="text-sm text-base-content/60">
                {challengeId ? 'Update challenge details, files, and settings' : 'Create a new challenge'}
              </p>
            </div>
            <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm text-base-content/60 hover:text-base-content">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
            {loading && (
              <div className="mb-4 flex items-center gap-2 text-sm text-base-content/60">
                <span className="loading loading-spinner loading-sm"></span>
                Loading challenge data...
              </div>
            )}
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
                <button type="button" onClick={() => setError('')} className="btn btn-sm btn-ghost">×</button>
              </div>
            )}

            <div className="space-y-6">
              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Challenge Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-base-200"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Description *</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-32 w-full bg-base-200"
                  required
                  minLength={10}
                  disabled={isSubmitting}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="form-control w-full">
                  <label className="label pb-2">
                    <span className="label-text font-bold text-base-content">Category *</span>
                  </label>
                  <div className="relative w-full">
                    <div 
                      className="select select-bordered w-full bg-base-200 focus:border-primary flex items-center justify-between cursor-pointer"
                      onClick={() => !isSubmitting && setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    >
                      <span className={formData.category_id ? "text-base-content" : "text-base-content/50"}>
                        {formData.category_id 
                          ? categories.find(c => c.id.toString() === formData.category_id)?.name 
                          : "Select category"}
                      </span>
                    </div>
                    
                    {isCategoryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-box bg-base-200 shadow-lg border border-base-300">
                        <ul className="menu p-2 w-full">
                          {categories.map(cat => (
                            <li key={cat.id} className="flex flex-row justify-between items-center hover:bg-base-300 rounded-lg">
                              <a 
                                className={`flex-grow py-2 ${!cat.is_active ? 'opacity-50 italic' : ''}`}
                                onClick={() => {
                                  if (cat.is_active) {
                                    setFormData(prev => ({ ...prev, category_id: cat.id.toString() }))
                                    setIsCategoryDropdownOpen(false)
                                  }
                                }}
                              >
                                {cat.name} {!cat.is_active && '(Hidden)'}
                              </a>
                              <div className="flex gap-1 pr-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditCategoryModal({
                                      isOpen: true,
                                      categoryId: cat.id,
                                      currentName: cat.name,
                                      currentDescription: cat.description || ''
                                    })
                                    setIsCategoryDropdownOpen(false)
                                  }}
                                  className="btn btn-ghost btn-xs btn-square"
                                  title="Edit category"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                </button>
                                
                                {!cat.is_active ? (
                                  <button
                                    type="button"
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      setConfirmationModal({
                                        isOpen: true,
                                        title: 'Unhide Category',
                                        message: 'Do you want to unhide this category?',
                                        type: 'info',
                                        onConfirm: async () => {
                                          try {
                                            await api.challenges.admin.updateCategory(token!, cat.id, { is_active: true })
                                            await fetchCategories()
                                          } catch (err) {
                                            console.error(err)
                                          }
                                          setConfirmationModal(prev => ({ ...prev, isOpen: false }))
                                        }
                                      })
                                    }}
                                    className="btn btn-ghost btn-xs btn-square text-info"
                                    title="Unhide category"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </button>
                                ) : (cat.challenge_count && cat.challenge_count > 0) ? (
                                  <button
                                    type="button"
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      setConfirmationModal({
                                        isOpen: true,
                                        title: 'Hide Category',
                                        message: `This category has ${cat.challenge_count} challenges. Do you want to hide it?`,
                                        type: 'warning',
                                        onConfirm: async () => {
                                          try {
                                            await api.challenges.admin.deleteCategory(token!, cat.id)
                                            await fetchCategories()
                                            if (formData.category_id === cat.id.toString()) {
                                              setFormData(prev => ({ ...prev, category_id: '' }))
                                            }
                                          } catch (err) {
                                            console.error(err)
                                          }
                                          setConfirmationModal(prev => ({ ...prev, isOpen: false }))
                                        }
                                      })
                                    }}
                                    className="btn btn-ghost btn-xs btn-square text-warning"
                                    title="Hide category"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      setConfirmationModal({
                                        isOpen: true,
                                        title: 'Delete Category',
                                        message: 'Are you sure you want to delete this category?',
                                        type: 'error',
                                        onConfirm: async () => {
                                          try {
                                            await api.challenges.admin.deleteCategory(token!, cat.id)
                                            await fetchCategories()
                                            if (formData.category_id === cat.id.toString()) {
                                              setFormData(prev => ({ ...prev, category_id: '' }))
                                            }
                                          } catch (err) {
                                            console.error(err)
                                          }
                                          setConfirmationModal(prev => ({ ...prev, isOpen: false }))
                                        }
                                      })
                                    }}
                                    className="btn btn-ghost btn-xs btn-square text-error"
                                    title="Delete category"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                          <li className="mt-2 pt-2 border-t border-base-300">
                            <a
                              className="flex items-center gap-2 text-primary hover:bg-base-300 rounded-lg py-2"
                              onClick={() => {
                                setEditCategoryModal({
                                  isOpen: true,
                                  categoryId: null,
                                  currentName: '',
                                  currentDescription: ''
                                })
                                setIsCategoryDropdownOpen(false)
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                              Create New Category
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-control w-full">
                  <label className="label pb-2">
                    <span className="label-text font-bold text-base-content">Difficulty *</span>
                  </label>
                  <select
                    name="difficulty_id"
                    value={formData.difficulty_id}
                    onChange={handleChange}
                    className="select select-bordered w-full bg-base-200"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select difficulty</option>
                    {difficulties.map(diff => (
                      <option key={diff.id} value={diff.id}>{diff.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="form-control w-full">
                  <label className="label pb-2">
                    <span className="label-text font-bold text-base-content">Scoring Type</span>
                  </label>
                  <select
                    name="scoringType"
                    value={formData.scoringType}
                    onChange={handleChange}
                    className="select select-bordered w-full bg-base-200"
                    disabled={isSubmitting || scoringLocked}
                  >
                    <option value="static">Static</option>
                    <option value="dynamic">Dynamic</option>
                  </select>
                  {scoringLocked && (
                    <label className="label">
                      <span className="label-text-alt text-warning">Cannot edit scoring while challenge is public and has submissions.</span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label pb-2">
                    <span className="label-text font-bold text-base-content">Base Score *</span>
                  </label>
                  <input
                    type="number"
                    name="baseScore"
                    value={formData.baseScore}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-base-200"
                    required
                    min="10"
                    disabled={isSubmitting || scoringLocked}
                  />
                </div>
              </div>

              {formData.scoringType === 'dynamic' && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="form-control w-full">
                    <label className="label pb-2">
                      <span className="label-text font-bold text-base-content">Minimum Score *</span>
                    </label>
                    <input
                      type="number"
                      name="minimumScore"
                      value={formData.minimumScore}
                      onChange={handleChange}
                      className="input input-bordered w-full bg-base-200"
                      required
                      min="10"
                      disabled={isSubmitting || scoringLocked}
                    />
                  </div>

                  <div className="form-control w-full">
                    <label className="label pb-2">
                      <span className="label-text font-bold text-base-content">Decay Factor *</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="decayFactor"
                      value={formData.decayFactor}
                      onChange={handleChange}
                      className="input input-bordered w-full bg-base-200"
                      required
                      min="0.1"
                      max="1"
                      disabled={isSubmitting || scoringLocked}
                    />
                  </div>
                </div>
              )}

              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Attempt Limit</span>
                </label>
                <input
                  type="number"
                  name="attemptLimit"
                  value={formData.attemptLimit}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-base-200"
                  min="1"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    name="isCaseSensitive"
                    checked={formData.isCaseSensitive}
                    onChange={handleCheckboxChange}
                    className="checkbox checkbox-primary"
                    disabled={isSubmitting}
                  />
                  <span className="label-text font-bold text-base-content">Case Sensitive Flag</span>
                </label>
              </div>

              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Visibility</span>
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-base-200"
                  disabled={isSubmitting}
                >
                  <option value="Hidden">Hidden (Draft)</option>
                  <option value="Visible">Visible</option>
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Connection Info (Optional)</span>
                </label>
                <input
                  type="text"
                  name="connectionInfo"
                  value={formData.connectionInfo}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-base-200"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Flag *</span>
                </label>
                <input
                  type="text"
                  name="flag"
                  value={formData.flag}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-base-200 font-mono"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Existing Files</span>
                  <span className="label-text-alt text-base-content/60">Remove files individually</span>
                </label>
                {existingFiles.length === 0 ? (
                  <div className="text-sm text-base-content/60">No files attached.</div>
                ) : (
                  <div className="space-y-2">
                    {existingFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg border border-base-300">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-base-content truncate">{file.name}</p>
                            <p className="text-xs text-base-content/60">{file.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingFile(file.id)}
                          className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10"
                          disabled={isSubmitting}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Add Files</span>
                  <span className="label-text-alt text-base-content/60">Multiple files allowed</span>
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  disabled={isSubmitting}
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline w-full border-dashed border-2 border-base-content/20 hover:border-primary hover:bg-base-200 hover:text-primary transition-all normal-case h-24 flex flex-col gap-2"
                  disabled={isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span>Click to upload files</span>
                  <span className="text-xs opacity-60 font-normal">Max 100MB per file</span>
                </button>

                {uploadError && (
                  <div className="alert alert-warning mt-2">
                    <span>{uploadError}</span>
                  </div>
                )}

                {newFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {newFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg border border-base-300">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-base-content truncate">{file.name}</p>
                            <p className="text-xs text-base-content/60">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewFile(index)}
                          className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10"
                          disabled={isSubmitting}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full text-primary-content rounded-md hover:brightness-75 transition-all border-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {challengeId ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  challengeId ? 'Save Changes' : 'Create Challenge'
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-base-300 p-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) {
                  onClose()
                  setNewFiles([])
                }
              }}
              className="btn btn-error text-error-content rounded-md hover:brightness-75 transition-all border-none"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isSubmitting) {
          onClose()
        }
      }}></div>
    </div>

    {/* Edit Category Modal */}
    {editCategoryModal.isOpen && (
      <div className="modal modal-open" style={{ zIndex: 1002 }}>
        <div className="modal-box bg-base-100 border border-base-300">
          <h3 className="font-bold text-lg mb-4 text-base-content">
            {editCategoryModal.categoryId ? 'Edit Category' : 'Create Category'}
          </h3>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Category Name</span>
            </label>
            <input
              type="text"
              value={editCategoryModal.currentName}
              onChange={(e) => setEditCategoryModal(prev => ({ ...prev, currentName: e.target.value }))}
              className="input input-bordered w-full bg-base-200"
              autoFocus
            />
          </div>
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text font-bold">Description</span>
            </label>
            <textarea
              value={editCategoryModal.currentDescription}
              onChange={(e) => setEditCategoryModal(prev => ({ ...prev, currentDescription: e.target.value }))}
              className="textarea textarea-bordered w-full bg-base-200 h-24"
              placeholder="Optional description..."
            />
          </div>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => setEditCategoryModal(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                if (editCategoryModal.currentName && editCategoryModal.currentName.trim()) {
                  try {
                    const isEditing = !!editCategoryModal.categoryId
                    const categoryData = { 
                      name: editCategoryModal.currentName.trim(),
                      description: editCategoryModal.currentDescription.trim(),
                      is_active: true
                    }

                    let newCat
                    if (isEditing) {
                      newCat = await api.challenges.admin.updateCategory(token!, editCategoryModal.categoryId!, categoryData)
                    } else {
                      newCat = await api.challenges.admin.createCategory(token!, categoryData)
                    }

                    await fetchCategories()
                    if (!isEditing) {
                      setFormData(prev => ({ ...prev, category_id: newCat.id.toString() }))
                    }
                  } catch (err) {
                    console.error(err)
                  }
                }
                setEditCategoryModal(prev => ({ ...prev, isOpen: false }))
              }}
            >
              Save
            </button>
          </div>
        </div>
        <div className="modal-backdrop bg-black/50" onClick={() => setEditCategoryModal(prev => ({ ...prev, isOpen: false }))}></div>
      </div>
    )}

    {/* Confirmation Modal */}
    {confirmationModal.isOpen && (
      <div className="modal modal-open" style={{ zIndex: 1002 }}>
        <div className="modal-box bg-base-100 border border-base-300">
          <h3 className={`font-bold text-lg mb-4 ${
            confirmationModal.type === 'error' ? 'text-error' : 
            confirmationModal.type === 'warning' ? 'text-warning' : 'text-info'
          }`}>
            {confirmationModal.title}
          </h3>
          <p className="py-4 text-base-content">{confirmationModal.message}</p>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </button>
            <button
              className={`btn ${
                confirmationModal.type === 'error' ? 'btn-error' : 
                confirmationModal.type === 'warning' ? 'btn-warning' : 'btn-info'
              }`}
              onClick={confirmationModal.onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
        <div className="modal-backdrop bg-black/50" onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}></div>
      </div>
    )}
  </>
  )
}
