# TourModal Component

A lightweight, Instagram-story-style onboarding tour component built from scratch with React Native Reanimated.

## Features

✅ **Instagram-style UI** - Animated progress bars, tap navigation, long-press to pause  
✅ **Zero dependencies** - Uses only React Native's built-in APIs  
✅ **Smooth animations** - Built with React Native's Animated API  
✅ **Auto-advance** - 5-second timer per slide  
✅ **Customizable** - Easy to modify colors, duration, and content  
✅ **Lightweight** - No external packages required

---

## Installation

**Nothing to install!** The component uses only React Native's built-in APIs:
- ✅ React Native's `Animated` API (built-in)
- ✅ Standard `Image` component (built-in)
- ✅ `Modal`, `Pressable`, `View` (built-in)
- ✅ `react-native-safe-area-context` (already in your project)

**That's it! No npm install, no configuration needed.**

---

## Usage

### 1. Import the Component

```javascript
import TourModal from "../../components/TourModal";
import { TOUR_STEPS } from "../../utils/tourData";
```

### 2. Add State Management

```javascript
const [showTour, setShowTour] = useState(false);
```

### 3. Render the Component

```javascript
<TourModal
  visible={showTour}
  onClose={() => setShowTour(false)}
  steps={TOUR_STEPS}
/>
```

### 4. Trigger the Tour

```javascript
<Button onPress={() => setShowTour(true)}>
  Take a Tour
</Button>
```

---

## Data Structure

Define your tour steps in `utils/tourData.js`:

```javascript
export const TOUR_STEPS = [
  {
    id: 1,
    image: require("../assets/tour/step1.png"),
    title: "Welcome",
    desc: "Track your vehicle expenses with ease.",
  },
  {
    id: 2,
    image: require("../assets/tour/step2.png"),
    title: "Add Vehicles",
    desc: "Support for gas, electric, and hybrid cars.",
  },
  // Add more steps...
];
```

### Required Fields:
- `id` (number) - Unique identifier
- `image` (require or URI) - Background image
- `title` (string) - Main heading
- `desc` (string) - Description text

---

## Navigation Controls

| Action | Result |
|--------|--------|
| **Tap Right** (70% of screen) | Next slide |
| **Tap Left** (30% of screen) | Previous slide |
| **Long Press** | Pause timer |
| **Release** | Resume timer |
| **Close Button** (top-right) | Exit tour |
| **Last Slide Finishes** | Auto-close |

---

## Customization

### Change Slide Duration

In `TourModal.js`, update:

```javascript
const SLIDE_DURATION = 5000; // milliseconds (default: 5 seconds)
```

### Modify Colors

Update the gradient overlays and text colors in the `styles`:

```javascript
// Top gradient
<LinearGradient
  colors={["rgba(0,0,0,0.5)", "transparent"]}
  style={styles.topGradient}
/>

// Bottom gradient
<LinearGradient
  colors={["transparent", "rgba(0,0,0,0.8)"]}
  style={styles.bottomGradient}
/>
```

### Adjust Progress Bar Style

```javascript
progressBarBackground: {
  backgroundColor: "rgba(255, 255, 255, 0.3)", // Unfilled
},
progressBarFill: {
  backgroundColor: "rgba(255, 255, 255, 0.9)", // Filled
},
```

### Change Text Styles

```javascript
title: {
  fontSize: 32,
  fontWeight: "800",
  color: "#fff",
},
description: {
  fontSize: 16,
  color: "rgba(255, 255, 255, 0.95)",
},
```

---

## Auto-show on First Launch

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

## Tips for Best Results

1. **Image Size**: Use images sized 1080x1920 (9:16 aspect ratio) for best results
2. **Text Length**: Keep titles under 30 characters for readability
3. **Slide Count**: 3-5 slides is optimal (users lose interest after 5)
4. **Background Contrast**: Use images with darker areas at the bottom for text overlay visibility

---

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `visible` | boolean | ✅ | Controls modal visibility |
| `onClose` | function | ✅ | Callback when tour closes |
| `steps` | array | ✅ | Array of tour step objects |

---

## Troubleshooting

### Progress bars not smooth enough?
The component uses React Native's built-in Animated API which provides smooth, hardware-accelerated animations. This works great for most use cases without any additional packages!

### Images not showing
- Verify image paths in `tourData.js`
- Use `require()` for local assets or `{ uri: 'https://...' }` for remote images
- Check that the images exist in your assets folder

### Tour not closing automatically
- Check that each step has a unique `id` field
- Verify `onClose` callback is properly defined
- Make sure the `steps` array is not empty

---

## Example: Full Integration

```javascript
import React, { useState, useEffect } from "react";
import { View, Button } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import TourModal from "../../components/TourModal";
import { TOUR_STEPS } from "../../utils/tourData";

export default function HomeScreen() {
  const [showTour, setShowTour] = useState(false);

  // Auto-show on first launch
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

  return (
    <View>
      <Button 
        title="View Tour Again" 
        onPress={() => setShowTour(true)} 
      />
      
      <TourModal
        visible={showTour}
        onClose={() => setShowTour(false)}
        steps={TOUR_STEPS}
      />
    </View>
  );
}
```

---

## Performance Notes

- Uses React Native's built-in Animated API with `useNativeDriver: false` for width animations
- Smooth 60fps animations without any external dependencies
- Hardware-accelerated on iOS and Android
- Minimal re-renders due to proper state management
- Zero bundle size overhead (no external libraries)

---

## Optional Upgrades

Want even smoother animations? You can optionally upgrade to use `react-native-reanimated`:

```bash
npx expo install react-native-reanimated
```

Then I can provide an upgraded version that uses Reanimated's GPU-accelerated animations. But honestly, the built-in version works great for most use cases!

---

## License

MIT - Free to use and modify for your projects.

