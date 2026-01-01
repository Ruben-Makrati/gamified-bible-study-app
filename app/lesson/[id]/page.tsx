"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import { getUserData, getLessons, completeLesson } from "@/lib/firestore";
import { User, Lesson } from "@/types";
import { User as FirebaseUser } from "firebase/auth";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LessonPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showXPGain, setShowXPGain] = useState(false);
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }

      setUser(currentUser);

      try {
        const [data, lessonList] = await Promise.all([
          getUserData(currentUser.uid),
          getLessons(),
        ]);

        setUserData(data);
        const foundLesson = lessonList.find((l) => l.id === lessonId);
        setLesson(foundLesson || null);

        if (!foundLesson) {
          toast.error("Lesson not found");
          router.push("/dashboard");
        }
      } catch (error: any) {
        toast.error("Failed to load lesson");
        console.error(error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, lessonId]);

  const handleCompleteLesson = async () => {
    if (!user || !lesson || !userData) return;

    if (userData.completedLessons.includes(lesson.id)) {
      toast.error("You've already completed this lesson");
      return;
    }

    setCompleting(true);

    try {
      const result = await completeLesson(user.uid, lesson.id);

      if (result.success && result.data) {
        // Show XP gain animation
        setShowXPGain(true);
        setTimeout(() => setShowXPGain(false), 2000);

        // Update local state
        setUserData({
          ...userData,
          totalXP: result.data.newTotalXP,
          level: result.data.newLevel,
          currentStreak: result.data.newStreak,
          completedLessons: [...userData.completedLessons, lesson.id],
        });

        // Show success messages
        toast.success(`+${result.data.xpGained} XP earned!`);
        
        if (result.data.leveledUp) {
          setTimeout(() => {
            toast.success(`🎉 Level Up! You're now Level ${result.data.newLevel}!`, {
              duration: 4000,
            });
          }, 500);
        }

        if (result.data.newStreak > userData.currentStreak) {
          setTimeout(() => {
            toast.success(`🔥 Streak: ${result.data.newStreak} days!`, {
              duration: 3000,
            });
          }, 1000);
        }

        // Redirect after a delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2500);
      } else {
        toast.error(result.error || "Failed to complete lesson");
        setCompleting(false);
      }
    } catch (error: any) {
      toast.error("An error occurred");
      console.error(error);
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !userData) {
    return null;
  }

  const isCompleted = userData.completedLessons.includes(lesson.id);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
          <p className="text-xl text-gray-600 italic">{lesson.verse}</p>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-6">
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {lesson.content}
            </div>
          </div>
        </div>

        {/* Bible Verse Highlight */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 border-l-4 border-primary-500 rounded-lg p-6 mb-6">
          <p className="text-lg font-semibold text-gray-800 mb-2">{lesson.verse}</p>
          <p className="text-gray-600 italic">
            Take a moment to reflect on this verse and how it applies to your life.
          </p>
        </div>

        {/* Complete Button */}
        {!isCompleted && (
          <div className="text-center">
            <button
              onClick={handleCompleteLesson}
              disabled={completing}
              className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative"
            >
              {completing ? "Completing..." : "Complete Lesson"}
              {showXPGain && (
                <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-3xl font-bold text-gold-500 animate-xp-gain">
                  +{lesson.xpReward} XP
                </span>
              )}
            </button>
            <p className="text-gray-600 mt-4">
              Complete this lesson to earn <span className="font-semibold text-gold-600">+{lesson.xpReward} XP</span>
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="text-center bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <p className="text-lg font-semibold text-green-800 mb-2">
              ✓ You've completed this lesson!
            </p>
            <p className="text-green-600 mb-4">
              You earned {lesson.xpReward} XP for completing this lesson.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

