import { StyleSheet, View, Text, useWindowDimensions } from "react-native";
import React, { useMemo, useState, useEffect } from "react";
import { Canvas, Path, Circle, Rect, Skia } from "@shopify/react-native-skia";
import { scaleLinear, scaleTime } from "d3-scale";
import { line, curveBasis } from "d3-shape";
import Slider from "@react-native-community/slider";

import { GardenHealthResponse } from "@/api/healthCellApi";

// Palette mới
const COLORS = {
  background: "#FAFAFA",
  stroke: "#009688", // Teal
  gridLine: "gray",
  axisLabel: "#616161",
  dot: "#FF5722", // Deep orange
  sliderTrack: "#009688",
  sliderRail: "#E0E0E0",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "#E0E0E0",
  tooltipTitle: "#212121",
  tooltipText: "#424242",
};

type HealthChartProps = {
  data: GardenHealthResponse[];
  margin: number;
};

export default function HealthChart({ data, margin }: HealthChartProps) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const chartWidth = screenW * 0.93;
  const chartHeight = screenH * 0.6;

  // 1. Parse & compute ratio
  const parsed = useMemo(() => {
    return data
      .map((d) => {
        const total = d.normalCell + d.diseaseCell + d.deadCell;
        return {
          date: new Date(d.createdAt),
          ratio: total > 0 ? d.normalCell / total : 0,
          raw: d,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data]);

  // 2. daysInMonth & initialDay (fallback safe values)
  const { daysInMonth, initialDay } = useMemo(() => {
    if (!parsed.length) return { daysInMonth: 31, initialDay: 1 };
    const first = parsed[0].date.getDate();
    const dim = parsed[parsed.length - 1].date.getDate();
    return { daysInMonth: dim, initialDay: first };
  }, [parsed]);

  // 3. State
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [selected, setSelected] = useState<{
    x: number;
    y: number;
    date: Date;
    raw: GardenHealthResponse;
    ratio: number;
  } | null>(null);

  // Sync selectedDay when parsed / initialDay / daysInMonth change
  useEffect(() => {
    setSelectedDay((prev) => {
      const min = Math.round(initialDay);
      const max = Math.round(Math.max(initialDay, daysInMonth));
      // if previous is undefined or out of range, default to min
      if (prev == null) return min;
      if (prev < min) return min;
      if (prev > max) return max;
      return prev;
    });
  }, [initialDay, daysInMonth]);

  // 4. Scales
  const xScale = useMemo(() => {
    if (!parsed.length) {
      // avoid domain issues
      return scaleTime()
        .domain([0, 1])
        .range([margin, chartWidth - margin]);
    }
    const times = parsed.map((d) => d.date.getTime());
    const minT = Math.min(...times);
    const maxT = Math.max(...times);
    return scaleTime()
      .domain([minT, maxT])
      .range([margin, chartWidth - margin]);
  }, [parsed, chartWidth, margin]);

  const yScale = useMemo(() => {
    return scaleLinear()
      .domain([0, 1])
      .range([chartHeight - margin, margin]);
  }, [chartHeight, margin]);

  // 5. Build paths
  const svgLine = useMemo(() => {
    if (parsed.length < 2) return null;
    return line<{ date: Date; ratio: number }>()
      .x((d) => xScale(d.date.getTime()))
      .y((d) => yScale(d.ratio))
      .curve(curveBasis)(parsed as any);
  }, [parsed, xScale, yScale]);

  const linePath = svgLine ? Skia.Path.MakeFromSVGString(svgLine) : null;

  // 6. Update selected based on selectedDay
  useEffect(() => {
    const hit = parsed.find((pt) => pt.date.getDate() === selectedDay) || null;
    if (hit) {
      setSelected({
        x: xScale(hit.date.getTime()),
        y: yScale(hit.ratio),
        date: hit.date,
        raw: hit.raw,
        ratio: hit.ratio,
      });
    } else {
      setSelected(null);
    }
  }, [selectedDay, parsed, xScale, yScale]);

  // Helper clamp for slider bounds
  const sliderMin = Math.round(initialDay);
  const sliderMax = Math.round(Math.max(initialDay, daysInMonth));

  return (
    <View style={styles.container}>
      {/* Wrap Canvas inside a View that doesn't receive pointer events so it won't block the Slider below.
          If you need interactions on Canvas later, change strategy (e.g. move slider above or implement touch-forwarding). */}
      <View pointerEvents="none">
        <Canvas
          style={{
            width: chartWidth,
            height: chartHeight,
            backgroundColor: COLORS.background,
          }}
        >
          {/* 0. Light-blue background under plot */}
          <Rect
            x={margin}
            y={margin}
            width={chartWidth - 2 * margin}
            height={chartHeight - 2 * margin}
            color="#E0F7FA"
          />
          {/* 1. Grid horizontal at 0%,50%,100% */}
          {[0, 0.5, 1].map((t) => {
            const y = yScale(t);
            const p = Skia.Path.Make();
            p.moveTo(margin, y);
            p.lineTo(chartWidth - margin, y);
            return (
              <Path
                key={"h" + t}
                path={p}
                style="stroke"
                strokeWidth={1}
                color={COLORS.gridLine}
              />
            );
          })}
          {/* 2. Grid vertical at start, mid, end */}
          {(() => {
            if (parsed.length < 2) return null;
            const times = parsed.map((d) => d.date.getTime());
            const minT = Math.min(...times);
            const maxT = Math.max(...times);
            const mids = [minT, (minT + maxT) / 2, maxT];
            return mids.map((t) => {
              const x = xScale(t);
              const p = Skia.Path.Make();
              p.moveTo(x, margin);
              p.lineTo(x, chartHeight - margin);
              return (
                <Path
                  key={"v" + t}
                  path={p}
                  style="stroke"
                  strokeWidth={1}
                  color={COLORS.gridLine}
                />
              );
            });
          })()}
          {/* Curve (single) */}
          {linePath && (
            <Path
              path={linePath}
              style="stroke"
              strokeWidth={3}
              strokeCap="round"
              color={COLORS.stroke}
            />
          )}
          {/* Selected dot */}
          {selected && (
            <Circle cx={selected.x} cy={selected.y} r={6} color={COLORS.dot} />
          )}
        </Canvas>
      </View>

      {/* X-axis labels */}
      <View style={[styles.axisX, { width: chartWidth }]}>
        {parsed.length > 0 && (
          <>
            <Text style={styles.axisLabel}>
              {parsed[0].date.getDate()}/{parsed[0].date.getMonth() + 1}
            </Text>
            <Text style={styles.axisLabel}>
              {parsed[parsed.length - 1].date.getDate()}/
              {parsed[parsed.length - 1].date.getMonth() + 1}
            </Text>
          </>
        )}
      </View>

      {/* Slider */}
      <View style={[styles.sliderContainer, { width: chartWidth }]}>
        <Text style={styles.dayText}>Day: {selectedDay}</Text>
        <Slider
          style={{ width: chartWidth - 40, height: 40 }}
          minimumValue={sliderMin}
          maximumValue={sliderMax}
          step={1}
          value={selectedDay}
          onValueChange={(v) => {
            // debug: kiểm tra xem slider có nhận touch không
            // console.log("slider onValueChange", v);
            setSelectedDay(Math.round(v));
          }}
          onSlidingComplete={(v) => {
            setSelectedDay(Math.round(v));
          }}
          minimumTrackTintColor={COLORS.sliderTrack}
          maximumTrackTintColor={COLORS.sliderRail}
          thumbTintColor={COLORS.dot}
        />
      </View>

      {/* Tooltip */}
      {selected && (
        <View
          style={[
            styles.tooltip,
            {
              top: selected.y + 25,
              left:
                selected.x > chartWidth / 2
                  ? selected.x - 140
                  : selected.x + 10,
            },
          ]}
        >
          <Text style={styles.tooltipTitle}>
            {selected.date.toLocaleDateString()}
          </Text>
          <Text style={styles.tooltipText}>
            Healthy Ratio: {(selected.ratio * 100).toFixed(1)}%
          </Text>
          <Text style={styles.tooltipText}>
            Normal: {selected.raw.normalCell}
          </Text>
          <Text style={styles.tooltipText}>
            Diseased: {selected.raw.diseaseCell}
          </Text>
          {selected.raw.diseaseCell > 0 && (
            <Text style={styles.tooltipText}>
              Disease: {selected.raw.diseaseName || "Unknown"}
            </Text>
          )}
          <Text style={styles.tooltipText}>Dead: {selected.raw.deadCell}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
  },
  axisX: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 8,
  },
  axisLabel: {
    fontSize: 12,
    color: COLORS.axisLabel,
  },
  sliderContainer: {
    alignItems: "center",
    paddingVertical: 8,
    zIndex: 10,
    elevation: 10,
  },
  dayText: {
    fontSize: 14,
    marginBottom: 6,
    color: COLORS.axisLabel,
  },
  tooltip: {
    position: "absolute",
    width: 130,
    backgroundColor: COLORS.tooltipBg,
    borderColor: COLORS.tooltipBorder,
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
  tooltipTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.tooltipTitle,
    marginBottom: 6,
  },
  tooltipText: {
    fontSize: 12,
    color: COLORS.tooltipText,
  },
});
