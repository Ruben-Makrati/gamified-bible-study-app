"use client";

import { Lesson } from "@/types";
import Link from "next/link";

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
}

export default function LessonCard({ lesson, isCompleted }: LessonCardProps) {
  return (
    <Link href={`/lesson/${lesson.id}`}>
      <div
        className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border-2 ${
          isCompleted
            ? "border-green-200 bg-green-50"
            : "border-gray-200 hover:border-primary-300"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                Lesson {lesson.order}
              </span>
              {isCompleted && (
                <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  ✓ Completed
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{lesson.title}</h3>
            <p className="text-sm text-gray-600 italic mb-3">{lesson.verse}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gold-600 font-semibold">
            <span>⭐</span>
            <span>+{lesson.xpReward} XP</span>
          </div>
          <span className="text-primary-600 font-medium hover:text-primary-700">
            {isCompleted ? "Review →" : "Start →"}
          </span>
        </div>
      </div>
    </Link>
  );
}

