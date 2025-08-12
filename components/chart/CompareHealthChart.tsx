// src/components/chart/CompareHealthChart.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import {
  Canvas,
  Path,
  Group,
  Rect,
  Skia,
  Circle,
} from "@shopify/react-native-skia";
import { HealthRecord } from "@/data/healthData";
import { scaleLinear, scaleTime } from "d3-scale";
import { line, curveBasis } from "d3-shape";

export type CompareHealthChartProps = {
  firstData: HealthRecord[];
  secondData: HealthRecord[];
  margin?: number;
  height?: number;
  dateLocale?: string;
};

const COLORS = {
  first: "rgba(0, 128, 0, 1)",
  second: "rgba(255, 0, 0, 1)",
  grid: "#CCCCCC",
  background: "#E0F7FA",
  shade: "rgba(0, 128, 0, 0.2)",
  threshold: "rgba(255, 0, 0, 0.5)",
};

const CompareHealthChart: React.FC<CompareHealthChartProps> = ({
  firstData,
  secondData,
  margin = 16,
  height,
  dateLocale = "en-US",
}) => {
  const [showFirst, setShowFirst] = useState(true);
  const [showSecond, setShowSecond] = useState(true);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  const { width: screenW, height: screenH } = useWindowDimensions();
  const chartWidth = screenW - margin * 2;
  const chartHeight = (height ?? screenH * 0.5) - margin * 2;

  // Parse data into { date, ratio }
  const parsed = useMemo(() => {
    const parse = (data: HealthRecord[]) =>
      data
        .map((d) => {
          const total = d.normalCell + d.diseaseCell + d.deadCell;
          return {
            date: new Date(d.createdAt),
            ratio: total > 0 ? d.normalCell / total : 0,
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    return { a: parse(firstData), b: parse(secondData) };
  }, [firstData, secondData]);

  // X/Y scales
  const allTimes = useMemo(
    () => [...parsed.a, ...parsed.b].map((p) => p.date.getTime()),
    [parsed]
  );
  const xScale = useMemo(
    () =>
      scaleTime()
        .domain([Math.min(...allTimes), Math.max(...allTimes)])
        .nice()
        .range([margin, chartWidth - margin]),
    [allTimes, chartWidth, margin]
  );
  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain([0, 1])
        .range([chartHeight - margin, margin]),
    [chartHeight, margin]
  );

  // Create paths
  const makePath = (data: { date: Date; ratio: number }[]) => {
    const svg = line<{ date: Date; ratio: number }>()
      .x((d) => xScale(d.date.getTime()))
      .y((d) => yScale(d.ratio))
      .curve(curveBasis)(data as any);
    return svg ? Skia.Path.MakeFromSVGString(svg) : undefined;
  };
  const pathA = showFirst ? makePath(parsed.a) : undefined;
  const pathB = showSecond ? makePath(parsed.b) : undefined;

  // Touch handler for tooltip
  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationX } = evt.nativeEvent;
    const allPoints = [
      ...(showFirst ? parsed.a : []),
      ...(showSecond ? parsed.b : []),
    ];
    if (!allPoints.length) return;
    const targetTime = xScale.invert(locationX);
    const nearest = allPoints.reduce((prev, curr) =>
      Math.abs(curr.date.getTime() - targetTime.getTime()) <
      Math.abs(prev.date.getTime() - targetTime.getTime())
        ? curr
        : prev
    );
    const x = xScale(nearest.date.getTime());
    const y = yScale(nearest.ratio);
    const text = `${nearest.date.toLocaleDateString(dateLocale, {
      month: "short",
      day: "numeric",
    })}: ${(nearest.ratio * 100).toFixed(0)}%`;
    setTooltip({ x, y, text });
  };

  // Dynamic ticks
  const xTicks = xScale.ticks(5);
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={[styles.container, { padding: margin }]}>
      {/* Chart Container: centered */}
      <View
        style={{
          width: chartWidth,
          alignSelf: "center",
        }}
        onStartShouldSetResponder={() => true}
        onResponderMove={handleTouch}
      >
        <Canvas style={{ width: chartWidth, height: chartHeight }}>
          <Rect
            x={0}
            y={0}
            width={chartWidth}
            height={chartHeight}
            color={COLORS.background}
          />

          {/* Grid & Data */}
          <Group>
            {yTicks.map((t, i) => {
              const y = yScale(t);
              const p = Skia.Path.Make();
              p.moveTo(margin, y);
              p.lineTo(chartWidth - margin, y);
              return (
                <Path
                  key={i}
                  path={p}
                  style="stroke"
                  color={COLORS.grid}
                  strokeWidth={1}
                />
              );
            })}
            {xTicks.map((d, i) => {
              const x = xScale(d.getTime());
              const p = Skia.Path.Make();
              p.moveTo(x, margin);
              p.lineTo(x, chartHeight - margin);
              return (
                <Path
                  key={i}
                  path={p}
                  style="stroke"
                  color={COLORS.grid}
                  strokeWidth={1}
                />
              );
            })}

            {/* Threshold line */}
            {(() => {
              const y = yScale(0.5);
              const p = Skia.Path.Make();
              p.moveTo(margin, y);
              p.lineTo(chartWidth - margin, y);
              return (
                <Path
                  path={p}
                  style="stroke"
                  color={COLORS.threshold}
                  strokeWidth={1}
                />
              );
            })()}

            {/* Shade under A */}
            {showFirst && pathA && (
              <Path path={pathA} style="fill" color={COLORS.shade} />
            )}

            {/* Data lines */}
            {pathA && (
              <Path
                path={pathA}
                style="stroke"
                color={COLORS.first}
                strokeWidth={2}
              />
            )}
            {pathB && (
              <Path
                path={pathB}
                style="stroke"
                color={COLORS.second}
                strokeWidth={2}
              />
            )}

            {/* Tooltip circle */}
            {tooltip && (
              <Circle cx={tooltip.x} cy={tooltip.y} r={4} color="#333" />
            )}
          </Group>
        </Canvas>

        {/* X-axis labels */}
        <View
          style={[
            {
              height: chartHeight,
              position: "absolute",
              flex: 1,
              justifyContent: "space-between",
            },
          ]}
        >
          {yTicks
            .map((d, i) => (
              <Text key={i} style={styles.xLabel}>
                {d.toLocaleString(dateLocale, {
                  style: "percent",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Text>
            ))
            .reverse()}
        </View>

        {/* Tooltip box */}
        {tooltip && (
          <View
            style={[
              styles.tooltip,
              { left: tooltip.x - 50, top: tooltip.y - 30 },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.tooltipText}>{tooltip.text}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default React.memo(CompareHealthChart);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    marginRight: 4,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#333",
  },
  xAxisContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  xLabel: {
    fontSize: 10,
    color: "#555",
  },
  tooltip: {
    position: "absolute",
    top: 0,
    backgroundColor: "white",
    padding: 4,
    borderRadius: 4,
    elevation: 4,
  },
  tooltipText: {
    fontSize: 10,
    color: "#333",
  },
});
