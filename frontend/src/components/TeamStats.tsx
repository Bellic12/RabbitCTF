import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

type SolvedChallenge = {
  id: number
  title: string
  category_name: string
  points: number
  solved_at: string
}

type TeamStatsProps = {
  solvedChallenges: SolvedChallenge[]
}

const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#FF0055', '#8884d8']

export default function TeamStats({ solvedChallenges }: TeamStatsProps) {
  const stats = useMemo(() => {
    const categoryCounts: Record<string, number> = {}
    
    solvedChallenges.forEach(challenge => {
      const category = challenge.category_name
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    const total = solvedChallenges.length
    
    return Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100)
    })).sort((a, b) => b.value - a.value)
  }, [solvedChallenges])

  if (solvedChallenges.length === 0) {
    return null
  }

  return (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold text-white mb-6">Team Statistics</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-around gap-8">
          {/* Chart Section */}
          <div className="w-full md:w-1/2 h-[300px] flex flex-col items-center">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Challenges by Category</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend/Breakdown Section */}
          <div className="w-full md:w-1/2">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {stats.map((stat, index) => (
                <div key={stat.name} className="flex items-center justify-between p-3 bg-base-300 rounded-lg border border-base-100">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium text-white">{stat.name}</span>
                  </div>
                  <span className="font-bold text-primary">{stat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
