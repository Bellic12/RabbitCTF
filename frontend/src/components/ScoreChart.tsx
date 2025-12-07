import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ScorePoint {
  time: string;
  score: number;
}

interface Team {
  id: number;
  name: string;
  timeline: ScorePoint[];
  totalScore: number;
  solves: number;
  lastSolve: string;
}

interface ScoreChartProps {
  teams: Team[];
  visibleTeams: Set<string>;
}

const TEAM_COLORS = [
  '#00f2ff', // Cyan
  '#bd00ff', // Purple
  '#00ff9d', // Green
  '#ffae00', // Orange
  '#ff0055', // Red/Pink
  '#ff00ff', // Magenta
  '#0066ff', // Blue
  '#ccff00', // Lime
  '#ff6600', // Dark Orange
  '#aa00ff', // Violet
];

const ScoreChart: React.FC<ScoreChartProps> = ({ teams, visibleTeams }) => {
  const chartData = useMemo(() => {
    if (teams.length === 0) return [];

    const allTimePoints = new Set<string>();
    teams.forEach(team => {
      if (visibleTeams.has(team.name)) {
        team.timeline.forEach(point => allTimePoints.add(point.time));
      }
    });
    
    const sortedTimePoints = Array.from(allTimePoints).sort();

    return sortedTimePoints.map(time => {
      const dataPoint: any = { time };
      
      teams.forEach(team => {
        if (!visibleTeams.has(team.name)) return;

        // Only set score if there is an exact match in the timeline
        // This allows recharts to connect points (connectNulls) but stop drawing
        // if there are no more points for this team.
        const match = team.timeline.find(p => p.time === time);
        if (match) {
            dataPoint[team.name] = match.score;
        } else {
            dataPoint[team.name] = null;
        }
      });
      
      return dataPoint;
    });
  }, [teams, visibleTeams]);

  return (
    <div className="w-full rounded-[34px] border border-white/10 bg-base-200 p-6 md:p-8">
      <h3 className="mb-6 text-lg font-semibold text-white">Score Progression</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.2)" 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              minTickGap={30}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#040d1a', // base-300
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#ffffff', // base-content
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {teams.map((team, index) => (
              visibleTeams.has(team.name) && (
                <Line
                  key={team.id}
                  type="linear"
                  dataKey={team.name}
                  stroke={TEAM_COLORS[index % TEAM_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 1, fill: TEAM_COLORS[index % TEAM_COLORS.length] }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1000}
                  connectNulls
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreChart;
