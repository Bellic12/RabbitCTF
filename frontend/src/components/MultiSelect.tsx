import { useEffect, useRef, useState } from 'react'

type Option = {
  label: string
  value: string
}

type MultiSelectProps = {
  label: string
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const getPluralLabel = (text: string) => {
    if (text.endsWith('y')) return text.slice(0, -1) + 'ies'
    if (text.endsWith('s')) return text + 'es'
    return text + 's'
  }

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          className="input input-bordered flex w-full items-center justify-between bg-base-300 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">
            {selected.length === 0
              ? `All ${getPluralLabel(label)}`
              : selected.length === options.length
                ? `All ${getPluralLabel(label)}`
                : `${selected.length} selected`}
          </span>
          <svg 
            className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-box border border-white/10 bg-base-300 p-2 shadow-xl">
            <ul className="menu p-0 max-h-60 overflow-y-auto">
              {options.map(option => (
                <li key={option.value}>
                  <label className="label cursor-pointer justify-start gap-3 hover:bg-base-200 rounded-lg">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={selected.includes(option.value)}
                      onChange={() => toggleOption(option.value)}
                    />
                    <span className="label-text">{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
