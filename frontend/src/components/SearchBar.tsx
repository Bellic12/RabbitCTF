import React from 'react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }: SearchBarProps) {
  return (
    <label className={`input input-bordered flex w-full items-center gap-2 bg-base-300 ${className}`}>
      <SearchIcon className="h-5 w-5 opacity-50" />
      <input
        className="grow"
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </label>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        className="stroke-current"
        d="M11 5a6 6 0 014.472 9.992l3.27 3.27a1 1 0 01-1.414 1.414l-3.27-3.27A6 6 0 1111 5z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
    </svg>
  )
}
