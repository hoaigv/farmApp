import React from "react";
import { View, StyleSheet, Text, ScrollView, Image } from "react-native";
import { Portal, Modal, Button } from "react-native-paper";
import { GardenCell } from "@/api/gardenCellApi";

interface DisplayGardenCellModalProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  data?: GardenCell;
}

const DisplayGardenCellModal: React.FC<DisplayGardenCellModalProps> = ({
  visible,
  onDismiss,
  title = "Cell Details",
  data,
}) => {
  // Compute time since creation
  const computeAge = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const diffMs = now - created;
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;

    if (diffMs >= day) {
      const days = Math.floor(diffMs / day);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (diffMs >= hour) {
      const hours = Math.floor(diffMs / hour);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffMs >= minute) {
      const minutes = Math.floor(diffMs / minute);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>{title}</Text>

        <ScrollView style={styles.scroll}>
          {data ? (
            <>
              <View style={styles.row}>
                <Text style={styles.key}>Variety Name :</Text>
                <Text style={styles.value}>{data.plantVariety.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.key}>Stage Grow :</Text>
                <Text style={styles.value}>{data.stageGrow}</Text>
              </View>

              {data.stageLink && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: data.imgCellCurrent }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              )}

              {data.healthStatus && (
                <View style={styles.row}>
                  <Text style={styles.key}>Health Status:</Text>
                  <Text style={styles.value}>{data.healthStatus}</Text>
                </View>
              )}

              {data.diseaseName && (
                <View style={styles.row}>
                  <Text style={styles.key}>Disease Name:</Text>
                  <Text style={styles.value}>{data.diseaseName}</Text>
                </View>
              )}

              {data.createdAt && (
                <View style={styles.row}>
                  <Text style={styles.key}>Created:</Text>
                  <Text style={styles.value}>{computeAge(data.createdAt)}</Text>
                </View>
              )}
            </>
          ) : (
            <Text>No data available</Text>
          )}
        </ScrollView>

        <Button mode="outlined" onPress={onDismiss} style={styles.closeBtn}>
          Close
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    margin: 20,
    padding: 24,
    borderRadius: 12,
    maxHeight: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  scroll: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  key: {
    fontWeight: "600",
    width: 120,
  },
  value: {
    flex: 1,
    flexWrap: "wrap",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  closeBtn: {
    alignSelf: "flex-end",
  },
});

export default DisplayGardenCellModal;
