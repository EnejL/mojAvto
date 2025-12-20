# TourModal Installation Guide

## ✨ Zero Dependencies Required!

The TourModal component has been built using **only React Native's built-in APIs**. No additional packages need to be installed!

### What's Included:
- ✅ React Native's built-in `Animated` API (for smooth progress bars)
- ✅ Standard `Image` component
- ✅ Native `Modal`, `Pressable`, and `View` components
- ✅ `react-native-safe-area-context` (already in your project)

---

## Quick Start

### Step 1: You're Ready to Go!

Since the component uses only built-in React Native APIs, there's **nothing to install**. Just import and use it:

```javascript
import TourModal from './components/TourModal';
import { TOUR_STEPS } from './utils/tourData';

// In your component:
const [showTour, setShowTour] = useState(false);

<TourModal 
  visible={showTour} 
  onClose={() => setShowTour(false)} 
  steps={TOUR_STEPS} 
/>
```

### Step 2: Create Tour Assets

1. Create a folder: `assets/tour/`
2. Add your tour images (recommended size: 1080x1920 or 9:16 aspect ratio)
3. Update `utils/tourData.js` with correct image paths

---

## Quick Test

Test the component immediately:

```javascript
import { useState } from 'react';
import { Button, View } from 'react-native';
import TourModal from './components/TourModal';
import { TOUR_STEPS } from './utils/tourData';

export default function App() {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Show Tour" onPress={() => setVisible(true)} />
      <TourModal 
        visible={visible} 
        onClose={() => setVisible(false)} 
        steps={TOUR_STEPS} 
      />
    </View>
  );
}
```

---

## Troubleshooting

### Images not loading
- Check that image paths in `tourData.js` are correct
- For local images, use `require('../assets/...')`
- For remote images, use `{ uri: 'https://...' }`

### Progress bars not smooth enough?
The component uses React Native's built-in Animated API which is hardware-accelerated and smooth for most use cases. If you need even smoother animations, you can optionally install `react-native-reanimated` and I can provide an upgraded version.

### Modal not showing
- Make sure `visible={true}` is passed
- Check that `steps` array is not empty
- Verify each step has `id`, `image`, `title`, and `desc` fields

---

## Platform-Specific Notes

### iOS
✅ Works out of the box

### Android
✅ Works out of the box

### Web
✅ Works with React Native Web (all APIs used are web-compatible)

---

## Optional: Auto-show on First Launch

To show the tour automatically on first app launch:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

useEffect(() => {
  const checkFirstLaunch = async () => {
    const hasSeenTour = await AsyncStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setShowTour(true);
      await AsyncStorage.setItem('hasSeenTour', 'true');
    }
  };
  checkFirstLaunch();
}, []);
```

---

## Upgrade Options (Optional)

If you want even smoother animations, you can optionally install these packages:

### For Smoother Animations:
```bash
npx expo install react-native-reanimated
```
Then update `babel.config.js`:
```javascript
plugins: ['react-native-reanimated/plugin'], // Must be last
```

### For Better Gradients:
```bash
npx expo install expo-linear-gradient
```

**But remember**: The current version works great without these!

---

## Ready to Use

The TourModal is ready to use right now with **zero setup**! 

See `TourModal.README.md` for full usage documentation.
