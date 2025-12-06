import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import EventSettings from '../components/admin/EventSettings'
import ChallengeManagement from '../components/admin/ChallengeManagement'
import UserManagement from '../components/admin/UserManagement'
import ActivityLog from '../components/admin/ActivityLog'
import Configuration from '../components/admin/Configuration'
import { useAuth } from '../context/AuthContext'
import type { AdminStats } from '../types/admin'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('event')
  const { token } = useAuth()
  const [statsData, setStatsData] = useState<AdminStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setStatsData(data)
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error)
      }
    }

    if (token) {
      fetchStats()
    }
  }, [token])

  const stats = [
    { label: 'Total Users', value: statsData?.total_users ?? '-', color: 'text-info' },
    { label: 'Total Teams', value: statsData?.total_teams ?? '-', color: 'text-info' },
    { label: 'Total Challenges', value: statsData?.total_challenges ?? '-', color: 'text-info' },
    { label: 'Active Challenges', value: statsData?.active_challenges ?? '-', color: 'text-info' },
    { label: 'Total Submissions', value: statsData?.total_submissions ?? '-', color: 'text-info' },
    { label: 'Correct Flags', value: statsData?.correct_flags ?? '-', color: 'text-info' },
  ]

  return (
    <div className="min-h-screen bg-base-100 font-sans text-base-content">
      <Navigation />
      
      <main className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="mt-1 text-white/60">Manage competition settings, challenges, users, and monitor activity</p>
          </div>
          <div className="badge badge-outline badge-lg border-primary text-primary">Administrator</div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => (
            <div key={index} className="card bg-base-100 shadow-xl border border-white/5">
              <div className="card-body p-4">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-boxed mb-6 bg-base-300 p-1">
          {[
            { id: 'event', label: 'Event Settings' },
            { id: 'challenges', label: 'Challenges' },
            { id: 'users', label: 'Users & Teams' },
            { id: 'activity', label: 'Activity Log' },
            { id: 'config', label: 'Configuration' }
          ].map((tab) => (
             <a 
               key={tab.id} 
               role="tab" 
               className={`tab ${activeTab === tab.id ? 'tab-active !bg-base-100 !text-white' : ''}`}
               onClick={() => setActiveTab(tab.id)}
             >
               {tab.label}
             </a>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-box border border-white/5 bg-base-100 p-6">
          {activeTab === 'event' && <EventSettings />}
          {activeTab === 'challenges' && <ChallengeManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'activity' && <ActivityLog />}
          {activeTab === 'config' && <Configuration />}
        </div>
      </main>
      <Footer />
    </div>
  )
}
