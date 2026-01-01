import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { User, Lesson } from "@/types";

// Create user profile in Firestore
export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string
) {
  try {
    const userRef = doc(db, "users", uid);
    const userData: Omit<User, "uid"> = {
      email,
      displayName,
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      lastCompletedDate: null,
      completedLessons: [],
      createdAt: serverTimestamp() as Timestamp,
    };
    await setDoc(userRef, userData);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get user data
export async function getUserData(uid: string): Promise<User | null> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { uid, ...userSnap.data() } as User;
    }
    return null;
  } catch (error: any) {
    console.error("Error getting user data:", error);
    return null;
  }
}

// Get all lessons
export async function getLessons(): Promise<Lesson[]> {
  try {
    const lessonsRef = collection(db, "lessons");
    const q = query(lessonsRef, orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    
    const lessons: Lesson[] = [];
    querySnapshot.forEach((doc) => {
      lessons.push({ id: doc.id, ...doc.data() } as Lesson);
    });
    
    return lessons;
  } catch (error: any) {
    console.error("Error getting lessons:", error);
    return [];
  }
}

// Update streak logic
export function updateStreak(
  lastCompletedDate: Date | null,
  currentStreak: number
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!lastCompletedDate) return 1;

  const lastDate = new Date(lastCompletedDate);
  lastDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return currentStreak; // Same day, no change
  if (diffDays === 1) return currentStreak + 1; // Next day, increment
  return 1; // Missed days, reset to 1
}

// Complete lesson
export async function completeLesson(userId: string, lessonId: string) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: "User not found" };
    }

    const userData = userSnap.data() as Omit<User, "uid">;

    // Check if lesson already completed
    if (userData.completedLessons.includes(lessonId)) {
      return { success: false, error: "Lesson already completed" };
    }

    // Get lesson to get XP reward
    const lessonRef = doc(db, "lessons", lessonId);
    const lessonSnap = await getDoc(lessonRef);
    
    if (!lessonSnap.exists()) {
      return { success: false, error: "Lesson not found" };
    }

    const lessonData = lessonSnap.data() as Lesson;
    const xpReward = lessonData.xpReward || 10;

    // Calculate new values
    const newTotalXP = userData.totalXP + xpReward;
    const newLevel = Math.floor(newTotalXP / 100) + 1;
    
    // Update streak
    const lastDate = userData.lastCompletedDate
      ? userData.lastCompletedDate.toDate()
      : null;
    const newStreak = updateStreak(lastDate, userData.currentStreak);

    // Update user document
    await updateDoc(userRef, {
      totalXP: newTotalXP,
      level: newLevel,
      currentStreak: newStreak,
      lastCompletedDate: serverTimestamp(),
      completedLessons: [...userData.completedLessons, lessonId],
    });

    return {
      success: true,
      error: null,
      data: {
        xpGained: xpReward,
        newTotalXP,
        newLevel,
        leveledUp: newLevel > userData.level,
        newStreak,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Calculate XP needed for next level
export function calculateNextLevelXP(level: number): number {
  return level * 100;
}

// Initialize lessons in Firestore (run once to seed data)
export async function initializeLessons() {
  const lessons: Omit<Lesson, "id">[] = [
    {
      title: "Faith and Trust",
      content: `Trusting in God requires us to let go of our own understanding and lean on His wisdom. When we face uncertainty, it's natural to want to control every outcome, but true faith means surrendering our plans to God's perfect will.

Proverbs 3:5-6 reminds us that when we trust in the Lord with all our heart and acknowledge Him in all our ways, He will make our paths straight. This doesn't mean life will be easy, but it means we can have confidence that God is guiding us toward His purpose for our lives.

Take a moment today to identify one area where you're struggling to trust God. Pray for the strength to release control and trust in His timing and plan.`,
      verse: "Proverbs 3:5-6",
      xpReward: 10,
      order: 1,
    },
    {
      title: "Love Your Neighbor",
      content: `Jesus taught that the second greatest commandment is to love your neighbor as yourself. This command challenges us to extend the same care, compassion, and concern we have for ourselves to those around us.

Loving our neighbor isn't just about being nice—it's about actively seeking the good of others, even when it's inconvenient or uncomfortable. It means seeing the image of God in every person we meet and treating them with dignity and respect.

Today, look for opportunities to show love in practical ways. It might be a kind word, a helping hand, or simply taking time to listen. Every act of love, no matter how small, reflects God's love to the world.`,
      verse: "Matthew 22:39",
      xpReward: 10,
      order: 2,
    },
    {
      title: "Finding Peace",
      content: `In a world filled with anxiety and worry, God offers us a peace that surpasses all understanding. This peace isn't the absence of trouble, but the presence of God's comfort and assurance in the midst of life's storms.

Philippians 4:6-7 teaches us that instead of being anxious, we should present our requests to God with thanksgiving. When we do this, God's peace will guard our hearts and minds. This is a peace that the world cannot give and circumstances cannot take away.

When you feel anxious or worried today, pause and pray. Thank God for what He's already done, and trust Him with what's to come. His peace is available to you right now.`,
      verse: "Philippians 4:6-7",
      xpReward: 10,
      order: 3,
    },
    {
      title: "Strength in Weakness",
      content: `God's power is made perfect in our weakness. This truth turns our understanding of strength upside down. Instead of hiding our weaknesses, we can boast in them because they become opportunities for God's grace to shine through.

When Paul asked God to remove his "thorn in the flesh," God responded that His grace was sufficient. This teaches us that our limitations aren't obstacles to God's work—they're invitations for Him to work through us in ways we never could on our own.

Embrace your weaknesses today, not as failures, but as places where God's strength can be most clearly seen. His power is enough for whatever you're facing.`,
      verse: "2 Corinthians 12:9",
      xpReward: 10,
      order: 4,
    },
    {
      title: "Forgiveness",
      content: `Forgiveness is one of the most powerful and challenging aspects of the Christian life. Ephesians 4:32 calls us to be kind and compassionate, forgiving one another, just as in Christ God forgave us.

Forgiveness doesn't mean pretending the hurt didn't happen or that it doesn't matter. It means choosing to release the debt, to let go of the right to revenge, and to trust God with justice. When we forgive, we're following the example of Christ, who forgave us while we were still sinners.

Is there someone you need to forgive today? Take the first step, even if it's just in your heart. Forgiveness is a process, but it begins with a decision to let go and let God heal.`,
      verse: "Ephesians 4:32",
      xpReward: 10,
      order: 5,
    },
  ];

  try {
    const lessonsRef = collection(db, "lessons");
    
    for (const lesson of lessons) {
      const lessonDoc = doc(lessonsRef);
      await setDoc(lessonDoc, lesson);
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

