# Gamified Bible Study Web App

A full-stack gamified Bible study web application built with Next.js 14, Firebase, and TypeScript.

## Features

- 🔐 **Authentication**: Email/password sign up and login with Firebase Auth
- 📚 **Lessons**: 5 engaging Bible study lessons with devotional content
- ⭐ **XP System**: Earn experience points by completing lessons
- 🏆 **Leveling**: Level up every 100 XP
- 🔥 **Daily Streaks**: Track your daily study streak
- 📊 **Dashboard**: View your progress, stats, and available lessons
- 📱 **Responsive**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project created
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd gamified-bible-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get your Firebase configuration

4. **Configure environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Initialize lessons in Firestore**
   - Run the development server: `npm run dev`
   - Open your browser console on any page
   - Run: `await fetch('/api/init-lessons', { method: 'POST' })`
   - Or manually add lessons using the Firebase Console

6. **Set up Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /lessons/{lessonId} {
         allow read: if request.auth != null;
         allow write: if false; // Only admins can write (use Firebase Admin SDK)
       }
     }
   }
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/app
  /page.tsx              # Landing/login page
  /dashboard/page.tsx    # User dashboard
  /lesson/[id]/page.tsx  # Individual lesson page
/components
  /AuthForm.tsx          # Login/signup form
  /LessonCard.tsx        # Lesson card component
  /ProgressBar.tsx       # XP progress bar
  /StatsDisplay.tsx      # User stats display
/lib
  /firebase.ts           # Firebase configuration
  /firestore.ts          # Firestore database functions
  /auth.ts               # Authentication functions
/types
  /index.ts              # TypeScript interfaces
```

## Features Explained

### XP & Leveling System
- Each lesson rewards 10 XP
- Level formula: `Math.floor(totalXP / 100) + 1`
- Progress bar shows XP needed for next level

### Daily Streak Logic
- Increments when completing a lesson on consecutive days
- Resets to 1 if a day is missed
- Same-day completions don't change the streak

### Lesson System
- 5 pre-loaded Bible study lessons
- Each lesson includes:
  - Title and Bible verse
  - Devotional content (2-3 paragraphs)
  - 10 XP reward
  - Sequential order

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Update Firebase Auth Domains**
   - Add your Vercel domain to Firebase Auth authorized domains

## Manual Lesson Initialization

If you need to manually initialize lessons, you can create an API route or use the Firebase Console:

1. Go to Firestore in Firebase Console
2. Create a collection named `lessons`
3. Add documents with the following structure:
   - `title`: string
   - `content`: string (2-3 paragraphs)
   - `verse`: string
   - `xpReward`: number (10)
   - `order`: number (1-5)

## Security Notes

- Never commit `.env.local` to version control
- Use Firebase Security Rules to protect user data
- Users can only read/write their own user documents
- Lessons are read-only for authenticated users

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

