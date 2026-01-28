import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface CardSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
  showFilterButton?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function CardSearchBar({
  value,
  onChangeText,
  onClear,
  onFilterPress,
  placeholder = "이름, 회사, 직함으로 검색...",
  showFilterButton = true,
  style,
}: CardSearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputWrapper}>
        <Text style={styles.searchIcon}>{"\uD83D\uDD0D"}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 ? (
          <TouchableOpacity
            onPress={() => {
              onChangeText("");
              onClear?.();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearButton}>{"\u2715"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {showFilterButton ? (
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <Text style={styles.filterIcon}>{"\u2630"}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: "#9CA3AF",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
  },
  clearButton: {
    fontSize: 14,
    color: "#9CA3AF",
    padding: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    fontSize: 18,
    color: "#6B7280",
  },
});
