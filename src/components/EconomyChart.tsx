import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Nation } from '../game/types';

interface EconomyChartProps {
  nations: Record<string, Nation>;
  compareNations?: string[];
}

export default function EconomyChart({ nations, compareNations }: EconomyChartProps) {
  // Transform data for Recharts
  // We want an array of objects where each object represents a turn
  // e.g., { turn: 1, turkey: 100, usa: 200, ... }
  
  const maxTurns = Math.max(...Object.values(nations).map(n => n.economyHistory?.length || 0));
  
  const data = Array.from({ length: maxTurns }).map((_, index) => {
    const turnData: any = { turn: index + 1 };
    Object.values(nations).forEach(nation => {
      if (nation.economyHistory && nation.economyHistory[index] !== undefined) {
        turnData[nation.name] = nation.economyHistory[index];
      }
    });
    return turnData;
  });

  let nationsToShow = new Set<string>();
  
  if (compareNations && compareNations.length > 0) {
    compareNations.forEach(id => nationsToShow.add(id));
  } else {
    // Only show top 5 economies to avoid clutter, plus player
    const sortedNations = Object.values(nations).sort((a, b) => b.economy - a.economy);
    const topNations = sortedNations.slice(0, 5);
    const playerNation = Object.values(nations).find(n => n.isPlayer);
    
    topNations.forEach(n => nationsToShow.add(n.id));
    if (playerNation) nationsToShow.add(playerNation.id);
  }

  return (
    <div className="w-full h-64 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
      <h3 className="text-sm font-semibold text-neutral-300 mb-4">
        {compareNations ? 'Ekonomik Karşılaştırma' : 'Ekonomik Büyüme (İlk 5 + Oyuncu)'}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="turn" stroke="#888" tick={{fontSize: 12}} />
          <YAxis stroke="#888" tick={{fontSize: 12}} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {Object.values(nations)
            .filter(n => nationsToShow.has(n.id))
            .map(nation => (
              <Line 
                key={nation.id} 
                type="monotone" 
                dataKey={nation.name} 
                stroke={nation.color} 
                strokeWidth={nation.isPlayer ? 3 : 1.5}
                dot={false}
              />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
