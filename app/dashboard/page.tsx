"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange, logOut } from "@/lib/auth";
import { getUserData, getLessons } from "@/lib/firestore";
import { User, Lesson } from "@/types";
import { User as FirebaseUser } from "firebase/auth";
import StatsDisplay from "@/components/StatsDisplay";
import ProgressBar from "@/components/ProgressBar";
import LessonCard from "@/components/LessonCard";
import toast from "react-hot-toast";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }

      setUser(currentUser);

      // Fetch user data and lessons
      try {
        const [data, lessonList] = await Promise.all([
          getUserData(currentUser.uid),
          getLessons(),
        ]);

        setUserData(data);
        setLessons(lessonList);
      } catch (error: any) {
        toast.error("Failed to load data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await logOut();
    if (error) {
      toast.error(error);
    } else {
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  const getNextLesson = () => {
    if (!userData || lessons.length === 0) return null;
    
    const nextLesson = lessons.find(
      (lesson) => !userData.completedLessons.includes(lesson.id)
    );
    
    return nextLesson || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Failed to load user data</p>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const completedCount = userData.completedLessons.length;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome back, {userData.displayName}! 👋
            </h1>
            <p className="text-gray-600">
              Continue your journey of faith and growth
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Stats */}
        <StatsDisplay
          totalXP={userData.totalXP}
          level={userData.level}
          streak={userData.currentStreak}
        />

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Progress to Next Level
          </h2>
          <ProgressBar currentXP={userData.totalXP} level={userData.level} />
        </div>

        {/* Continue Learning Button */}
        {nextLesson && (
          <div className="mb-8">
            <Link href={`/lesson/${nextLesson.id}`}>
              <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 text-center">
                <h2 className="text-2xl font-bold mb-2">
                  {completedCount === 0
                    ? "Start Your First Lesson"
                    : "Continue Learning"}
                </h2>
                <p className="text-primary-100">
                  {nextLesson.title} • +{nextLesson.xpReward} XP
                </p>
              </div>
            </Link>
          </div>
        )}

        {/* Lessons List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            All Lessons ({completedCount}/{lessons.length} completed)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={userData.completedLessons.includes(lesson.id)}
              />
            ))}
          </div>
        </div>

        {completedCount === lessons.length && lessons.length > 0 && (
          <div className="bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-xl p-6 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-2">🎉 Congratulations! 🎉</h2>
            <p className="text-lg">
              You've completed all available lessons! Keep checking back for new content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

