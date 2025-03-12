import React from "react";
import { Image, View, StyleSheet } from "react-native";

// Base URL for all logos
const BASE_LOGO_URL =
  "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/";

const BrandLogo = ({ brand, style }) => {
  if (!brand) return <View style={[styles.placeholder, style]} />;

  // Normalize the brand name for lookup
  const normalizedBrand = brand
    .toLowerCase()
    .trim()
    .replace(/[-\s]+/g, "-");

  // Construct the URL directly
  const logoSource = { uri: `${BASE_LOGO_URL}${normalizedBrand}.png` };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={logoSource}
        style={styles.logo}
        resizeMode="contain"
        onError={(e) => {
          console.log("Error loading image:", e.nativeEvent.error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 60,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  logo: {
    width: "80%",
    height: "80%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
    backgroundColor: "#f5f5f5",
  },
});

export default BrandLogo;
