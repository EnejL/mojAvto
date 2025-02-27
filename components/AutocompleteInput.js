import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Keyboard } from "react-native";
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

  const handleChangeText = async (text) => {
    onChangeText(text);

    if (text.length > 1) {
      setShowSuggestions(true);

      // If we have a custom fetch function, use it
      if (fetchSuggestions) {
        setLoading(true);
        try {
          const customSuggestions = await fetchSuggestions(text);
          setFilteredSuggestions(customSuggestions.slice(0, 5));
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setLoading(false);
        }
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onChangeText(suggestion);
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  // Render suggestions as individual items
  const renderSuggestions = () => {
    if (!showSuggestions || filteredSuggestions.length === 0) return null;

    return (
      <Surface style={styles.suggestionsContainer}>
        {filteredSuggestions.map((item, index) => (
          <TouchableOpacity
            key={`suggestion-${index}`}
            style={styles.suggestionItem}
            onPress={() => handleSelectSuggestion(item)}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </Surface>
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
        onChangeText={handleChangeText}
        style={styles.input}
        mode="outlined"
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => {
          if (value.length > 1 && suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => setShowSuggestions(false), 300);
        }}
      />

      {renderSuggestions()}

      {loading && (
        <Text style={styles.loadingText}>Loading suggestions...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 100,
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
  suggestionsContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    maxHeight: 200,
    zIndex: 9999,
    elevation: 5,
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
});

export default AutocompleteInput;
