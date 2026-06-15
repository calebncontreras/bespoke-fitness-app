import React from 'react';
import type { Class } from '../../types';

const colorMap: [string[], string][] = [
  [['yoga'], 'bg-indigo-50 border-indigo-200 text-indigo-800'],
  [['pilates'], 'bg-pink-50 border-pink-200 text-pink-800'],
  [['hiit', 'interval', 'tabata'], 'bg-red-50 border-red-200 text-red-700'],
  [['spin', 'cycle', 'cycling'], 'bg-amber-50 border-amber-200 text-amber-700'],
  [['strength', 'weight', 'lifting'], 'bg-blue-50 border-blue-200 text-blue-800'],
  [['cardio', 'aerobic', 'zumba', 'dance'], 'bg-emerald-50 border-emerald-200 text-emerald-800'],
  [['barre', 'ballet'], 'bg-purple-50 border-purple-200 text-purple-800'],
  [['boxing', 'kickboxing', 'martial'], 'bg-orange-50 border-orange-200 text-orange-700'],
];

export function getClassColorClass(name: string): string {
  const lower = name.toLowerCase();
  for (const [keywords, cls] of colorMap) {
    if (keywords.some(k => lower.includes(k))) return cls;
  }
  return 'bg-gray-50 border-gray-200 text-gray-700';
}

interface ClassCardProps {
  classData: Class;
  isBooked: boolean;
  availableSpots: number;
  onClick: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData, isBooked, availableSpots, onClick }) => {
  const colorClass = getClassColorClass(classData.name);

  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={`w-full text-left p-2 rounded border transition-all ${colorClass} ${
        isBooked ? 'ring-2 ring-emerald-400' : 'hover:opacity-80'
      }`}
    >
      <p className="font-medium text-xs leading-tight truncate">{classData.name}</p>
      {classData.instructor && (
        <p className="text-xs font-light truncate opacity-75 mt-0.5">{classData.instructor}</p>
      )}
      {classData.location && (
        <p className="text-xs font-light truncate opacity-75">{classData.location}</p>
      )}
      <div className="flex items-center justify-between mt-1">
        <span className={`text-xs ${availableSpots === 0 ? 'text-red-500 font-medium' : 'font-light opacity-60'}`}>
          {availableSpots === 0 ? 'Full' : `${availableSpots} spots`}
        </span>
        {isBooked && <span className="text-xs text-emerald-600 font-medium">✓</span>}
      </div>
    </button>
  );
};

export default ClassCard;
