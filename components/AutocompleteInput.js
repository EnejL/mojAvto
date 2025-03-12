import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Dimensions,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { TextInput, Text, Surface } from "react-native-paper";

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
  const containerRef = useRef(null);

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

  // Render suggestions directly below the input
  const renderSuggestions = () => {
    if (!showSuggestions || filteredSuggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <ScrollView
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled={true}
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
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]} ref={containerRef}>
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
    zIndex: 1,
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
    zIndex: 1,
  },
  suggestionsContainer: {
    position: "relative",
    maxHeight: 200,
    width: "100%",
    borderRadius: 4,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 4,
    marginTop: 2,
    zIndex: 2,
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
});

export default AutocompleteInput;
