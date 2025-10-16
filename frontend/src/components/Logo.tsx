import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Outer circle with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          
          {/* Main circle */}
          <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" className="animate-pulse-slow" />
          
          {/* Bank building icon */}
          <g transform="translate(25, 25)">
            {/* Building pillars */}
            <rect x="8" y="20" width="6" height="25" fill="white" opacity="0.95" />
            <rect x="21" y="20" width="6" height="25" fill="white" opacity="0.95" />
            <rect x="34" y="20" width="6" height="25" fill="white" opacity="0.95" />
            
            {/* Building top */}
            <path d="M 3 20 L 25 8 L 47 20 Z" fill="white" opacity="0.95" />
            
            {/* Building base */}
            <rect x="3" y="45" width="44" height="5" fill="white" opacity="0.95" />
            
            {/* Dollar sign in center */}
            <text x="25" y="38" fontSize="16" fontWeight="bold" fill="#1E40AF" textAnchor="middle">$</text>
          </g>
        </svg>
      </div>
      {size !== 'sm' && (
        <div className="flex flex-col">
          <span className={`font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent ${
            size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-3xl' : 'text-2xl'
          }`}>
            MiniBank
          </span>
          <span className={`text-gray-600 ${
            size === 'xl' ? 'text-base' : 'text-xs'
          } tracking-wider`}>
            TRUSTED FINANCIAL SOLUTIONS
          </span>
        </div>
      )}
    </div>
  );
}
