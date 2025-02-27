import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Dimensions,
} from "react-native";
import { TextInput, Text, Surface, Portal } from "react-native-paper";

const AutocompleteInput = ({
  label,
  value,
  onChangeText,
  suggestions = [],
  onSelectSuggestion,
  style,
  required = false,
  disabled = false,
  placeholder = "",
  fetchSuggestions = null,
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [inputLayout, setInputLayout] = useState(null);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (value && suggestions.length > 0) {
      const filtered = suggestions
        .filter((item) => item.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5); // Limit to 5 suggestions
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [value, suggestions]);

  const handleFocus = async () => {
    if (fetchSuggestions) {
      setLoading(true);
      try {
        await fetchSuggestions();
      } finally {
        setLoading(false);
      }
    }
    setShowSuggestions(true);
    measureInput();
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionPress = (suggestion) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    } else {
      onChangeText(suggestion);
    }
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  // Get the input position for positioning the dropdown
  const measureInput = () => {
    if (inputRef.current && inputRef.current.measureInWindow) {
      inputRef.current.measureInWindow((x, y, width, height) => {
        setInputLayout({ x, y, width, height });
      });
    }
  };

  // Render suggestions using Portal
  const renderSuggestions = () => {
    if (!showSuggestions || filteredSuggestions.length === 0) return null;

    return (
      <Portal>
        <View
          style={[
            styles.suggestionsWrapper,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "transparent",
              justifyContent: "flex-start",
              alignItems: "center",
              zIndex: 9999,
            },
          ]}
          pointerEvents="box-none"
        >
          <Surface
            style={[
              styles.suggestionsContainer,
              {
                position: "absolute",
                top: inputLayout ? inputLayout.y + inputLayout.height + 2 : 100,
                width: inputLayout ? inputLayout.width : screenWidth - 32,
                left: inputLayout ? inputLayout.x : 16,
                maxHeight: 200,
              },
            ]}
          >
            {filteredSuggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(item)}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </Surface>
        </View>
      </Portal>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredLabel}>*</Text>}
        </View>
      )}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        mode="outlined"
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
      />

      {loading && (
        <Text style={styles.loadingText}>Loading suggestions...</Text>
      )}

      {renderSuggestions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  labelContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  requiredLabel: {
    color: "red",
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#fff",
  },
  portalContainer: {
    zIndex: 9999,
    left: 0,
    right: 0,
  },
  suggestionsContainer: {
    maxHeight: 200,
    borderRadius: 4,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  loadingText: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  suggestionsWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 9999,
  },
});

export default AutocompleteInput;
