// src/components/CareOverview.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Button,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { LineChart, BarChart } from "react-native-chart-kit";
import { GardenLogResponse, fetchGardenLogs } from "@/api/chartApi";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { fakeGardenLogs } from "@/data/log";
const screenWidth = Dimensions.get("window").width;
const DAY_WIDTH = 40;

// Calendar locale config
LocaleConfig.locales.en = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  dayNames: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  today: "Today",
};
LocaleConfig.defaultLocale = "en";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity: number) => `rgba(16,185,129,${opacity})`,
  labelColor: () => "#4B5563",
  propsForDots: { r: "4", stroke: "#10B981", strokeWidth: "2" },
  propsForBackgroundLines: { strokeWidth: 1, stroke: "#E5E7EB" },
};

type Range = { from: string; to: string } | null;

const RangeSelector: React.FC<{
  label: string;
  expanded: boolean;
  onPress: () => void;
}> = ({ label, expanded, onPress }) => (
  <TouchableOpacity style={styles.rangeBtn} onPress={onPress}>
    <Text style={styles.rangeText}>{label}</Text>
    {expanded ? (
      <ChevronUp size={20} color="#10B981" />
    ) : (
      <ChevronDown size={20} color="#10B981" />
    )}
  </TouchableOpacity>
);

const CareOverview: React.FC<{ gardenId: string }> = ({ gardenId }) => {
  const [logs, setLogs] = useState<GardenLogResponse[]>([]);
  const [range, setRange] = useState<Range>(null);
  const [marked, setMarked] = useState<Record<string, any>>({});
  const [showCal, setShowCal] = useState(false);

  // 0. Fetch logs from API
  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetchGardenLogs(gardenId);
        setLogs(response.result);
      } catch (error) {
        console.error("Failed to fetch garden logs:", error);
        // Fallback to fake data for development/testing
        setLogs(fakeGardenLogs);
      }
    }
    if (gardenId) fetchLogs();
  }, [gardenId]);

  // 1. Initialize last 7 days
  useEffect(() => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 6);
    const from = past.toISOString().split("T")[0];
    const to = today.toISOString().split("T")[0];
    markRange(from, to);
    setRange({ from, to });
  }, []);

  // 2. Mark range on calendar
  const markRange = (from: string, to: string) => {
    const start = new Date(from);
    const end = new Date(to);
    const m: Record<string, any> = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      m[key] = {
        startingDay: d.getTime() === start.getTime(),
        endingDay: d.getTime() === end.getTime(),
        color: "#10B981",
      };
    }
    setMarked(m);
  };

  // 3. Handle day press
  const onDayPress = (day: any) => {
    if (!range) {
      markRange(day.dateString, day.dateString);
      setRange({ from: day.dateString, to: day.dateString });
    } else {
      const { from, to } = range;
      const start = new Date(from);
      const end = new Date(to);
      const sel = new Date(day.dateString);
      const newFrom = sel < start ? day.dateString : from;
      const newTo = sel > end ? day.dateString : to;
      markRange(newFrom, newTo);
      setRange({ from: newFrom, to: newTo });
    }
  };

  // 4. Add date field from timestamp
  const withDateField = useMemo(
    () =>
      logs.map((log) => ({
        ...log,
        date: log.timestamp.split("T")[0],
      })),
    [logs]
  );

  // 5. Filter by range
  const filtered = useMemo(() => {
    if (!range) return [];
    return withDateField.filter(
      (log) => log.date >= range.from && log.date <= range.to
    );
  }, [withDateField, range]);

  // 6. Compute daily counts
  const dailyCounts = useMemo(() => {
    const cnt: Record<string, number> = {};
    if (range) {
      const start = new Date(range.from);
      const end = new Date(range.to);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        cnt[d.toISOString().split("T")[0]] = 0;
      }
    }
    filtered.forEach((log) => {
      cnt[log.date] = (cnt[log.date] || 0) + 1;
    });
    return cnt;
  }, [filtered, range]);

  // 7. Prepare labels & data for LineChart
  const labels = useMemo(
    () => Object.keys(dailyCounts).map((d) => formatDate(d)),
    [dailyCounts]
  );
  const data = useMemo(() => Object.values(dailyCounts), [dailyCounts]);

  // 8. Safe max/min
  const { maxVal, minVal } = useMemo(() => {
    if (data.length === 0) return { maxVal: 0, minVal: 0 };
    return { maxVal: Math.max(...data), minVal: Math.min(...data) };
  }, [data]);

  // 9. Stats by actionType for BarChart
  const actionStats = useMemo(() => {
    const cnt: Record<string, number> = {};
    filtered.forEach((log) => {
      cnt[log.actionType] = (cnt[log.actionType] || 0) + 1;
    });
    return { labels: Object.keys(cnt), data: Object.values(cnt) };
  }, [filtered]);

  const rangeLabel = useMemo(() => {
    if (!range) return "Select date range";
    return `${formatDate(range.from)} - ${formatDate(range.to)}`;
  }, [range]);

  // 10. Compute chartWidth
  const minWidth = screenWidth - 64;
  const dynamicWidth = labels.length * DAY_WIDTH;
  const chartWidth = Math.max(dynamicWidth, minWidth);

  // === RENDER ===
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <RangeSelector
          label={rangeLabel}
          expanded={showCal}
          onPress={() => setShowCal(true)}
        />
        <View style={styles.card}>
          <Text style={styles.noVariation}>
            No data available for selected range
          </Text>
        </View>
        <Modal visible={showCal} transparent>
          <View style={styles.overlay}>
            <View style={styles.calendarModal}>
              <Calendar
                markingType="period"
                markedDates={marked}
                onDayPress={onDayPress}
              />
              <View style={styles.modalActions}>
                <Button
                  title="Clear"
                  onPress={() => {
                    setMarked({});
                    setRange(null);
                  }}
                />
                <Button title="Close" onPress={() => setShowCal(false)} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/backgournd.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View style={styles.container}>
        <RangeSelector
          label={rangeLabel}
          expanded={showCal}
          onPress={() => setShowCal(true)}
        />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Activity Breakdown</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={{
                labels: actionStats.labels,
                datasets: [{ data: actionStats.data }],
              }}
              width={screenWidth - 64}
              height={160}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={styles.chartStyle}
            />
          </ScrollView>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {data.length < 2 || maxVal === minVal ? (
            <Text style={styles.noVariation}>No variation to display</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{ labels, datasets: [{ data }] }}
                width={chartWidth}
                height={200}
                fromZero
                withInnerLines={false}
                withShadow={false}
                chartConfig={chartConfig}
                style={styles.chartStyle}
              />
            </ScrollView>
          )}
        </View>

        <Modal visible={showCal} transparent>
          <View style={styles.overlay}>
            <View style={styles.calendarModal}>
              <Calendar
                markingType="period"
                markedDates={marked}
                onDayPress={onDayPress}
              />
              <View style={styles.modalActions}>
                <Button
                  title="Clear"
                  onPress={() => {
                    setMarked({});
                    setRange(null);
                  }}
                />
                <Button title="Close" onPress={() => setShowCal(false)} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

export default React.memo(CareOverview);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  rangeBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  rangeText: { flex: 1, color: "#10B981", fontSize: 16, fontWeight: "500" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  chartStyle: { borderRadius: 12, backgroundColor: "#FFFFFF" },
  noVariation: {
    textAlign: "center",
    color: "#6B7280",
    paddingVertical: 20,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
  },
  calendarModal: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#F9FAFB",
  },
});
