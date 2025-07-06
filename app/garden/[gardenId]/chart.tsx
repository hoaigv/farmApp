import React, { useState, useMemo, useCallback } from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BarChart, PieChart, LineChart } from "react-native-chart-kit";
import { TabBar, TabView } from "react-native-tab-view";
import Header from "../../../components/Header";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { fetchGardenLogs, GardenLogResponse } from "@/api/chartApi";
// Đúng đường dẫn đến mock data
import { healthData } from "@/mork/healthData";

const screenWidth = Dimensions.get("window").width;

// Mapping UUID từ backend về gardenId code trong mock
const uuidToCode: Record<string, string> = {
  "976404e9-2d80-46b6-9fa7-f733f7a2dcc8": "gdn-001",
  // Thêm mapping tương ứng nếu có các UUID khác
};

// Utility to group logs
function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, number> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// CARE ACTIVE: Pie + Bar charts
const CareOverview: React.FC<{ logs: GardenLogResponse[] }> = ({ logs }) => {
  const { wateringCount, fertilizingCount, skippedCount } = useMemo(
    () =>
      logs.reduce(
        (acc, { actionType }) => {
          if (actionType === "WATERING") acc.wateringCount++;
          if (actionType === "FERTILIZING") acc.fertilizingCount++;
          if (actionType === "SKIP") acc.skippedCount++;
          return acc;
        },
        { wateringCount: 0, fertilizingCount: 0, skippedCount: 0 }
      ),
    [logs]
  );

  const pieData = [
    {
      name: "Watering",
      population: wateringCount,
      color: "#4ade80",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Fertilizing",
      population: fertilizingCount,
      color: "#facc15",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Missed",
      population: skippedCount,
      color: "#f87171",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ];

  const barData = useMemo(() => {
    const counts = groupBy(
      logs,
      (log) =>
        ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
          new Date(log.timestamp).getUTCDay()
        ]
    );
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return { labels, datasets: [{ data: labels.map((l) => counts[l] || 0) }] };
  }, [logs]);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(34,197,94,${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    fillShadowGradient: "#4ade80",
    fillShadowGradientOpacity: 1,
  };

  return (
    <View style={styles.chartSection}>
      <Text style={styles.sectionTitle}>Plant Care Overview</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 32}
        height={180}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <Text style={styles.sectionTitle}>Weekly Care Frequency</Text>
      <BarChart
        data={barData}
        width={screenWidth - 32}
        height={200}
        fromZero
        yAxisLabel=""
        yAxisSuffix=""
        showValuesOnTopOfBars
        chartConfig={chartConfig}
        style={styles.chartStyle}
      />
    </View>
  );
};

// GARDEN STATUS: Line chart of healthData
const HealthGardenChart: React.FC<{ gardenId: string }> = ({ gardenId }) => {
  // Map UUID -> code
  const code = uuidToCode[gardenId] || gardenId;

  const records = useMemo(
    () =>
      healthData
        .filter((r) => r.gardenId === code)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    [code]
  );

  if (!records.length) {
    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Garden Status Over Time</Text>
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>No health data available.</Text>
        </View>
      </View>
    );
  }

  // Chỉ lấy ngày (1-10) để nhãn bớt dày và dễ đọc
  const labels = records.map((r) => `${new Date(r.createdAt).getDate()}`);
  const normal = records.map((r) => r.normalCell);
  const dead = records.map((r) => r.deadCell);
  const disease = records.map((r) => r.diseaseCell);

  const data = {
    labels,
    datasets: [
      { data: normal, color: () => "#4ade80", strokeWidth: 2 },
      { data: dead, color: () => "#f87171", strokeWidth: 2 },
      { data: disease, color: () => "#facc15", strokeWidth: 2 },
    ],
    legend: ["Normal", "Dead", "Diseased"],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34,197,94,${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    propsForDots: { r: "3" },
  };

  return (
    <View style={styles.chartSection}>
      <Text style={styles.sectionTitle}>Garden Status Over Time</Text>
      <LineChart
        data={data}
        width={screenWidth - 32}
        height={240}
        chartConfig={chartConfig}
        bezier
        style={{ marginVertical: 8, borderRadius: 8 }}
      />
    </View>
  );
};

// Main ChartScreen
const ChartScreen: React.FC = () => {
  const params = useLocalSearchParams<{ gardenId?: string }>();
  const gardenId = params.gardenId?.trim() || "";

  const [logs, setLogs] = useState<GardenLogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGardenLogs(gardenId);
      setLogs(res.result);
    } catch (err) {
      console.error(err);
      setError("Unable to load logs.");
    } finally {
      setLoading(false);
    }
  }, [gardenId]);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  const [index, setIndex] = useState(0);
  const routes = [
    { key: "overview", title: "CARE ACTIVE" },
    { key: "status", title: "GARDEN STATUS" },
  ];

  const renderScene = ({ route }: { route: any }) =>
    route.key === "overview" ? (
      <CareOverview logs={logs} />
    ) : (
      <HealthGardenChart gardenId={gardenId} />
    );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Chart Overview" showBack />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }
  if (error) Alert.alert("Error", error);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Chart Overview" showBack />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: "#4ade80" }}
            style={{ backgroundColor: "#fff" }}
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
  safeArea: { flex: 1, backgroundColor: "#fff" },
  chartSection: { alignItems: "center", padding: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 8 },
  chartStyle: { borderRadius: 8, marginVertical: 4 },
  placeholderBox: {
    width: screenWidth - 32,
    height: 150,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  placeholderText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "gray",
    textAlign: "center",
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
