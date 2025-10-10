import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

const ConsumptionGraph = ({ data, dataType = 'fuel' }) => {
  const { t } = useTranslation();
  const [showGraph, setShowGraph] = useState(false);
  const screenWidth = Dimensions.get('window').width - 32; // margins

  const chartData = useMemo(() => {
    if (!data || data.length < 2) return { dataPoints: [], fuelPoints: [], electricPoints: [], min: 0, max: 0, unit: '' };

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
        // Fuel consumption: liters per 100km
        consumption = (current.liters / dist) * 100;
        isValid = consumption >= 3 && consumption <= 30;
        entryType = 'fuel';
      } else if (dataType === 'electricity' || current.type === 'charging') {
        // Electric consumption: kWh per 100km
        consumption = (current.energyAdded / dist) * 100;
        isValid = consumption >= 1 && consumption <= 50;
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

      const label = `${String(dateObj.getDate()).padStart(2,'0')}. ${String(dateObj.getMonth()+1).padStart(2,'0')}.`;
      
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
    
    // Determine unit based on data type
    let unit;
    if (dataType === 'electricity') {
      unit = 'kWh/100km';
    } else if (dataType === 'combined') {
      unit = 'L/100km | kWh/100km';
    } else {
      unit = 'L/100km';
    }
    
    return { dataPoints: pts, fuelPoints: fuelPts, electricPoints: electricPts, min, max, unit };
  }, [data, dataType]);

  const { dataPoints, fuelPoints, electricPoints, min, max, unit } = chartData;
  const range = max - min;
  const graphHeight = 200;
  const pointWidth = 60;

  if (dataPoints.length < 2) return null;
  
  // Determine if we're showing dual lines for PHEV
  const isDualLine = dataType === 'combined' && fuelPoints.length > 0 && electricPoints.length > 0;
  if (!showGraph) {
    return (
      <Surface style={styles.container}>
        <Button mode="contained" onPress={() => setShowGraph(true)}>
          {t('vehicles.showConsumptionGraph')}
        </Button>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t('vehicles.consumptionOverTime')}</Text>
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
                          backgroundColor: '#2e7d32',
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
                          backgroundColor: '#2196F3',
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
                const lineColor = dataType === 'electricity' ? '#2196F3' : '#2e7d32';

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
                dotColor = '#2196F3'; // Blue for BEV
              } else if (dataType === 'combined') {
                dotColor = pt.type === 'electricity' ? '#2196F3' : '#2e7d32'; // Mixed for PHEV
              } else {
                dotColor = '#2e7d32'; // Green for ICE/HYBRID
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
            {unit}
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
  dataLine: {
    position: 'absolute',
    height: 2,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
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

export default ConsumptionGraph;
