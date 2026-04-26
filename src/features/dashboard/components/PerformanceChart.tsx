// src/features/dashboard/components/PerformanceChart.tsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyStat } from '../types';

interface PerformanceChartProps {
  data: DailyStat[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)"/>
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(str) => new Date(str).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip 
            contentStyle={{ 
                backgroundColor: 'rgba(31, 41, 55, 0.8)', // bg-gray-800 with opacity
                borderColor: '#4b5563', // border-gray-600
                borderRadius: '0.5rem', // rounded-lg
                color: '#d1d5db' // text-gray-300
            }}
            labelStyle={{ fontWeight: 'bold', color: 'white' }}
        />
        <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
        <Line type="monotone" dataKey="views" name="Vues" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="likes" name="Likes" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="comments" name="Comms" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="shares" name="Partages" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
