import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Button,
  Alert,
  StyleSheet,
} from "react-native";
import { useWindowDimensions } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import HealthChart from "@/components/chart/HealthChart";
import {
  getGardenHealthByGardenId,
  GardenHealthResponse,
} from "@/api/healthCellApi";
import { heal_six } from "@/data/healthData";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { ImageBackground } from "react-native";

// Configure calendar locale
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

// Format date range label
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

// Filter data by range
function useFilteredData(
  data: GardenHealthResponse[],
  range: { from: string; to: string } | null
) {
  return useMemo(() => {
    if (!range) return data;
    const from = new Date(range.from);
    const to = new Date(range.to);
    return data.filter((r) => {
      const d = new Date(r.createdAt);
      return d >= from && d <= to;
    });
  }, [data, range]);
}

const MAX_RANGE_DAYS = 7;
interface GardenStatusProps {
  gardenId: string;
}
const GardenStatus: React.FC<GardenStatusProps> = ({ gardenId }) => {
  const { width: CHART_WIDTH } = useWindowDimensions();

  // Default 30-day range from today
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - MAX_RANGE_DAYS);
  const defaultRange = {
    from: past.toISOString().split("T")[0],
    to: today.toISOString().split("T")[0],
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [range, setRange] = useState<{ from: string; to: string } | null>(
    defaultRange
  );
  const [heathCellData, setHealthCellData] = useState<GardenHealthResponse[]>(
    []
  );
  // Populate initial markedDates for default range
  useEffect(() => {
    const { from, to } = defaultRange;
    const s = new Date(from);
    const e = new Date(to);
    const rangeObj: any = {};
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().split("T")[0];
      rangeObj[ds] = {
        color: "#6BBF59",
        textColor: "#FFFFFF",
        startingDay: ds === from,
        endingDay: ds === to,
      };
    }
    async function load() {
      const resp = await getGardenHealthByGardenId(gardenId);
      setHealthCellData(resp.result);
    }
    load();
    setMarkedDates(rangeObj);
  }, []);

  const healthDataWithDates = useFilteredData(heal_six, range);

  const openRangePicker = () => {
    setModalVisible(true);
  };
  const closeRangePicker = () => setModalVisible(false);

  const onDayPress = (day: any) => {
    const dates = Object.keys(markedDates);
    if (dates.length === 0) {
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          color: "#6BBF59",
          textColor: "#FFFFFF",
        },
      });
      setRange(null);
    } else if (dates.length === 1) {
      const [start] = dates;
      let [s, e] = [new Date(start), new Date(day.dateString)];
      if (s > e) [s, e] = [e, s];
      const diffDays = Math.floor(
        (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > MAX_RANGE_DAYS) {
        Alert.alert(
          "Selection too long",
          `Please select up to ${MAX_RANGE_DAYS} days.`
        );
        return;
      }
      const rangeObj: any = {};
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        const ds = d.toISOString().split("T")[0];
        rangeObj[ds] = {
          color: "#6BBF59",
          textColor: "#FFFFFF",
          startingDay: ds === start,
          endingDay: ds === day.dateString,
        };
      }
      setMarkedDates(rangeObj);
      setRange({
        from: s.toISOString().split("T")[0],
        to: e.toISOString().split("T")[0],
      });
      closeRangePicker();
    } else {
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          color: "#6BBF59",
          textColor: "#FFFFFF",
        },
      });
      setRange(null);
    }
  };

  const rangeLabel = range
    ? `${formatDate(range.from)} – ${formatDate(range.to)}`
    : "Select date range";

  return (
    <ImageBackground
      source={require("../../assets/images/backgournd.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {CHART_WIDTH <= 0 ? (
          <ActivityIndicator size="large" color="#6BBF59" />
        ) : (
          <>
            <TouchableOpacity
              style={styles.rangeButton}
              onPress={openRangePicker}
              activeOpacity={0.7}
            >
              <Text style={styles.rangeText}>{rangeLabel}</Text>
              <View style={styles.iconWrapper}>
                {isModalVisible ? (
                  <ChevronUp size={18} color="#6BBF59" />
                ) : (
                  <ChevronDown size={18} color="#6BBF59" />
                )}
              </View>
            </TouchableOpacity>

            {healthDataWithDates.length === 0 ? (
              <Text style={styles.noDataText}>No data for selected range</Text>
            ) : (
              <HealthChart data={healthDataWithDates} margin={16} />
            )}

            <Modal visible={isModalVisible} transparent animationType="slide">
              <View style={styles.overlay}>
                <View style={styles.calendarBox}>
                  <Text style={styles.calendarTitle}>Select Date Range</Text>
                  <Calendar
                    markingType="period"
                    markedDates={markedDates}
                    onDayPress={onDayPress}
                    theme={{
                      backgroundColor: "transparent",
                      calendarBackground: "#FFFFFFCC",
                      todayTextColor: "#6BBF59",
                      arrowColor: "#6BBF59",
                      monthTextColor: "#333333",
                    }}
                  />
                  <View style={styles.buttonRow}>
                    <Button
                      title="Clear"
                      color="#6BBF59"
                      onPress={() => {
                        setMarkedDates({});
                        setRange(null);
                      }}
                    />
                    <Button
                      title="Close"
                      color="#6BBF59"
                      onPress={closeRangePicker}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>
    </ImageBackground>
  );
};

export default React.memo(GardenStatus);

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, padding: 16, backgroundColor: "transparent" },
  rangeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFFCC",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  rangeText: { color: "#6BBF59", fontWeight: "600", fontSize: 14 },
  iconWrapper: { marginLeft: 6 },
  noDataText: { textAlign: "center", color: "black", marginTop: 16 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  calendarBox: {
    margin: 16,
    backgroundColor: "#FFFFFFEE",
    borderRadius: 12,
    overflow: "hidden",
  },
  calendarTitle: {
    padding: 12,
    fontWeight: "500",
    textAlign: "center",
    fontSize: 16,
    color: "#333333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
});
