# 🌱 HabitGrid – Minimal Habit Tracker

HabitGrid is a clean, offline-first habit tracking app for Android that helps you build consistency through visual progress and gentle daily reminders. No accounts, no cloud, no distractions — just you and your habits.

## ✨ Features

- ✅ **Daily Habit Tracking** – Mark habits complete with a single tap and haptic feedback
- 📊 **GitHub-Style Heatmap** – Visualize your consistency across weeks with a 7-row contribution grid
- 🔥 **Streaks & Streak Freezes** – Track current and longest streaks; freezes protect you on off days
- 📅 **Weekly Habit Rules** – Choose specific days of the week for each habit
- 🔔 **Local Notifications** – Native Android reminders at your chosen time (no internet needed)
- 📝 **Quick Notes** – Capture thoughts instantly with a floating quick-note overlay
- ✋ **Long-Press Reorder** – Rearrange habits with intuitive drag gestures
- 📈 **Stats & Calendar Views** – See your progress over time
- 💾 **100% Offline** – All data stored locally on your device (LocalStorage)
- 📤 **Export Data** – Download your habits and history as JSON or CSV
- 🎨 **Minimal Light Theme** – Plus Jakarta Sans typography, soft greens, distraction-free

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Mobile:** Capacitor 6 (Android, JDK 21)
- **Storage:** LocalStorage (offline-first)
- **Notifications:** Capacitor Local Notifications

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run the web dev server
npm run dev
```

## 📱 Build the Android APK

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

## 📥 Download

Pre-built APKs are available in the [Releases](../../releases) section.

## 📄 License

MIT
