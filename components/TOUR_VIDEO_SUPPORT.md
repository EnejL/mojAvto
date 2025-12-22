# TourModal Video Support

The TourModal component now supports **both images and videos**! 🎬

---

## Installation

To use video support, you need to install `expo-av`:

```bash
npx expo install expo-av
```

**Note**: If you only use images, you don't need to install `expo-av`. The component will work fine with just images.

---

## Usage

### Image Slides (No Installation Needed)

```javascript
{
  id: 1,
  image: require("../assets/tour/step1.png"),
  duration: 6, // Optional: duration in seconds (defaults to 5)
  title: "Welcome",
  desc: "Description here",
}
```

### Video Slides (Requires expo-av)

```javascript
{
  id: 2,
  video: require("../assets/tour/intro-video.mp4"),
  type: "video",
  duration: 8, // Optional: duration in seconds (defaults to 5)
  title: "Watch Our Intro",
  desc: "See how it works!",
}
```

---

## Data Structure

### Image Slide
```javascript
{
  id: number,           // Required: Unique identifier
  image: require(...),  // Required: Image source
  duration: number,     // Optional: Duration in seconds (defaults to 5)
  title: string,        // Optional: Title text
  desc: string,         // Optional: Description text
}
```

### Video Slide
```javascript
{
  id: number,           // Required: Unique identifier
  video: require(...),  // Required: Video source (local or remote)
  type: "video",        // Optional: Explicitly marks as video
  duration: number,     // Optional: Duration in seconds (defaults to 5)
  title: string,        // Optional: Title text
  desc: string,         // Optional: Description text
}
```

---

## Video Sources

### Local Video (Recommended)
```javascript
{
  video: require("../assets/tour/intro.mp4"),
  type: "video",
}
```

### Remote Video (URL)
```javascript
{
  video: { uri: "https://example.com/video.mp4" },
  type: "video",
  duration: 10,
}
```

---

## Features

✅ **Automatic Detection** - Component detects video vs image automatically  
✅ **Progress Sync** - Progress bar syncs with video playback  
✅ **Pause/Resume** - Long-press pauses both videos and timers  
✅ **Auto-advance** - Moves to next slide when slide finishes  
✅ **Custom Duration** - Set custom duration per slide (works for both images and videos!)  
✅ **Seamless Mixing** - Mix images and videos in the same tour  

---

## Example: Mixed Tour with Custom Durations

```javascript
export const TOUR_STEPS = [
  {
    id: 1,
    image: require("../assets/tour/welcome.png"),
    duration: 6, // Custom duration for image slide
    title: "Welcome",
    desc: "Static image slide with 6 second duration",
  },
  {
    id: 2,
    video: require("../assets/tour/demo.mp4"),
    type: "video",
    duration: 10, // Custom duration for video slide
    title: "Watch Demo",
    desc: "Video slide with 10 second duration",
  },
  {
    id: 3,
    image: require("../assets/tour/final.png"),
    // No duration specified - uses default 5 seconds
    title: "Get Started",
    desc: "Another static image with default duration",
  },
];
```

---

## Video Requirements

### Supported Formats
- **iOS**: `.mp4`, `.mov`, `.m4v`
- **Android**: `.mp4`, `.3gp`, `.webm`
- **Web**: `.mp4`, `.webm`

### Recommended Settings
- **Codec**: H.264
- **Resolution**: 1080x1920 (9:16 aspect ratio for full screen)
- **Frame Rate**: 30fps
- **Bitrate**: 2-5 Mbps (for good quality/size balance)

### File Size Tips
- Keep videos under 10MB for better performance
- Use compression tools like HandBrake or FFmpeg
- Consider shorter clips (5-10 seconds) for better UX

---

## Troubleshooting

### Video not playing
- Make sure `expo-av` is installed: `npx expo install expo-av`
- Check video file path is correct
- Verify video format is supported (see above)
- For remote videos, ensure URL is accessible

### Video progress not syncing
- Make sure `duration` is set correctly (in seconds)
- Check that video file is not corrupted
- Try restarting the app

### Video plays but doesn't auto-advance
- Ensure `duration` matches actual video length
- Check that video completes (not cut off)
- Verify `onPlaybackStatusUpdate` is working

---

## Performance Tips

1. **Optimize Videos**: Compress videos before adding to assets
2. **Preload**: Videos are loaded when slide becomes active
3. **Short Clips**: Keep videos under 15 seconds for best UX
4. **Mix Media**: Use images for static content, videos for demos

---

## Fallback Behavior

If `expo-av` is not installed and you try to use a video slide:
- The component will show an error or blank screen
- Install `expo-av` to enable video support
- Or remove video slides and use only images

---

## Ready to Use!

Once `expo-av` is installed, you can start adding video slides to your tour immediately! 🚀

