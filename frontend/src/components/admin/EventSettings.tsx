import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../../context/AuthContext'

const markdownComponents = {
  h1: ({node, ...props}: any) => 
    <h1 className="mb-4 mt-8 text-2xl font-bold text-white" {...props} />,
  h2: ({node, ...props}: any) => 
    <h2 className="mb-4 mt-8 text-xl font-bold text-white" {...props} />,
  h3: ({node, ...props}: any) => 
    <h3 className="mb-3 mt-6 text-lg font-bold text-white" {...props} />,
  ul: ({node, ...props}: any) => 
    <ul className="list-disc space-y-3 pl-5 text-white/70" {...props} />,
  li: ({node, ...props}: any) => 
    <li className="pl-1 leading-relaxed" {...props} />,
  p: ({node, ...props}: any) => 
    <p className="mb-4 text-white/70" {...props} />,
  strong: ({node, ...props}: any) => 
    <strong className="font-bold text-white" {...props} />,
}

// Helper functions
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (e) {
    return ''
  }
}

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return 'Not set'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: 'America/Bogota'
    })
  } catch (e) {
    return 'Invalid date'
  }
}

const calculateEventStatus = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return 'not_started'
  
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'not_started'
  
  if (now < start) return 'not_started'
  if (now >= start && now <= end) return 'active'
  if (now > end) return 'finished'
  
  return 'not_started'
}

export default function EventSettings() {
  const [rules, setRules] = useState('')
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [savedEventConfig, setSavedEventConfig] = useState({
    start_time: '',
    end_time: '',
    event_timezone: 'UTC',
    status: 'not_started'
  })

  const [eventConfig, setEventConfig] = useState({
    start_time: '',
    end_time: '',
    event_timezone: 'UTC'
  })
  
  const [validationErrors, setValidationErrors] = useState<{
    start_time?: string
    end_time?: string
    general?: string
  }>({})
  
  // Estado calculado automáticamente
  const [calculatedStatus, setCalculatedStatus] = useState('not_started')

  // Calcular status automáticamente cuando cambian las fechas
  useEffect(() => {
    const status = calculateEventStatus(eventConfig.start_time, eventConfig.end_time)
    setCalculatedStatus(status)
    
    // Validar fechas
    validateDates()
  }, [eventConfig.start_time, eventConfig.end_time])

  const validateDates = (): boolean => {
    const errors: typeof validationErrors = {}
    
    // Validar que ambas fechas estén presentes
    if (!eventConfig.start_time) {
      errors.start_time = 'Start time is required'
    }
    
    if (!eventConfig.end_time) {
      errors.end_time = 'End time is required'
    }
    
    // Si ambas fechas existen, validar lógica
    if (eventConfig.start_time && eventConfig.end_time) {
      const start = new Date(eventConfig.start_time)
      const end = new Date(eventConfig.end_time)
      const now = new Date()
      
      if (isNaN(start.getTime())) {
        errors.start_time = 'Invalid start date format'
      }
      
      if (isNaN(end.getTime())) {
        errors.end_time = 'Invalid end date format'
      }
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        // Validar que end > start
        if (end <= start) {
          errors.end_time = 'End time must be after start time'
        }
        
        // Validar duración mínima (1 hora)
        // const minDuration = 60 * 60 * 1000 // 1 hora
        const minDuration = 5 * 60 * 1000 // 5 minutos para pruebas
        if ((end.getTime() - start.getTime()) < minDuration) {
          errors.general = 'Event must be at least 1 hour long'
        }
        
        // Validar que start no sea en el pasado si el evento no ha comenzado
        if (savedEventConfig.status === 'not_started' && start < now) {
          errors.start_time = 'Start time cannot be in the past'
        }
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Rules
        const rulesResponse = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/rules/`)
        if (rulesResponse.ok) {
          const data = await rulesResponse.json()
          setRules(data.content_md)
        }

        // Fetch Event Config
        if (token) {
          const configResponse = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/admin/event/config`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          if (configResponse.ok) {
            const data = await configResponse.json()
            setEventConfig({
              start_time: data.start_time || '',
              end_time: data.end_time || '',
              event_timezone: data.event_timezone || 'UTC'
            })
            setSavedEventConfig({
              start_time: data.start_time || '',
              end_time: data.end_time || '',
              event_timezone: data.event_timezone || 'UTC',
              status: data.status || 'not_started'
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setMessage({ 
          type: 'error', 
          text: 'Failed to load configuration. Please refresh.' 
        })
      }
    }
    
    fetchData()
    
    // Intervalo para verificar cambios de status (cada minuto)
    const interval = setInterval(() => {
      const newStatus = calculateEventStatus(eventConfig.start_time, eventConfig.end_time)
      if (newStatus !== calculatedStatus) {
        setCalculatedStatus(newStatus)
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [token])

  const handleUpdateEventConfig = async () => {
    setMessage(null)
    
    // Validar antes de enviar
    if (!validateDates()) {
      setMessage({ 
        type: 'error', 
        text: 'Please fix validation errors before saving' 
      })
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/admin/event/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          start_time: eventConfig.start_time,
          end_time: eventConfig.end_time,
          event_timezone: eventConfig.event_timezone,
          // Status se calcula automáticamente en el backend también
          status: calculatedStatus
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Actualizar con la respuesta del servidor
        setEventConfig({
          start_time: data.start_time || '',
          end_time: data.end_time || '',
          event_timezone: data.event_timezone || 'UTC'
        })
        setSavedEventConfig({
          start_time: data.start_time || '',
          end_time: data.end_time || '',
          event_timezone: data.event_timezone || 'UTC',
          status: data.status || 'not_started'
        })
        
        setMessage({ 
          type: 'success', 
          text: 'Event configuration updated successfully!' 
        })
      } else {
        const errorData = await response.json()
        setMessage({ 
          type: 'error', 
          text: errorData.detail || 'Failed to update event configuration' 
        })
      }
    } catch (error) {
      console.error('Update error:', error)
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRules = async () => {
    setLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/rules/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content_md: rules })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Rules updated successfully' })
      } else {
        setMessage({ type: 'error', text: 'Failed to update rules' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error saving rules' })
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    not_started: {
      label: 'NOT STARTED',
      color: 'bg-gray-500',
      textColor: 'white',
      description: 'Event has not started yet. Participants cannot submit flags.'
    },
    active: {
      label: ' ACTIVE',
      color: 'bg-green-500',
      textColor: 'text-green-300',
      description: 'Event is currently running. Participants can submit flags.'
    },
    finished: {
      label: ' FINISHED',
      color: 'bg-red-500',
      textColor: 'text-red-300',
      description: 'Event has ended. No more flag submissions allowed.'
    }
  }

  const currentStatus = statusConfig[(savedEventConfig.status || 'not_started') as keyof typeof statusConfig]

  return (
    <div className="space-y-8">
      {/* Event Status Section */}
      <div className="card bg-base-200 p-6">
        <h3 className="text-lg font-bold mb-4">Event Status & Timing</h3>
        
        {/* Status Indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`badge ${currentStatus.color} ${currentStatus.textColor} text-lg font-bold px-4 py-2`}>
              {currentStatus.label}
            </div>
            <span className="text-sm text-white/60">
              (Current status in database)
            </span>
          </div>
          <p className="text-white/70 text-sm">
            {currentStatus.description}
          </p>
        </div>
        
        {/* Current Database Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-base-300 p-4 rounded-lg">
            <div className="text-sm text-white/60 mb-1">Start Date & Time</div>
            <div className="text-white font-mono text-lg">
              {formatDateForDisplay(savedEventConfig.start_time)}
            </div>
            {savedEventConfig.start_time && (
              <div className="text-xs text-white/40 mt-1">
                {formatDateForInput(savedEventConfig.start_time)}
              </div>
            )}
          </div>
          
          <div className="bg-base-300 p-4 rounded-lg">
            <div className="text-sm text-white/60 mb-1">End Date & Time</div>
            <div className="text-white font-mono text-lg">
              {formatDateForDisplay(savedEventConfig.end_time)}
            </div>
            {savedEventConfig.end_time && (
              <div className="text-xs text-white/40 mt-1">
                {formatDateForInput(savedEventConfig.end_time)}
              </div>
            )}
          </div>
        </div>
        
        {/* Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">Set Start Date & Time</span>
              </div>
              <input
                type="datetime-local"
                className={`input input-bordered w-full ${validationErrors.start_time ? 'input-error' : ''}`}
                value={formatDateForInput(eventConfig.start_time)}
                onChange={(e) => {
                  const value = e.target.value
                  const date = value ? new Date(value).toISOString() : ''
                  setEventConfig({...eventConfig, start_time: date})
                }}
                min={new Date().toISOString().slice(0, 16)} // No fechas pasadas
              />
              {validationErrors.start_time && (
                <div className="label">
                  <span className="label-text-alt text-error">
                    ⚠️ {validationErrors.start_time}
                  </span>
                </div>
              )}
            </label>
          </div>
          
          <div>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">Set End Date & Time</span>
              </div>
              <input
                type="datetime-local"
                className={`input input-bordered w-full ${validationErrors.end_time ? 'input-error' : ''}`}
                value={formatDateForInput(eventConfig.end_time)}
                onChange={(e) => {
                  const value = e.target.value
                  const date = value ? new Date(value).toISOString() : ''
                  setEventConfig({...eventConfig, end_time: date})
                }}
                min={eventConfig.start_time ? 
                  // new Date(new Date(eventConfig.start_time).getTime() + 3600000).toISOString().slice(0, 16) 
                  new Date(new Date(eventConfig.start_time).getTime() + 300000).toISOString().slice(0, 16) :  // 5 min (prueba)
                  new Date().toISOString().slice(0, 16)
                } // Mínimo 1 hora después del inicio
              />
              {validationErrors.end_time && (
                <div className="label">
                  <span className="label-text-alt text-error">
                    ⚠️ {validationErrors.end_time}
                  </span>
                </div>
              )}
            </label>
          </div>
        </div>
        
        {/* Timezone Info */}
        <div className="mt-4">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Event Timezone</span>
            </div>
            <div className="p-3 bg-base-300 rounded-lg border border-base-400">
              <div className="text-white font-mono">{eventConfig.event_timezone}</div>
              <div className="text-xs text-white/60 mt-1">
                All times are converted to Colombia time (UTC-5).
              </div>
            </div>
          </label>
        </div>
        
        {/* Validation Summary */}
        {validationErrors.general && (
          <div className="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{validationErrors.general}</span>
          </div>
        )}
        
        {/* Update Button */}
        <button 
          className="btn btn-primary mt-6 w-full md:w-auto"
          onClick={handleUpdateEventConfig}
          disabled={loading || Object.keys(validationErrors).length > 0}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Updating...
            </>
          ) : 'Update Event Configuration'}
        </button>
        
        {/* Status Change Info
        <div className="mt-4 text-sm text-white/60">
          <p className="font-semibold mb-1">How status changes work:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium">NOT STARTED → ACTIVE:</span> Automatically when current time ≥ Start Time</li>
            <li><span className="font-medium">ACTIVE → ENDED:</span> Automatically when current time ≥ End Time</li>
            <li>Status updates every minute based on system time</li>
          </ul>
        </div> */}
      </div>
      
      {/* Message Display */}
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
          <div>
            {message.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="divider"></div>

      {/* Rules Section (sin cambios) */}
      <div>
        <h3 className="text-lg font-bold mb-4">
          Rules & Guidelines{' '}
          <span className="font-bold italic text-white/40 ml-2 text-base">
            (Markdown supported)
          </span>
        </h3>
        <div className="form-control w-full">
          <div className="relative w-full">
            <textarea 
              className="textarea textarea-bordered h-96 w-full font-mono text-sm pb-8" 
              placeholder="Enter competition rules in Markdown format..."
              value={rules}
              onChange={e => setRules(e.target.value)}
              maxLength={10000}
            ></textarea>
            <span className="absolute bottom-2 right-3 text-xs text-white/40 pointer-events-none">
              {rules.length} / 10,000 characters
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4 items-center">
          <button 
            className="btn btn-primary" 
            onClick={handleSaveRules}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Rules'}
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl h-5/6 flex flex-col">
            <h3 className="font-bold text-lg mb-4">Rules Preview</h3>
            <div className="flex-1 overflow-y-auto rounded-box border border-base-300 bg-base-200 p-6">
              <article className="max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {rules}
                </ReactMarkdown>
              </article>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowPreview(false)}>
                Back to Edit
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowPreview(false)}></div>
        </div>
      )}
    </div>
  )
}