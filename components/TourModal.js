import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Text,
  Dimensions,
  StatusBar,
  Image,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_DURATION = 5000; // 5 seconds per slide

// Progress Bar Component
function ProgressBar({ isActive, isPast, progress }) {
  const animatedWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progressBarBackground,
          isPast && styles.progressBarFilled,
        ]}
      >
        {isActive && (
          <Animated.View style={[styles.progressBarFill, { width: animatedWidth }]} />
        )}
      </View>
    </View>
  );
}

// Main TourModal Component
export default function TourModal({ visible, onClose, steps = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);
  const insets = useSafeAreaInsets();

  const currentSlide = steps[currentIndex];
  const isLastSlide = currentIndex === steps.length - 1;

  // Start or resume timer
  const startTimer = () => {
    startTimeRef.current = Date.now();
    const remainingTime = SLIDE_DURATION - elapsedRef.current;
    const remainingPercent = (remainingTime / SLIDE_DURATION) * 100;

    Animated.timing(progress, {
      toValue: 100,
      duration: remainingTime,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        // Move to next slide or close
        if (isLastSlide) {
          onClose();
        } else {
          goToNext();
        }
      }
    });
  };

  // Pause timer
  const pauseTimer = () => {
    progress.stopAnimation((value) => {
      elapsedRef.current = (value / 100) * SLIDE_DURATION;
    });
  };

  // Reset timer for new slide
  const resetTimer = () => {
    progress.stopAnimation();
    elapsedRef.current = 0;
    startTimeRef.current = null;
    progress.setValue(0);
  };

  // Navigate to next slide
  const goToNext = () => {
    if (currentIndex < steps.length - 1) {
      resetTimer();
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  // Navigate to previous slide
  const goToPrevious = () => {
    if (currentIndex > 0) {
      resetTimer();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Handle tap navigation
  const handleTap = (evt) => {
    const { locationX } = evt.nativeEvent;
    const leftThreshold = SCREEN_WIDTH * 0.3;

    if (locationX < leftThreshold) {
      goToPrevious();
    } else {
      goToNext();
    }
  };

  // Handle long press
  const handlePressIn = () => {
    setIsPaused(true);
    pauseTimer();
  };

  const handlePressOut = () => {
    setIsPaused(false);
  };

  // Timer management
  useEffect(() => {
    if (visible && !isPaused) {
      startTimer();
    }

    return () => {
      progress.stopAnimation();
    };
  }, [visible, isPaused, currentIndex]);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      resetTimer();
    }
  }, [visible]);

  if (!visible || steps.length === 0) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Background Image */}
        <Image
          source={currentSlide.image}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Top Overlay */}
        <View style={styles.topGradient} />

        {/* Progress Bars */}
        <View style={[styles.progressContainer, { paddingTop: insets.top + 12 }]}>
          {steps.map((step, index) => (
            <ProgressBar
              key={step.id}
              isActive={index === currentIndex}
              isPast={index < currentIndex}
              progress={progress}
            />
          ))}
        </View>

        {/* Close Button */}
        <Pressable
          style={[styles.closeButton, { top: insets.top + 12 }]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>

        {/* Tap Areas for Navigation */}
        <Pressable
          style={styles.tapArea}
          onPress={handleTap}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        />

        {/* Bottom Content Overlay */}
        <View style={styles.bottomGradient}>
          <View style={[styles.contentContainer, { paddingBottom: insets.bottom + 24 }]}>
            {currentSlide.title && (
              <Text style={styles.title}>{currentSlide.title}</Text>
            )}
            {currentSlide.desc && (
              <Text style={styles.description}>{currentSlide.desc}</Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  progressContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 8,
    gap: 4,
    zIndex: 2,
  },
  progressBarContainer: {
    flex: 1,
    height: 3,
  },
  progressBarBackground: {
    flex: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFilled: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 2,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  tapArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 100,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 2,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
