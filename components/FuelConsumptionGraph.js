import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { defaultUserProfile, getUserProfile } from '../utils/userProfile';

const COLORS = {
  bg: "transparent",
  text: "#E8F0FA",
  subtext: "#94A3B8",
  muted: "#64748B",
  border: "rgba(148,163,184,0.18)",
  grid: "rgba(148,163,184,0.12)",
  axis: "rgba(148,163,184,0.28)",
  fuel: "#22C55E",
  electric: "#3B82F6",
};

const ConsumptionGraph = ({ data, dataType = "fuel", unitSystem, locale }) => {
  const { t, i18n } = useTranslation();
  const [textLaidOut, setTextLaidOut] = useState(false);
  const [userSettings, setUserSettings] = useState(defaultUserProfile);
  const screenWidth = Dimensions.get('window').width - 32; // margins

  const resolvedLocale =
    locale || (i18n.language?.startsWith("sl") ? "sl-SI" : "en-US");
  const resolvedUnitSystem = unitSystem || userSettings.unitSystem;

  // Reset layout state when data/dataType changes (helps rotation + label layout)
  useEffect(() => {
    setTextLaidOut(false);
    const timer = setTimeout(() => setTextLaidOut(true), 80);
    return () => clearTimeout(timer);
  }, [dataType, data?.length]);

  useEffect(() => {
    if (unitSystem) return;
    const loadSettings = async () => {
      try {
        const profile = await getUserProfile();
        setUserSettings(profile);
      } catch (e) {
        setUserSettings(defaultUserProfile);
      }
    };
    loadSettings();
  }, []);

  const convertFuelConsumption = (value) => {
    if (value === null || value === undefined) return { value, unit: 'L/100km' };
    if (resolvedUnitSystem === 'imperial') {
      const mpg = 235.214583 / value;
      return { value: mpg, unit: 'MPG' };
    }
    return { value, unit: 'L/100km' };
  };

  const convertElectricConsumption = (value) => {
    if (value === null || value === undefined) return { value, unit: 'kWh/100km' };
    if (resolvedUnitSystem === 'imperial') {
      const per100mi = value * 1.60934;
      return { value: per100mi, unit: 'kWh/100mi' };
    }
    return { value, unit: 'kWh/100km' };
  };

  const chartData = useMemo(() => {
    if (!data || data.length < 2)
      return { dataPoints: [], fuelPoints: [], electricPoints: [], min: 0, max: 0, unit: '' };

    const sorted = [...data].sort((a, b) => a.odometer - b.odometer);
    const pts = [];
    const fuelPts = [];
    const electricPts = [];
    let min = Infinity, max = 0;

    // Determine consumption calculation based on data type
    const getConsumption = (current, previous) => {
      const dist = current.odometer - previous.odometer;
      if (dist <= 0) return null;

      let consumption;
      let isValid;
      let entryType;

      if (dataType === 'fuel' || current.type === 'filling') {
        // Fuel consumption: liters per 100km (convert later for imperial)
        const base = (current.liters / dist) * 100;
        const converted = convertFuelConsumption(base);
        consumption = converted.value;
        isValid = base >= 3 && base <= 30;
        entryType = 'fuel';
      } else if (dataType === 'electricity' || current.type === 'charging') {
        // Electric consumption: kWh per 100km (convert later for imperial)
        const base = (current.energyAdded / dist) * 100;
        const converted = convertElectricConsumption(base);
        consumption = converted.value;
        isValid = base >= 1 && base <= 50;
        entryType = 'electricity';
      } else {
        return null;
      }

      return isValid ? { consumption, entryType } : null;
    };

    for (let i = 1; i < sorted.length; i++) {
      const cur = sorted[i];
      const prev = sorted[i - 1];
      
      const result = getConsumption(cur, prev);
      if (result === null) continue;

      const { consumption, entryType } = result;

      // Format date
      let dateObj;
      if (cur.date.seconds) {
        dateObj = new Date(cur.date.seconds * 1000);
      } else if (cur.date instanceof Date) {
        dateObj = cur.date;
      } else {
        dateObj = new Date(cur.date);
      }

      // Keep legacy X-axis label formatting: dd. mm. yy
      // (matches the app’s existing consumption graph style)
      const label = `${String(dateObj.getDate()).padStart(2, "0")}. ${String(
        dateObj.getMonth() + 1
      ).padStart(2, "0")}. ${String(dateObj.getFullYear()).slice(-2)}`;
      
      const point = { 
        date: label, 
        consumption: consumption,
        type: entryType,
        odometer: cur.odometer,
        // Store the position in the pts array (will be set after push)
        position: pts.length
      };
      
      pts.push(point);
      
      // For PHEV, separate into fuel and electric arrays
      if (dataType === 'combined') {
        if (entryType === 'fuel') {
          fuelPts.push(point);
        } else {
          electricPts.push(point);
        }
      }
      
      if (consumption < min) min = consumption;
      if (consumption > max) max = consumption;
    }

    if (!pts.length) return { dataPoints: [], fuelPoints: [], electricPoints: [], min: 0, max: 0, unit: '' };
    
    min = Math.max(0, min - 1);
    max = max + 1;
    
    // Determine unit based on data type and user settings
    let unit;
    if (dataType === 'electricity') {
      unit = resolvedUnitSystem === 'imperial' ? 'kWh/100mi' : 'kWh/100km';
    } else if (dataType === 'combined') {
      const fuelUnit = resolvedUnitSystem === 'imperial' ? 'MPG' : 'L/100km';
      const elecUnit = resolvedUnitSystem === 'imperial' ? 'kWh/100mi' : 'kWh/100km';
      unit = `${fuelUnit} | ${elecUnit}`;
    } else {
      unit = resolvedUnitSystem === 'imperial' ? 'MPG' : 'L/100km';
    }
    
    return { dataPoints: pts, fuelPoints: fuelPts, electricPoints: electricPts, min, max, unit };
  }, [data, dataType, resolvedUnitSystem, resolvedLocale]);

  const { dataPoints, fuelPoints, electricPoints, min, max, unit } = chartData;
  const range = max - min;
  const graphHeight = 200;
  const pointWidth = 60;

  if (dataPoints.length < 2) return null;
  
  // Determine if we're showing dual lines for PHEV
  const isDualLine = dataType === 'combined' && fuelPoints.length > 0 && electricPoints.length > 0;

  return (
    <View style={styles.container}>
      {isDualLine ? (
        <View style={styles.metaColumn}>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.fuel }]} />
              <Text style={styles.legendText}>{t("vehicles.fuelConsumption")}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.electric }]} />
              <Text style={styles.legendText}>{t("vehicles.electricConsumption")}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.metaRow} />
      )}

      <View style={styles.graphContainer}>
        {/* Y-Axis Labels */}
        <View style={styles.yAxisLabels}>
          <Text style={styles.yAxisLabel}>{max.toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{((max + min) / 2).toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{min.toFixed(1)}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
          style={styles.scrollContainer}
        >
          <View
            style={[
              styles.chartArea,
              { width: Math.max(screenWidth, dataPoints.length * pointWidth + 40) },
            ]}
          >
            {/* Grid and axes */}
            <View style={[styles.gridLine, { top: 0 }]} />
            <View style={[styles.gridLine, { top: graphHeight / 2 }]} />
            <View style={[styles.gridLine, { top: graphHeight }]} />
            <View style={styles.yAxis} />
            <View style={styles.xAxis} />

            {/* 1) Render lines */}
            {isDualLine ? (
              // For PHEV: Render separate fuel and electric lines
              <>
                {/* Fuel line (green) */}
                {fuelPoints.map((pt, i) => {
                  if (i === 0) return null;
                  const prev = fuelPoints[i - 1];
                  const x1 = prev.position * pointWidth;
                  const x2 = pt.position * pointWidth;
                  const y1 = graphHeight - ((prev.consumption - min) / range) * graphHeight;
                  const y2 = graphHeight - ((pt.consumption - min) / range) * graphHeight;
                  
                  const deltaX = x2 - x1;
                  const deltaY = y2 - y1;
                  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                  const angle = Math.atan2(deltaY, deltaX);

                  return (
                    <View 
                      key={`fuel-line-${i}`}
                      style={[
                        styles.dataLine,
                        {
                          left: x1,
                          top: y1,
                          width: length,
                          backgroundColor: COLORS.fuel,
                          transformOrigin: 'left center',
                          transform: [{ rotate: `${angle}rad` }],
                        },
                      ]}
                    />
                  );
                })}
                
                {/* Electric line (blue) */}
                {electricPoints.map((pt, i) => {
                  if (i === 0) return null;
                  const prev = electricPoints[i - 1];
                  const x1 = prev.position * pointWidth;
                  const x2 = pt.position * pointWidth;
                  const y1 = graphHeight - ((prev.consumption - min) / range) * graphHeight;
                  const y2 = graphHeight - ((pt.consumption - min) / range) * graphHeight;
                  
                  const deltaX = x2 - x1;
                  const deltaY = y2 - y1;
                  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                  const angle = Math.atan2(deltaY, deltaX);

                  return (
                    <View 
                      key={`electric-line-${i}`}
                      style={[
                        styles.dataLine,
                        {
                          left: x1,
                          top: y1,
                          width: length,
                          backgroundColor: COLORS.electric,
                          transformOrigin: 'left center',
                          transform: [{ rotate: `${angle}rad` }],
                        },
                      ]}
                    />
                  );
                })}
              </>
            ) : (
              // For ICE/BEV/HYBRID: Single line with appropriate color
              dataPoints.map((pt, i) => {
                if (i === 0) return null;
                const prev = dataPoints[i - 1];
                const x1 = (i - 1) * pointWidth;
                const x2 = i * pointWidth;
                const y1 = graphHeight - ((prev.consumption - min) / range) * graphHeight;
                const y2 = graphHeight - ((pt.consumption - min) / range) * graphHeight;
                
                const deltaX = x2 - x1;
                const deltaY = y2 - y1;
                const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const angle = Math.atan2(deltaY, deltaX);

                // Color: Blue for BEV, Green for ICE/HYBRID
                const lineColor = dataType === 'electricity' ? COLORS.electric : COLORS.fuel;

                return (
                  <View 
                    key={`line-${i}`}
                    style={[
                      styles.dataLine,
                      {
                        left: x1,
                        top: y1,
                        width: length,
                        backgroundColor: lineColor,
                        transformOrigin: 'left center',
                        transform: [{ rotate: `${angle}rad` }],
                      },
                    ]}
                  />
                );
              })
            )}

            {/* 2) Render dots */}
            {dataPoints.map((pt, i) => {
              const x = i * pointWidth;
              const y = graphHeight - ((pt.consumption - min) / range) * graphHeight;
              
              // Determine dot color based on type
              let dotColor;
              if (dataType === 'electricity') {
                dotColor = COLORS.electric; // Blue for BEV
              } else if (dataType === 'combined') {
                dotColor = pt.type === 'electricity' ? COLORS.electric : COLORS.fuel; // Mixed for PHEV
              } else {
                dotColor = COLORS.fuel; // Green for ICE/HYBRID
              }
              
              return (
                <View
                  key={`dot-${i}`}
                  style={[
                    styles.dataPoint,
                    { 
                      left: x - 4, 
                      top: y - 4,
                      backgroundColor: dotColor,
                      borderColor: dotColor,
                    },
                  ]}
                />
              );
            })}

            {/* X-Axis Labels */}
            <View style={styles.xAxisLabels}>
              {dataPoints.map((pt, i) => (
                <Text
                  key={`label-${i}`}
                  style={[
                    styles.xAxisLabel,
                    textLaidOut && { transform: [{ rotate: '-90deg' }] },
                    {
                      left: i * pointWidth - 35,
                      width: 70,
                    },
                  ]}
                  onLayout={() => {
                    if (i === 0 && !textLaidOut) {
                      setTextLaidOut(true);
                    }
                  }}
                >
                  {pt.date}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Y-Axis Title */}
        <View style={styles.yAxisTitle}>
          <Text 
            style={[
              styles.axisTitle,
              textLaidOut && { transform: [{ rotate: '-90deg' }] }
            ]}
            onLayout={() => {
              if (!textLaidOut) {
                setTextLaidOut(true);
              }
            }}
            numberOfLines={1}
          >
            {unit}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg,
    paddingTop: 6,
    paddingBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metaColumn: {
    marginBottom: 10,
    gap: 6,
  },

  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.subtext,
    fontWeight: "700",
  },

  graphContainer: {
    flexDirection: "row",
    height: 270,
  },

  yAxisLabels: {
    width: 40,
    height: 200,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 5,
  },
  yAxisLabel: {
    fontSize: 10,
    color: COLORS.muted,
  },

  scrollContainer: { flex: 1 },
  chartArea: {
    height: 200,
    position: "relative",
    marginBottom: 60,
  },

  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.grid,
  },
  yAxis: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.axis,
  },
  xAxis: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: COLORS.axis,
  },
  dataLine: {
    position: "absolute",
    height: 2,
  },
  dataPoint: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
  },

  xAxisLabels: {
    position: "absolute",
    left: 5,
    bottom: -80,
    flexDirection: "row",
    height: 50,
  },

  xAxisLabel: {
    position: "absolute",
    fontSize: 11,
    color: COLORS.subtext,
    textAlign: "center",
  },

  yAxisTitle: {
    position: "absolute",
    left: -35,
    top: 100,
    width: 80,
    alignItems: "center",
    zIndex: 10,
  },
  axisTitle: {
    fontSize: 11,
    color: COLORS.subtext,
    textAlign: "center",
    width: 150,
  },
});

export default ConsumptionGraph;