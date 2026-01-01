"use client";

interface StatsDisplayProps {
  totalXP: number;
  level: number;
  streak: number;
}

export default function StatsDisplay({ totalXP, level, streak }: StatsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total XP</p>
            <p className="text-3xl font-bold text-primary-600">{totalXP}</p>
          </div>
          <div className="text-4xl">⭐</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-accent-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Level</p>
            <p className="text-3xl font-bold text-accent-600">{level}</p>
          </div>
          <div className="text-4xl">🏆</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gold-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Daily Streak</p>
            <p className="text-3xl font-bold text-gold-600">{streak}</p>
          </div>
          <div className={`text-4xl ${streak > 0 ? "animate-streak-celebration" : ""}`}>
            🔥
          </div>
        </div>
      </div>
    </div>
  );
}

