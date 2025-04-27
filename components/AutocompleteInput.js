import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, findNodeHandle, UIManager } from "react-native";
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
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (fetchSuggestions) {
      setLoading(true);
      fetchSuggestions().finally(() => setLoading(false));
    }
  }, [fetchSuggestions]);

  useEffect(() => {
    if (value && suggestions.length > 0) {
      const filtered = suggestions
        .filter((item) => item.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [value, suggestions]);

  const handleFocus = () => {
    if (containerRef.current) {
      const node = findNodeHandle(containerRef.current);
      if (node) {
        UIManager.measure(node, (x, y, width, height, pageX, pageY) => {
          setDropdownPosition({
            top: pageY + height,
            left: pageX,
            width: width
          });
        });
      }
    }
    setIsMenuVisible(true);
  };

  const handleBlur = () => {
    // Delay hiding menu to allow for selection
    setTimeout(() => {
      setIsMenuVisible(false);
    }, 200);
  };

  const handleSuggestionPress = (suggestion) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    } else {
      onChangeText(suggestion);
    }
    setIsMenuVisible(false);
  };

  const renderLabel = () => {
    if (!label) return null;
    return (
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredLabel}>*</Text>}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderLabel()}
      <View 
        ref={containerRef}
        style={styles.inputContainer}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          mode="outlined"
          style={styles.input}
          right={
            loading ? (
              <TextInput.Icon icon="loading" />
            ) : (
              <TextInput.Icon
                icon={isMenuVisible ? "chevron-up" : "chevron-down"}
                onPress={() => setIsMenuVisible(!isMenuVisible)}
              />
            )
          }
        />
        <Portal>
          {isMenuVisible && filteredSuggestions.length > 0 && (
            <Surface 
              style={[
                styles.suggestionsContainer,
                {
                  position: 'absolute',
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                }
              ]}
            >
              <ScrollView 
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="handled"
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
            </Surface>
          )}
        </Portal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  inputContainer: {
    position: "relative",
    zIndex: 1,
  },
  input: {
    backgroundColor: "#fff",
  },
  suggestionsContainer: {
    maxHeight: 200,
    elevation: 4,
    borderRadius: 4,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
  },
});

export default AutocompleteInput;
