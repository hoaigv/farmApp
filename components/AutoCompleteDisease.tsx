// AutoCompleteDisease.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import {
  Portal,
  Modal,
  TextInput,
  List,
  Button,
  HelperText,
} from "react-native-paper";

type Props = {
  visible: boolean;
  initialValue?: string;
  onCancel: () => void;
  onOk: (diseaseName: string) => void;
};

const rawDiseaseList = [
  "Apple_scab",
  "Apple_black_rot",
  "Apple_cedar_apple_rust",
  "Cherry_powdery_mildew",
  "Corn_gray_leaf_spot",
  "Corn_common_rust",
  "Corn_northern_leaf_blight",
  "Grape_black_rot",
  "Grape_black_measles",
  "Grape_leaf_blight",
  "Orange_haunglongbing",
  "Peach_bacterial_spot",
  "Pepper_bacterial_spot",
  "Potato_early_blight",
  "Potato_late_blight",
  "Squash_powdery_mildew",
  "Strawberry_leaf_scorch",
  "Tomato_bacterial_spot",
  "Tomato_early_blight",
  "Tomato_late_blight",
  "Tomato_leaf_mold",
  "Tomato_septoria_leaf_spot",
  "Tomato_spider_mites_two-spotted_spider_mite",
  "Tomato_target_spot",
  "Tomato_yellow_leaf_curl_virus",
  "Tomato_mosaic_virus",
];

const AutoCompleteDisease: React.FC<Props> = ({
  visible,
  initialValue = "",
  onCancel,
  onOk,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuery(initialValue);
    setError("");
    setSuggestions([]);
  }, [visible, initialValue]);

  const handleChange = (text: string) => {
    setQuery(text);
    setError("");
    const q = text.toLowerCase();
    if (q.length === 0) {
      setSuggestions([]);
    } else {
      const filtered = rawDiseaseList.filter((d) =>
        d.toLowerCase().includes(q)
      );
      setSuggestions(filtered);
    }
  };

  const handleOk = () => {
    if (!query.trim()) {
      setError("Please enter or select a disease name");
      return;
    }
    onOk(query.trim());
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onCancel}
        contentContainerStyle={styles.container}
      >
        <TextInput
          label="Disease name"
          value={query}
          onChangeText={handleChange}
          style={styles.input}
          mode="outlined"
          autoCapitalize="none"
        />
        {error ? <HelperText type="error">{error}</HelperText> : null}
        {suggestions.length > 0 && (
          <FlatList
            style={styles.list}
            data={suggestions}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setQuery(item)}>
                <List.Item title={item} />
              </TouchableOpacity>
            )}
          />
        )}
        <View style={styles.actions}>
          <Button onPress={onCancel}>Cancel</Button>
          <Button mode="contained" onPress={handleOk}>
            OK
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  list: {
    borderWidth: 1,
    borderColor: "#ddd",
    maxHeight: 200,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
});

export default AutoCompleteDisease;
