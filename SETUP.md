# Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Firebase**
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication → Email/Password
   - Create Firestore Database (start in test mode, then update rules)
   - Copy your Firebase config to `.env.local`

3. **Create `.env.local` file**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   ```

4. **Set Firestore Security Rules**
   Go to Firestore → Rules and paste:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /lessons/{lessonId} {
         allow read: if request.auth != null;
         allow write: if false;
       }
     }
   }
   ```

5. **Initialize Lessons**
   Option A: Use the API endpoint (after starting dev server):
   ```bash
   curl -X POST http://localhost:3000/api/init-lessons
   ```
   
   Option B: Manually add lessons in Firebase Console (see README.md)

6. **Run the app**
   ```bash
   npm run dev
   ```

7. **Open browser**
   Navigate to http://localhost:3000

## Troubleshooting

- **"Firebase: Error (auth/configuration-not-found)"**: Check your `.env.local` file has all required variables
- **"Permission denied"**: Check Firestore security rules are set correctly
- **Lessons not showing**: Make sure lessons are initialized in Firestore
- **Auth not working**: Ensure Email/Password is enabled in Firebase Authentication

