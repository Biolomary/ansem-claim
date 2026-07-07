// src/components/StatsBanner.tsx
import React, { useEffect, useState } from 'react';

interface StatProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

const StatsBanner: React.FC = () => {
  const [stats] = useState<StatProps[]>([
    {
      label: 'Total Value Locked',
      value: '$24.8M',
      change: '+12.5%',
      isPositive: true,
      icon: '🔒'
    },
    {
      label: '24h Volume',
      value: '$3.2M',
      change: '+8.3%',
      isPositive: true,
      icon: '📊'
    },
    {
      label: 'Token Price',
      value: '$1.24',
      change: '-2.1%',
      isPositive: false,
      icon: '💎'
    },
    {
      label: 'Holders',
      value: '12.4K',
      change: '+156',
      isPositive: true,
      icon: '👥'
    }
  ]);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="relative group animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Glass card */}
            <div className="relative p-4 rounded-2xl bg-dark-800/50 backdrop-blur-xl border border-white/5 hover:border-neon-purple/30 transition-all duration-300 hover:shadow-neon-purple">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-purple/5 to-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-medium">{stat.label}</span>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <div className="text-white font-bold text-lg mb-1">{stat.value}</div>
                <div className={`text-xs font-medium ${stat.isPositive ? 'text-neon-green' : 'text-neon-pink'}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBanner;