import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useInterstitial } from '../lib/InterstitialContext';
import { COLORS, FONTS } from '../constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function InterstitialSheet() {
  const {
    shouldShowInterstitial,
    currentQuestion,
    submitAnswer,
    dismissInterstitial,
  } = useInterstitial();

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [numericValue, setNumericValue] = useState('');

  // Reset local state when currentQuestion changes
  useEffect(() => {
    setSelectedValue(null);
    setSelectedValues([]);
    setNumericValue('');
  }, [currentQuestion?.index]);

  // Animate in/out
  useEffect(() => {
    if (shouldShowInterstitial) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [shouldShowInterstitial, translateY]);

  if (!shouldShowInterstitial || !currentQuestion) return null;

  const isFullScreen = currentQuestion.type === 'full-screen';

  const getSubmitValue = (): any => {
    switch (currentQuestion.inputType) {
      case 'dropdown':
      case 'single-select':
        return selectedValue;
      case 'multi-select':
        return selectedValues;
      case 'numeric-input':
        return numericValue;
      default:
        return null;
    }
  };

  const isDisabled = (): boolean => {
    switch (currentQuestion.inputType) {
      case 'dropdown':
      case 'single-select':
        return !selectedValue;
      case 'multi-select':
        return selectedValues.length === 0;
      case 'numeric-input':
        return numericValue.trim().length === 0;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    const value = getSubmitValue();
    if (value !== null && value !== undefined) {
      submitAnswer(value);
    }
  };

  const handleMultiToggle = (option: string) => {
    setSelectedValues((prev) => {
      if (prev.includes(option)) {
        return prev.filter((v) => v !== option);
      }
      return [...prev, option];
    });
  };

  // Full-screen mode (interstitial index 7)
  if (isFullScreen) {
    return (
      <Animated.View
        style={[
          styles.fullScreenOverlay,
          { transform: [{ translateY }] },
        ]}
      >
        <View style={styles.fullScreenContent}>
          <Text style={styles.fullScreenTitle}>{currentQuestion.title}</Text>
          <Text style={styles.fullScreenSubtext}>{currentQuestion.subtext}</Text>

          {/* Blurred carrier logo placeholders - 4x2 grid */}
          <View style={styles.logoGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} style={styles.logoPlaceholder} />
            ))}
          </View>

          <TouchableOpacity
            style={styles.fullScreenCta}
            onPress={() => submitAnswer('complete')}
            activeOpacity={0.8}
          >
            <Text style={styles.fullScreenCtaText}>See Your Matches</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // Bottom sheet mode
  return (
    <Animated.View
      style={[
        styles.overlay,
        { transform: [{ translateY }] },
      ]}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={dismissInterstitial}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{currentQuestion.title}</Text>

        {/* Subtext */}
        <Text style={styles.subtext}>{currentQuestion.subtext}</Text>

        {/* Input area */}
        <View style={styles.inputArea}>
          {currentQuestion.inputType === 'dropdown' && currentQuestion.options && (
            <ScrollView
              style={styles.dropdownScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.dropdownGrid}>
                {currentQuestion.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setSelectedValue(option)}
                    style={[
                      styles.dropdownPill,
                      selectedValue === option
                        ? styles.dropdownPillSelected
                        : styles.dropdownPillUnselected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownPillText,
                        selectedValue === option
                          ? styles.dropdownPillTextSelected
                          : styles.dropdownPillTextUnselected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {currentQuestion.inputType === 'single-select' && currentQuestion.options && (
            <View style={styles.singleSelectContainer}>
              {currentQuestion.options.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedValue(option)}
                  style={[
                    styles.singleSelectOption,
                    selectedValue === option
                      ? styles.singleSelectOptionSelected
                      : styles.singleSelectOptionUnselected,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.singleSelectText,
                      selectedValue === option
                        ? styles.singleSelectTextSelected
                        : styles.singleSelectTextUnselected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentQuestion.inputType === 'multi-select' && currentQuestion.options && (
            <View style={styles.multiSelectContainer}>
              {currentQuestion.options.map((option) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleMultiToggle(option)}
                    style={[
                      styles.multiSelectPill,
                      isSelected
                        ? styles.multiSelectPillSelected
                        : styles.multiSelectPillUnselected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.multiSelectText,
                        isSelected
                          ? styles.multiSelectTextSelected
                          : styles.multiSelectTextUnselected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {currentQuestion.inputType === 'numeric-input' && (
            <TextInput
              style={styles.numericInput}
              value={numericValue}
              onChangeText={setNumericValue}
              keyboardType="numeric"
              placeholder="Enter value"
              placeholderTextColor={COLORS.navyMid}
              maxLength={10}
            />
          )}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isDisabled() && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isDisabled()}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: COLORS.navy,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: SCREEN_HEIGHT * 0.6,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.navyMid,
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontFamily: FONTS.semibold,
  },
  subtext: {
    color: COLORS.slate,
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginTop: 8,
  },
  inputArea: {
    marginTop: 24,
    flex: 1,
  },

  // Dropdown (state selector)
  dropdownScroll: {
    maxHeight: SCREEN_HEIGHT * 0.3,
  },
  dropdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dropdownPill: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownPillSelected: {
    backgroundColor: COLORS.amber,
  },
  dropdownPillUnselected: {
    backgroundColor: COLORS.navyLight,
  },
  dropdownPillText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  dropdownPillTextSelected: {
    color: COLORS.navy,
  },
  dropdownPillTextUnselected: {
    color: COLORS.slate,
  },

  // Single select
  singleSelectContainer: {
    gap: 10,
  },
  singleSelectOption: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
  },
  singleSelectOptionSelected: {
    borderColor: COLORS.amber,
  },
  singleSelectOptionUnselected: {
    borderColor: COLORS.navyMid,
  },
  singleSelectText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  singleSelectTextSelected: {
    color: COLORS.white,
  },
  singleSelectTextUnselected: {
    color: COLORS.slate,
  },

  // Multi select
  multiSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  multiSelectPill: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  multiSelectPillSelected: {
    backgroundColor: COLORS.amber,
  },
  multiSelectPillUnselected: {
    backgroundColor: COLORS.navyLight,
  },
  multiSelectText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  multiSelectTextSelected: {
    color: COLORS.navy,
  },
  multiSelectTextUnselected: {
    color: COLORS.slate,
  },

  // Numeric input
  numericInput: {
    backgroundColor: COLORS.navyLight,
    borderWidth: 1,
    borderColor: COLORS.navyMid,
    borderRadius: 12,
    padding: 14,
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.regular,
  },

  // Submit button
  submitButton: {
    backgroundColor: COLORS.amber,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: COLORS.navy,
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },

  // Full-screen mode
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fullScreenContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  fullScreenTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontFamily: FONTS.semibold,
    textAlign: 'center',
    marginBottom: 12,
  },
  fullScreenSubtext: {
    color: COLORS.slate,
    fontSize: 15,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  logoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.navyLight,
    opacity: 0.5,
  },
  fullScreenCta: {
    backgroundColor: COLORS.amber,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  fullScreenCtaText: {
    color: COLORS.navy,
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
});
