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

        let score = 0;
        for (const point of team.timeline) {
            if (point.time <= time) {
                score = point.score;
            } else {
                break;
            }
        }
        dataPoint[team.name] = score;
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
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#666" 
              tick={{ fill: '#888', fontSize: 12 }}
              tickLine={{ stroke: '#444' }}
              minTickGap={30}
            />
            <YAxis 
              stroke="#666" 
              tick={{ fill: '#888', fontSize: 12 }}
              tickLine={{ stroke: '#444' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                borderColor: '#333',
                color: '#fff',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ color: '#888', marginBottom: '0.5rem' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {teams.map((team, index) => (
              visibleTeams.has(team.name) && (
                <Line
                  key={team.id}
                  type="monotone"
                  dataKey={team.name}
                  stroke={TEAM_COLORS[index % TEAM_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
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
