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
  Platform,
} from "react-native";
import { TextInput, Text } from "react-native-paper";

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
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value && suggestions.length > 0) {
      const filtered = suggestions
        .filter((item) => item.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5); // Limit to 5 suggestions
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
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
    
    // Measure the position of the input for the modal placement
    if (inputRef.current && containerRef.current) {
      containerRef.current.measureInWindow((x, y, width, height) => {
        setInputPosition({ x, y, width, height });
      });
    }
  };

  const handleBlur = () => {
    // We'll handle closing via the modal instead
  };

  const handleSuggestionPress = (suggestion) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    } else {
      onChangeText(suggestion);
    }
    setShowSuggestions(false);
    // Keep keyboard open
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (text) => {
    onChangeText(text);
    // Keep suggestions visible while typing
    if (text && suggestions.length > 0) {
      const filtered = suggestions
        .filter((item) => item.toLowerCase().includes(text.toLowerCase()))
        .slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Calculate modal position based on input position
  const modalPosition = {
    top: inputPosition.y + inputPosition.height + 2,
    left: inputPosition.x,
    width: inputPosition.width,
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
        onChangeText={handleInputChange}
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

      <Modal
        visible={showSuggestions && filteredSuggestions.length > 0}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSuggestions(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.suggestionsContainer, { 
              position: 'absolute',
              top: modalPosition.top, 
              left: modalPosition.left,
              width: modalPosition.width
            }]}>
              <ScrollView
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled={true}
              >
                {filteredSuggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
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
    elevation: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "blue", // Orange background
  },
  suggestionText: {
    color: "#fff", // White text for better contrast
    fontSize: 16,
  },
  loadingText: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
});

export default AutocompleteInput;