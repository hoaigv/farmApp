import React, { useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import Header from "../../../../components/Header";
const screenWidth = Dimensions.get("window").width;
const CarePieChart = () => {
  const data = [
    {
      name: "Watering",
      population: 10,
      color: "#4ade80", // green
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Fertilizing",
      population: 4,
      color: "#facc15", // yellow
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Missed",
      population: 2,
      color: "#f87171", // red
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ];
  const databar = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [3, 2, 4, 1, 3, 5, 0], // Number of care activities each day
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    fillShadowGradient: "#4ade80",
    fillShadowGradientOpacity: 1,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    barPercentage: 0.6,
  };

  return (
    <View className="items-center p-2">
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        Plant Care Proportion
      </Text>
      <PieChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={{
          color: () => "#000",
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Daily Care Frequency
        </Text>
        <BarChart
          data={databar}
          width={screenWidth - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          showValuesOnTopOfBars={true}
          fromZero={true}
          style={{ borderRadius: 8 }}
        />
      </View>
    </View>
  );
};

const WeatherAreaChart = () => {
  const data = {
    labels: ["May 20", "May 21", "May 22", "May 23", "May 24"],
    datasets: [
      {
        data: [32, 34, 35, 36, 33], // Temperature
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // red
        strokeWidth: 2,
      },
      {
        data: [1, 2, 0, 3, 1], // Watering count
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // green
        strokeWidth: 2,
      },
    ],
    legend: ["Temperature (°C)", "Watering (times)"],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#888",
    },
  };

  return (
    <View className="p-2 items-center">
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        Weather Impact & Watering
      </Text>
      <LineChart
        data={data}
        width={screenWidth - 32}
        height={260}
        chartConfig={chartConfig}
        bezier
        fromZero
        yAxisSuffix=""
        style={{ borderRadius: 8 }}
      />
    </View>
  );
};

const HealthLineChart = () => {
  const data = {
    labels: ["May 20", "May 21", "May 22", "May 23", "May 24"],
    datasets: [
      {
        data: [95, 93, 85, 88, 91],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#4ade80",
    },
  };

  return (
    <View className="items-center p-2">
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        Plant Health Chart
      </Text>
      <LineChart
        data={data}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{ borderRadius: 8 }}
        fromZero
        yAxisSuffix=" pts"
      />
    </View>
  );
};

const renderScene = SceneMap({
  care: CarePieChart,
  health: HealthLineChart,
  weather: WeatherAreaChart,
});

const ChartScreen = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "care", title: "CARE" },
    { key: "health", title: "HEALTH" },
    { key: "weather", title: "WEATHER" },
  ]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Header title="Chart" showBack={true} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: "#4ade80" }}
            style={{ backgroundColor: "white" }}
            activeColor="black"
            inactiveColor="gray"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default ChartScreen;
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backArrow: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tabContainer: {
    padding: 16,
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    marginVertical: 12,
    fontWeight: "600",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
});
