import { useState, useEffect } from 'react'

interface CreateChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (challengeData: any) => void
}

export default function CreateChallengeModal({ isOpen, onClose, onCreate }: CreateChallengeModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web',
    difficulty: 'Medium',
    scoringType: 'Static',
    baseScore: '',
    minimumScore: '',
    decayFactor: '',
    visibility: 'Hidden',
    flag: '',
    connectionInfo: '',
    author: '',
    file: null as File | null
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        category: 'Web',
        difficulty: 'Medium',
        scoringType: 'Static',
        baseScore: '',
        minimumScore: '',
        decayFactor: '',
        visibility: 'Hidden',
        flag: '',
        connectionInfo: '',
        author: '',
        file: null
      })
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, file: files[0] }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box w-full max-w-2xl p-0 max-h-[90vh] flex flex-col bg-base-100 border border-base-300">
        <div className="flex items-center justify-between border-b border-base-300 p-6">
          <div>
            <h2 className="text-xl font-bold text-base-content">Create New Challenge</h2>
            <p className="text-sm text-base-content/60">Fill in the details to create a new challenge for the competition</p>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm text-base-content/60 hover:text-base-content">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
          <form id="create-challenge-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
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
              />
            </div>

            {/* Description */}
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-bold text-base-content">Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what the challenge is about..."
                className="textarea textarea-bordered h-32 w-full bg-base-200 focus:border-primary"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Category */}
              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Category</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-base-200 focus:border-primary"
                >
                  <option value="Web">Web</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Pwn">Pwn</option>
                  <option value="Reverse">Reverse</option>
                  <option value="Forensics">Forensics</option>
                  <option value="Misc">Misc</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Difficulty</span>
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-base-200 focus:border-primary"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Insane">Insane</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Scoring Type */}
              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Scoring Type</span>
                </label>
                <select
                  name="scoringType"
                  value={formData.scoringType}
                  onChange={handleChange}
                  className="select select-bordered w-full bg-base-200 focus:border-primary"
                >
                  <option value="Static">Static</option>
                  <option value="Dynamic">Dynamic</option>
                </select>
              </div>

              {/* Base Score */}
              <div className="form-control w-full">
                <label className="label pb-2">
                  <span className="label-text font-bold text-base-content">Base Score</span>
                </label>
                <input
                  type="number"
                  name="baseScore"
                  value={formData.baseScore}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-base-200 focus:border-primary"
                />
              </div>
            </div>

            {/* Dynamic Scoring Fields */}
            {formData.scoringType === 'Dynamic' && (
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
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label pb-2">
                    <span className="label-text font-bold text-base-content">Decay Factor *</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="decayFactor"
                    value={formData.decayFactor}
                    onChange={handleChange}
                    placeholder="e.g., 0.5"
                    className="input input-bordered w-full bg-base-200 focus:border-primary"
                    required
                  />
                </div>
              </div>
            )}

            {/* Visibility */}
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-bold text-base-content">Visibility</span>
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="select select-bordered w-full bg-base-200 focus:border-primary"
              >
                <option value="Hidden">Hidden</option>
                <option value="Visible">Visible</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-bold text-base-content">Upload File</span>
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="file-input file-input-primary w-full"
              />
            </div>

            {/* Connection Info */}
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
              />
            </div>

            {/* Flag */}
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
                className="input input-bordered w-full bg-base-200 focus:border-primary"
                required
              />
            </div>

            {/* Author */}
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-bold text-base-content">Challenge Author *</span>
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                className="input input-bordered w-full bg-base-200 focus:border-primary"
                required
              />
            </div>
          </form>
        </div>

        <div className="border-t border-base-300 p-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn btn-ghost hover:bg-base-200">
            Cancel
          </button>
          <button type="submit" form="create-challenge-form" className="btn btn-primary text-primary-content">
            Create Challenge
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>
  )
}
