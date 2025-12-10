import { useMemo } from 'react'
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
  totalChallenges: number
}

const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#FF0055', '#8884d8']

export default function TeamStats({ solvedChallenges, totalChallenges }: TeamStatsProps) {
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

  const progressData = useMemo(() => {
    const solvedCount = solvedChallenges.length
    const unsolvedCount = Math.max(0, totalChallenges - solvedCount)
    return [
      { name: 'Solved', value: solvedCount },
      { name: 'Unsolved', value: unsolvedCount }
    ]
  }, [solvedChallenges, totalChallenges])

  if (solvedChallenges.length === 0) {
    return null
  }

  return (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Category Stats */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-white/80 text-center">Challenges by Category</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {stats.map((_, index) => (
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

          {/* Right Column: Overall Progress */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-white/80 text-center">Overall Progress</h3>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#00C49F" stroke="rgba(255,255,255,0.2)" strokeWidth={2} /> {/* Solved */}
                    <Cell fill="#374151" stroke="rgba(255,255,255,0.1)" strokeWidth={1} /> {/* Unsolved */}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {Math.round((solvedChallenges.length / Math.max(totalChallenges, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-white/50">Complete</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center justify-between p-3 bg-base-300 rounded-lg border border-base-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#00C49F]" />
                    <span className="font-medium text-white">Solved</span>
                  </div>
                  <span className="font-bold text-[#00C49F]">{solvedChallenges.length}</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-base-300 rounded-lg border border-base-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#374151]" />
                    <span className="font-medium text-white">Unsolved</span>
                  </div>
                  <span className="font-bold text-white/60">{Math.max(0, totalChallenges - solvedChallenges.length)}</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-base-300 rounded-lg border border-base-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="font-medium text-white">Total Active</span>
                  </div>
                  <span className="font-bold text-primary">{totalChallenges}</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
