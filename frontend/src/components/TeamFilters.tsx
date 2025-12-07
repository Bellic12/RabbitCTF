import React from 'react';

interface TeamFiltersProps {
  teams: { id: number; name: string }[];
  visibleTeams: Set<string>;
  toggleTeam: (teamName: string) => void;
}

const TEAM_COLORS = [
  '#00f2ff',
  '#bd00ff',
  '#00ff9d',
  '#ffae00',
  '#ff0055',
  '#ff00ff',
  '#0066ff',
  '#ccff00',
  '#ff6600',
  '#aa00ff',
];

const TeamFilters: React.FC<TeamFiltersProps> = ({ teams, visibleTeams, toggleTeam }) => {
  return (
    <div className="w-full rounded-[34px] border border-white/10 bg-base-200 p-6 md:p-8">
      <h3 className="mb-4 text-lg font-semibold text-white">Filter Teams</h3>
      <div className="flex flex-wrap gap-3">
        {teams.map((team, index) => {
          const isVisible = visibleTeams.has(team.name);
          const color = TEAM_COLORS[index % TEAM_COLORS.length];
          
          return (
            <button
              key={team.id}
              onClick={() => toggleTeam(team.name)}
              className={`
                btn btn-sm rounded-full border transition-all duration-200
                ${isVisible 
                  ? 'border-transparent text-base-100 hover:brightness-110' 
                  : 'border-white/20 bg-transparent text-white/50 hover:bg-white/5 hover:text-white'
                }
              `}
              style={{
                backgroundColor: isVisible ? color : undefined,
              }}
            >
              {team.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TeamFilters;
