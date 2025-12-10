import React from 'react'

type Team = {
  id: number
  name: string
  totalScore: number
  solves: number
  lastSolve: string
}

type RankingTableProps = {
  teams: Team[]
}

const RankingTable: React.FC<RankingTableProps> = ({ teams }) => {
  return (
    <div className="w-full overflow-hidden rounded-[34px] border border-white/10 bg-base-200">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="border-b border-white/5 text-white/50">
              <th className="bg-transparent px-6 py-4 text-left">Rank</th>
              <th className="bg-transparent px-6 py-4 text-left">Team</th>
              <th className="bg-transparent px-6 py-4 text-right">Score</th>
              <th className="bg-transparent px-6 py-4 text-center">Solves</th>
              <th className="bg-transparent px-6 py-4 text-right">Last Solve</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr
                key={team.id}
                className="border-b border-white/5 transition-colors hover:bg-white/5 last:border-0"
              >
                <th className="px-6 py-4 font-mono text-xl text-primary">{index + 1}</th>
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-lg">{team.name}</div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-lg font-bold text-info">
                  {team.totalScore}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="badge badge-outline border-white/20 text-white/70">
                    {team.solves}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm text-white/40">
                  {team.lastSolve}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RankingTable
