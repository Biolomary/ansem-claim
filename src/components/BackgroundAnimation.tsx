// src/components/BackgroundAnimation.tsx
import React from 'react';

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-neon-purple/30 via-neon-pink/20 to-transparent blur-[120px] animate-float" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-neon-green/30 via-neon-blue/20 to-transparent blur-[120px] animate-float-delayed" />
      <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-neon-yellow/20 via-neon-purple/20 to-transparent blur-[100px] animate-pulse" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(153, 69, 255, 0.3) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(153, 69, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-neon-purple rounded-full animate-float opacity-50" />
      <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-neon-green rounded-full animate-float-delayed opacity-50" />
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-neon-blue rounded-full animate-pulse opacity-50" />
    </div>
  );
};

export default BackgroundAnimation;