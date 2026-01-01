"use client";

import { calculateNextLevelXP } from "@/lib/firestore";

interface ProgressBarProps {
  currentXP: number;
  level: number;
}

export default function ProgressBar({ currentXP, level }: ProgressBarProps) {
  const currentLevelXP = (level - 1) * 100;
  const nextLevelXP = calculateNextLevelXP(level);
  const progressXP = currentXP - currentLevelXP;
  const progressNeeded = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min((progressXP / progressNeeded) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Level {level}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {progressXP} / {progressNeeded} XP
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 ease-out rounded-full relative"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {progressNeeded - progressXP} XP until Level {level + 1}
      </p>
    </div>
  );
}

