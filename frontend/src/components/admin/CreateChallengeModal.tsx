import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'

interface CreateChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: () => void
}

interface Category {
  id: number
  name: string
  description?: string
}

interface Difficulty {
  id: number
  name: string
}

export default function CreateChallengeModal({ isOpen, onClose, onCreate }: CreateChallengeModalProps) {
  const { token } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [difficulties, setDifficulties] = useState<Difficulty[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Estado para el modal de nueva categoría
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  })
  const [categoryError, setCategoryError] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

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
  })

  const [files, setFiles] = useState<File[]>([])
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (isOpen && token) {
      fetchCategories()
      fetchDifficulties()
      resetForm()
    }
  }, [isOpen, token])

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        console.log('Categories loaded:', data)
        setCategories(data)
      } else {
        console.error('Failed to fetch categories, status:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchDifficulties = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/difficulties`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        console.log('Difficulties loaded:', data)
        setDifficulties(data)
      } else {
        console.error('Failed to fetch difficulties, status:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch difficulties:', error)
    }
  }

  const resetForm = () => {
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
    })
    setFiles([])
    setUploadError('')
    setError('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Si selecciona "add_new" en categorías, abrir modal
    if (name === 'category_id' && value === 'add_new') {
      setShowCategoryModal(true)
      return
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles)
      
      // Validation
      const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
      const MAX_TOTAL_SIZE = 500 * 1024 * 1024 // 500MB
      
      // Check individual file sizes
      const oversizedFile = newFiles.find(f => f.size > MAX_FILE_SIZE)
      if (oversizedFile) {
        setUploadError(`File ${oversizedFile.name} exceeds the 100MB limit.`)
        e.target.value = ''
        return
      }

      // Check for duplicates
      const duplicateFile = newFiles.find(nf => files.some(f => f.name === nf.name))
      if (duplicateFile) {
        setUploadError(`File '${duplicateFile.name}' is already selected.`)
        e.target.value = ''
        return
      }
      
      // Check total size
      const currentTotalSize = files.reduce((acc, f) => acc + f.size, 0)
      const newFilesSize = newFiles.reduce((acc, f) => acc + f.size, 0)
      
      if (currentTotalSize + newFilesSize > MAX_TOTAL_SIZE) {
        setUploadError('Total file size cannot exceed 500MB.')
        e.target.value = ''
        return
      }

      setFiles(prev => [...prev, ...newFiles])
      setUploadError('')
      
      // Reset input value so same file can be added again
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleEditCategory = (categoryId: number, categoryName: string, categoryDescription?: string) => {
    setEditingCategoryId(categoryId)
    setNewCategory({
      name: categoryName,
      description: categoryDescription || ''
    })
    setShowCategoryModal(true)
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCategoryError('')
    setIsCreatingCategory(true)

    try {
      const isEditing = editingCategoryId !== null
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/categories/${editingCategoryId}`
        : `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/categories`
      
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description || null,
          is_active: true
        })
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        
        // Handle validation errors (422)
        if (response.status === 422 && payload.detail && Array.isArray(payload.detail)) {
          const errors = payload.detail.map((err: any) => {
            const field = err.loc?.[err.loc.length - 1] || 'field'
            return `${field}: ${err.msg}`
          }).join(', ')
          setCategoryError(`Validation error: ${errors}`)
        } else if (response.status === 500 && payload.detail?.includes('duplicate key')) {
          setCategoryError('A category with this name already exists')
        } else if (typeof payload.detail === 'string') {
          setCategoryError(payload.detail)
        } else {
          setCategoryError(isEditing ? 'Failed to update category' : 'Failed to create category')
        }
        
        setIsCreatingCategory(false)
        return
      }

      const resultCategory = await response.json()
      await fetchCategories()
      if (!isEditing) {
        setFormData(prev => ({ ...prev, category_id: resultCategory.id.toString() }))
      }
      setShowCategoryModal(false)
      setEditingCategoryId(null)
      setNewCategory({ name: '', description: '' })
    } catch (caught) {
      setCategoryError('Unable to save category. Check console for details.')
      console.error('Save category failed:', caught)
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setUploadError('')
    setIsSubmitting(true)

    try {
      // First, create the challenge
      const challengeResponse = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            category_id: parseInt(formData.category_id),
            difficulty_id: parseInt(formData.difficulty_id),
            is_draft: formData.visibility === 'Hidden',
            connection_info: formData.connectionInfo || null,
            flag_value: formData.flag,
            score_config: {
              base_score: parseInt(formData.baseScore),
              scoring_mode: formData.scoringType,
              decay_factor: formData.scoringType === 'dynamic' ? parseFloat(formData.decayFactor) : null,
              min_score: formData.scoringType === 'dynamic' ? parseInt(formData.minimumScore) : null,
            },
            rule_config: {
              attempt_limit: parseInt(formData.attemptLimit),
              is_case_sensitive: formData.isCaseSensitive,
            },
            visibility_config: {
              is_visible: formData.visibility === 'Visible',
            },
          }),
        }
      )

      if (!challengeResponse.ok) {
        const payload = await challengeResponse.json().catch(() => ({}))
        
        if (challengeResponse.status === 422 && payload.detail && Array.isArray(payload.detail)) {
          const errors = payload.detail.map((err: any) => {
            const field = err.loc?.[err.loc.length - 1] || 'field'
            return `${field}: ${err.msg}`
          }).join(', ')
          setError(`Validation error: ${errors}`)
        } else if (typeof payload.detail === 'string') {
          setError(payload.detail)
        } else {
          setError('Failed to create challenge')
        }
        
        setIsSubmitting(false)
        return
      }

      const challengeData = await challengeResponse.json()
      const challengeId = challengeData.id

      // Upload files if any
      if (files.length > 0) {
        try {
          const formData = new FormData()
          files.forEach(file => {
            formData.append('files', file)
          })

          const uploadResponse = await fetch(
            `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/${challengeId}/files`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            }
          )

          if (!uploadResponse.ok) {
            // If file upload fails, we should rollback the challenge creation
            // to avoid creating a challenge without its necessary files
            try {
              await fetch(
                `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/${challengeId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              )
            } catch (deleteError) {
              console.error('Failed to rollback challenge creation:', deleteError)
            }

            const errorText = await uploadResponse.text()
            try {
              const errorJson = JSON.parse(errorText)
              setUploadError(errorJson.detail || 'Challenge created but file upload failed.')
            } catch {
              setUploadError('Challenge created but file upload failed.')
            }
            setIsSubmitting(false)
            return
          }
        } catch (uploadError) {
          // Rollback on network error too
          try {
            await fetch(
              `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/${challengeId}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            )
          } catch (deleteError) {
            console.error('Failed to rollback challenge creation:', deleteError)
          }

          setUploadError('File upload failed. Challenge creation rolled back.')
          console.error('File upload error:', uploadError)
          setIsSubmitting(false)
          return
        }
      }

      onCreate()
      onClose()
      resetForm()
    } catch (caught) {
      setError('Unable to create challenge. Check console for details.')
      console.error('Create challenge failed:', caught)
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
                <h2 className="text-xl font-bold text-base-content">Create New Challenge</h2>
                <p className="text-sm text-base-content/60">Fill in the details to create a new challenge for the competition</p>
              </div>
              <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm text-base-content/60 hover:text-base-content">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
            {error.length > 0 && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
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
                  placeholder="e.g., SQL Injection Basics"
                  className="input input-bordered w-full bg-base-200 focus:border-primary"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Description *</span>
                  <span className="label-text-alt text-base-content/60">Min. 10 characters</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what the challenge is about..."
                  className="textarea textarea-bordered h-32 w-full bg-base-200 focus:border-primary"
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
                  <div className="flex gap-2">
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="select select-bordered w-full bg-base-200 focus:border-primary"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                      <option value="add_new" className="font-bold text-primary">+ Add New Category</option>
                    </select>
                    {formData.category_id && formData.category_id !== 'add_new' && formData.category_id !== '' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const selectedCategory = categories.find(c => c.id.toString() === formData.category_id)
                            if (selectedCategory) {
                              handleEditCategory(selectedCategory.id, selectedCategory.name, selectedCategory.description)
                            }
                          }}
                          className="btn btn-square btn-ghost border border-white/10"
                          disabled={isSubmitting}
                          title="Edit category"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this category? It can only be deleted if it has no challenges assigned.')) {
                              try {
                                const response = await fetch(
                                  `${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/categories/${formData.category_id}`,
                                  {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  }
                                )
                                if (response.ok) {
                                  fetchCategories()
                                  setFormData(prev => ({ ...prev, category_id: '' }))
                                  alert('Category deleted successfully')
                                } else {
                                  const error = await response.json()
                                  alert(error.detail || 'Failed to delete category')
                                }
                              } catch (err) {
                                alert('Error deleting category')
                                console.error(err)
                              }
                            }
                          }}
                          className="btn btn-square btn-ghost border border-red-500/30 hover:bg-red-500/10"
                          disabled={isSubmitting}
                          title="Delete category"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  {categories.length === 0 && (
                    <label className="label">
                      <span className="label-text-alt text-warning">No categories loaded. Check console for errors.</span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label pb-2">
                    <span className="label-text font-bold text-base-content">Difficulty *</span>
                  </label>
                  <select
                    name="difficulty_id"
                    value={formData.difficulty_id}
                    onChange={handleChange}
                    className="select select-bordered w-full bg-base-200 focus:border-primary"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select difficulty</option>
                    {difficulties.map(diff => (
                      <option key={diff.id} value={diff.id}>{diff.name}</option>
                    ))}
                  </select>
                  {difficulties.length === 0 && (
                    <label className="label">
                      <span className="label-text-alt text-warning">No difficulties loaded. Check console for errors.</span>
                    </label>
                  )}
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
                    className="select select-bordered w-full bg-base-200 focus:border-primary"
                    disabled={isSubmitting}
                  >
                    <option value="static">Static</option>
                    <option value="dynamic">Dynamic</option>
                  </select>
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
                    className="input input-bordered w-full bg-base-200 focus:border-primary"
                    required
                    min="0"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {formData.scoringType === 'dynamic' && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="form-control w-full">
                    <label className="label pb-2">
                      <span className="label-text font-bold text-base-content">Minimum Score *</span>
                    </label>
                    <input
                      type="number"
                      name="minimumScore"
                      value={formData.minimumScore}
                      onChange={handleChange}
                      placeholder="e.g., 50"
                      className="input input-bordered w-full bg-base-200 focus:border-primary"
                      required
                      min="0"
                      disabled={isSubmitting}
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
                      placeholder="e.g., 0.9"
                      className="input input-bordered w-full bg-base-200 focus:border-primary"
                      required
                      min="0"
                      max="1"
                      disabled={isSubmitting}
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
                  className="input input-bordered w-full bg-base-200 focus:border-primary"
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
                  className="select select-bordered w-full bg-base-200 focus:border-primary"
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
                  placeholder="e.g., http://challenge.ctf:8080 or nc challenge.ctf 9001"
                  className="input input-bordered w-full bg-base-200 focus:border-primary"
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
                  placeholder="flag{...}"
                  className="input input-bordered w-full bg-base-200 focus:border-primary font-mono"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Upload Files (Optional)</span>
                  <span className="label-text-alt text-base-content/60">Multiple files allowed</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="file-input file-input-bordered file-input-primary w-full bg-base-200"
                  disabled={isSubmitting}
                />

                {uploadError.length > 0 && (
                  <div className="alert alert-warning mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{uploadError}</span>
                  </div>
                )}
                
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, index) => (
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
                          onClick={() => removeFile(index)}
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
                    Creating...
                  </>
                ) : (
                  'Create Challenge'
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
                    resetForm()
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

      {showCategoryModal && (
        <div className="modal modal-open" style={{ zIndex: 1001 }}>
          <div className="modal-box bg-base-100 border border-base-300">
            <h3 className="font-bold text-lg text-base-content mb-4">
              {editingCategoryId ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            {categoryError && (
              <div className="alert alert-warning mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm">{categoryError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold">Category Name *</span>
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., OSINT"
                  className="input input-bordered w-full bg-base-200"
                  required
                  disabled={isCreatingCategory}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold">Description (Optional)</span>
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category..."
                  className="textarea textarea-bordered w-full bg-base-200"
                  disabled={isCreatingCategory}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false)
                    setEditingCategoryId(null)
                    setNewCategory({ name: '', description: '' })
                    setCategoryError('')
                  }}
                  className="btn btn-error text-error-content rounded-md hover:brightness-75 transition-all border-none"
                  disabled={isCreatingCategory}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="btn btn-primary text-primary-content rounded-md hover:brightness-75 transition-all border-none"
                  disabled={isCreatingCategory}
                >
                  {isCreatingCategory ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {editingCategoryId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingCategoryId ? 'Update Category' : 'Create Category'
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!isCreatingCategory) {
              setShowCategoryModal(false)
              setNewCategory({ name: '', description: '' })
              setCategoryError('')
            }
          }}></div>
        </div>
      )}
    </>
  )
}
