// src/screens/ChartScreen.tsx
import React, { useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet } from "react-native";
import Header from "@/components/Header";
import { useLocalSearchParams } from "expo-router";
import CareOverview from "@/components/chart/CareOverview";
import GardenStatus from "@/components/chart/GardenStatus";
import { TabView, TabBar } from "react-native-tab-view";

const screenWidth = Dimensions.get("window").width;

const ChartScreen: React.FC = () => {
  const params = useLocalSearchParams<{ gardenId?: string }>();
  const gardenId = params.gardenId?.trim() || "";

  const [index, setIndex] = useState(0);
  const routes = [
    { key: "overview", title: "CARE ACTIVITY" },
    { key: "status", title: "GARDEN STATUS" },
  ];

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "overview":
        return <CareOverview gardenId={gardenId} />;
      case "status":
        return <GardenStatus gardenId={gardenId} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Garden Charts" showBack />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
            activeColor="#000"
            inactiveColor="gray"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default ChartScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabBar: {
    backgroundColor: "#fff",
  },
  tabIndicator: {
    backgroundColor: "#4ade80",
  },
});
