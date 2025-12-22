// Tour slides data for the onboarding experience
// 
// Each slide can be either an image or a video:
// - For images: use { image: require("..."), duration: 5 }
// - For videos: use { video: require("..."), type: "video", duration: 5 }
//   (duration is optional for both - defaults to 5 seconds if not provided)

export const TOUR_STEPS = [
  {
    id: 1,
    image: require("../assets/tour/DT-Pro_myVehicles.png"),
    duration: 4,
    title: "My Vehicles",
    desc: "Track your vehicle expenses, fuel consumption, and charging sessions all in one place.",
  },
  {
    id: 2,
    video: require("../assets/tour/DT-Pro_addCharge.mp4"),
    type: "video",
    duration: 6,
    title: "Add a Charge",
    desc: "Add a charge to your vehicle to track your expenses.",
  },
  {
    id: 3,
    video: require("../assets/tour/DT-Pro_FordKugaDetails.mp4"),
    type: "video",
    duration: 4,
    title: "Vehicle Details",
    desc: "View detailed information about your vehicle, including fuel consumption, charging sessions, and more.",
  },
  {
    id: 4,
    image: require("../assets/welcomeScreenBg.png"),
    title: "Ready to Start?",
    desc: "Sign in with Google or Apple to begin tracking your vehicle expenses today!",
  },
];

