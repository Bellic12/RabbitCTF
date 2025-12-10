import { useEffect, useState } from 'react'
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
    if (!isOpen || !challengeId || !token) return
    setLoading(true)
    setError('')
    Promise.all([fetchCategories(), fetchDifficulties(), fetchChallengeDetail(challengeId)])
      .catch(() => setError('Unable to load challenge details'))
      .finally(() => setLoading(false))
  }, [isOpen, challengeId, token])

  const fetchCategories = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      setCategories(await res.json())
    }
  }

  const fetchDifficulties = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/difficulties`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      setDifficulties(await res.json())
    }
  }

  const fetchChallengeDetail = async (id: number) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      throw new Error('Failed to load challenge')
    }
    const data: ChallengeDetail = await res.json()
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/${challengeId}/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setExistingFiles(prev => prev.filter(f => f.id !== fileId))
      }
    } catch (err) {
      console.error('Failed to delete file', err)
    }
  }

  const submitUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!challengeId || !token) return
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/${challengeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        setError(payload.detail ?? 'Failed to update challenge')
        setIsSubmitting(false)
        return
      }

      // Upload new files if provided
      if (newFiles.length > 0) {
        const fd = new FormData()
        newFiles.forEach(file => fd.append('files', file))
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/challenges/admin/${challengeId}/files`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        if (!uploadRes.ok) {
          setUploadError('Challenge updated but some files failed to upload.')
        }
      }

      onUpdated()
      onClose()
      setNewFiles([])
    } catch (caught) {
      setError('Unable to update challenge')
      console.error('Update challenge failed', caught)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !challengeId) return null

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box w-full max-w-2xl p-0 max-h-[90vh] bg-base-100 border border-base-300">
        <form onSubmit={submitUpdate} className="w-full h-full flex flex-col">
          <div className="flex items-center justify-between border-b border-base-300 p-6">
            <div>
              <h2 className="text-xl font-bold text-base-content">Edit Challenge</h2>
              <p className="text-sm text-base-content/60">Update challenge details, files, and settings</p>
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
            {uploadError && (
              <div className="alert alert-warning mb-4">
                <span>{uploadError}</span>
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
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="select select-bordered w-full bg-base-200"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
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
                  onChange={handleFileChange}
                  multiple
                  className="file-input file-input-bordered file-input-primary w-full bg-base-200"
                  disabled={isSubmitting}
                />

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
                className="btn btn-primary w-full text-primary-content"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
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
              className="btn btn-ghost hover:bg-base-200"
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
  )
}
