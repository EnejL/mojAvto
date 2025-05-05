import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

const FuelConsumptionGraph = ({ fillings }) => {
  const { t } = useTranslation();
  const [showGraph, setShowGraph] = useState(false);
  const screenWidth = Dimensions.get('window').width - 32; // margins

  const chartData = useMemo(() => {
    if (!fillings || fillings.length < 2) return { dataPoints: [], min: 0, max: 0 };

    const sorted = [...fillings].sort((a, b) => a.odometer - b.odometer);
    const pts = [];
    let min = Infinity, max = 0;

    for (let i = 1; i < sorted.length; i++) {
      const cur = sorted[i], prev = sorted[i - 1];
      const dist = cur.odometer - prev.odometer;
      if (dist <= 0) continue;
      const c = (cur.liters / dist) * 100;
      if (c < 3 || c > 30) continue;
      const d = new Date(cur.date.seconds * 1000);
      const label = `${String(d.getDate()).padStart(2,'0')}. ${String(d.getMonth()+1).padStart(2,'0')}.`;
      pts.push({ date: label, consumption: c });
      if (c < min) min = c;
      if (c > max) max = c;
    }

    if (!pts.length) return { dataPoints: [], min: 0, max: 0 };
    min = Math.max(0, min - 1);
    max = max + 1;
    return { dataPoints: pts, min, max };
  }, [fillings]);

  const { dataPoints, min, max } = chartData;
  const range = max - min;
  const graphHeight = 200;
  const pointWidth = 60;

  if (dataPoints.length < 2) return null;
  if (!showGraph) {
    return (
      <Surface style={styles.container}>
        <Button mode="contained" onPress={() => setShowGraph(true)}>
          {t('fillings.showConsumptionGraph')}
        </Button>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t('fillings.consumptionOverTime')}</Text>
        <Button mode="text" onPress={() => setShowGraph(false)}>
          {t('common.hide')}
        </Button>
      </View>

      <View style={styles.graphContainer}>
        {/* Y-Axis Labels */}
        <View style={styles.yAxisLabels}>
          <Text style={styles.yAxisLabel}>{max.toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{((max + min) / 2).toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{min.toFixed(1)}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
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
            {dataPoints.map((pt, i) => {
              if (i === 0) return null;
              const prev = dataPoints[i - 1];
              const x1 = (i - 1) * pointWidth;
              const x2 = i * pointWidth;
              const y1 = graphHeight - ((prev.consumption - min) / range) * graphHeight;
              const y2 = graphHeight - ((pt.consumption - min) / range) * graphHeight;
              const angle = Math.atan2(y2 - y1, pointWidth);

              return (
                <View key={`line-${i}`} style={styles.lineContainer}>
                  <View
                    style={[
                      styles.dataLine,
                      {
                        left: x1,
                        width: pointWidth,
                        transform: [
                          { translateY: y1 },
                          { rotate: `${angle}rad` },
                          // { translateY: -y1 },
                        ],
                      },
                    ]}
                  />
                </View>
              );
            })}

            {/* 2) Render dots */}
            {dataPoints.map((pt, i) => {
              const x = i * pointWidth;
              const y = graphHeight - ((pt.consumption - min) / range) * graphHeight;
              return (
                <View
                  key={`dot-${i}`}
                  style={[
                    styles.dataPoint,
                    { left: x - 4, top: y - 4 },
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
                    {
                      left: i * pointWidth - 35,
                      width: 70,
                    },
                  ]}
                >
                  {pt.date}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Y-Axis Title */}
        <View style={styles.yAxisTitle}>
          <Text style={styles.axisTitle} numberOfLines={1}>
            L/100km
          </Text>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  button: { marginVertical: 8 },
  closeButton: { marginLeft: 8 },

  graphContainer: { flexDirection: 'row', height: 250 },
  yAxisLabels: {
    width: 40,
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  yAxisLabel: { fontSize: 10, color: '#666' },

  scrollContainer: { flex: 1 },
  chartArea: { height: 200, position: 'relative', marginBottom: 40 },

  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#ccc',
  },
  xAxis: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#ccc',
  },
  lineContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  dataLine: {
    position: 'absolute',
    top: 0,
    height: 2,
    backgroundColor: '#2e7d32',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2e7d32',
    borderWidth: 1,
    borderColor: '#fff',
  },

  xAxisLabels: {
    position: 'absolute',
    left: 5,
    bottom: -55,
    flexDirection: 'row',
    height: 40,
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    transform: [{ rotate: '-90deg' }],
  },

  yAxisTitle: {
    position: 'absolute',
    left: -10,
    top: 120,
    width: 30,
    alignItems: 'center',
  },
  axisTitle: {
    fontSize: 11,
    color: '#666',
    transform: [{ rotate: '-90deg' }],
    textAlign: 'center',
    width: 60,
  },
});

export default FuelConsumptionGraph;
