# Sleep Buddy

A React Native (Expo) sleep tracking app with a premium, calming design aesthetic.

## Architecture
- **Frontend**: Expo Router with file-based routing, React Native
- **Backend**: Express server (port 5000) — serves landing page and API
- **State**: React Context (SleepContext) for shared sleep session state
- **Storage**: AsyncStorage for onboarding completion persistence

## Design System
- **Theme**: Deep blue backgrounds (#0B0F1E), soft indigo accents (#6C63FF), lavender (#A78BFA), warm amber (#FBBF24), mint green (#34D399), soft coral (#FB7185), sky blue (#60A5FA)
- **Inspiration**: Premium sleep app — calming, rounded shapes, generous spacing
- **Font**: Inter (400, 500, 600, 700 weights)
- **Icons**: @expo/vector-icons (Ionicons, MaterialCommunityIcons, Feather)

## Screens
- **Index Redirect** (`app/index.tsx`): Checks AsyncStorage, redirects to onboarding or tabs
- **Onboarding** (`app/onboarding.tsx`): 4-slide horizontal pager with animated icons, skip/next/get started
- **Home** (`app/(tabs)/index.tsx`): Start/Stop sleep button with pulse animation, sound picker (6 sounds), timer selector (30/45/60/unlimited), snore detection simulation
- **Sounds** (`app/(tabs)/sounds.tsx`): Grid of 6 ambient sounds with play/pause, volume slider
- **Report** (`app/(tabs)/report.tsx`): Sleep summary (total time, deep sleep, snore count, loudest, wake-ups), 7-day bar chart, insights, export
- **Settings** (`app/(tabs)/settings.tsx`): Auto-restart toggle, privacy info, about, reset onboarding

## Key Files
- `constants/colors.ts` — Theme color palette
- `contexts/SleepContext.tsx` — Sleep session state, sounds data, timer logic
- `components/Slider.tsx` — Custom volume slider with PanResponder
- `components/ErrorBoundary.tsx` — Error boundary wrapper

## Navigation
- Bottom tab bar with 4 tabs: Home, Sounds, Report, Settings
- Supports NativeTabs (liquid glass on iOS 26+) with classic Tabs fallback
- Onboarding at `/onboarding` route — shows once, then redirects to tabs (stored in AsyncStorage key "sleep_buddy_onboarded")
- Settings "Show Onboarding" navigates to `/onboarding` after clearing AsyncStorage

## Important Patterns
- Never wrap Pressable in Animated.View with scale transforms — animations go on decorative sibling elements
- Never call useAnimatedStyle inside .map() — extract to separate components
- Sound data in SleepContext has per-sound `color` and `bgColor` for dynamic theming
