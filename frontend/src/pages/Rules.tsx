import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import Footer from '../components/Footer'
import Navigation from '../components/Navigation'

type RuleContent = {
  content_md: string
  version_number: number
  updated_at: string
}

const Rules: React.FC = () => {
  const [rules, setRules] = useState<RuleContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch('/api/v1/rules/')
        if (!response.ok) throw new Error('Failed to fetch rules')
        const data = await response.json()
        setRules(data)
      } catch (err) {
        setError('Could not load competition rules.')
      } finally {
        setLoading(false)
      }
    }

    fetchRules()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-base-100 text-white">
      <Navigation />

      <main className="flex-1 bg-base-100 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-white">Competition Rules</h1>
          <p className="mt-2 text-white/60">
            Please read and follow all rules during the competition
          </p>

          {loading ? (
            <div className="mt-12 flex justify-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : error ? (
            <div className="mt-8 text-error">{error}</div>
          ) : (
            <div className="mt-8 space-y-8">
              {/* Important Notice Box - Using theme warning colors */}
              <div className="rounded-lg border border-warning/20 bg-warning/5 p-6">
                <div className="flex items-start gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-1 h-6 w-6 shrink-0 text-warning"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-bold text-warning">Important Notice</h3>
                    <p className="mt-1 text-sm text-warning/80">
                      Violation of these rules may result in disqualification from the competition.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Markdown Content */}
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    // Custom styling to match the image
                    h1: ({ node, ...props }) => (
                      <h2 className="mb-4 mt-8 text-2xl font-bold text-white hidden" {...props} />
                    ), // Hide H1 if it duplicates title
                    h2: ({ node, ...props }) => (
                      <h2 className="mb-4 mt-8 text-xl font-bold text-white" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="mb-3 mt-6 text-lg font-bold text-white" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc space-y-3 pl-5 text-white/70" {...props} />
                    ),
                    li: ({ node, ...props }) => <li className="pl-1 leading-relaxed" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 text-white/70" {...props} />,
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-white" {...props} />
                    ),
                  }}
                >
                  {rules?.content_md || ''}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Rules
