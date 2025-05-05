import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

const SimpleFuelConsumptionGraph = ({ fillings }) => {
  const { t } = useTranslation();
  const [showGraph, setShowGraph] = useState(false);
  const screenWidth = Dimensions.get('window').width - 32; // Account for margins
  
  // Process fillings data to calculate consumption between fillings
  const chartData = useMemo(() => {
    if (!fillings || fillings.length < 2) return [];

    // Sort fillings by odometer reading (ascending)
    const sortedFillings = [...fillings].sort((a, b) => a.odometer - b.odometer);

    // Calculate consumption between each pair of fillings
    const dataPoints = [];
    let minConsumption = Infinity;
    let maxConsumption = 0;

    for (let i = 1; i < sortedFillings.length; i++) {
      const currentFilling = sortedFillings[i];
      const previousFilling = sortedFillings[i - 1];

      // Skip if odometer readings are the same or invalid
      if (currentFilling.odometer <= previousFilling.odometer) continue;

      const distance = currentFilling.odometer - previousFilling.odometer;
      const consumption = (currentFilling.liters / distance) * 100; // L/100km

      // Skip unrealistic consumption values (e.g., over 30L/100km or under 3L/100km)
      if (consumption > 30 || consumption < 3) continue;

      // Format date as dd/mm
      const date = new Date(currentFilling.date.seconds * 1000);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      dataPoints.push({
        date: formattedDate,
        consumption: consumption
      });
      
      // Track min and max for scaling
      if (consumption < minConsumption) minConsumption = consumption;
      if (consumption > maxConsumption) maxConsumption = consumption;
    }

    // Add padding to min/max for better visualization
    minConsumption = Math.max(0, minConsumption - 1);
    maxConsumption = maxConsumption + 1;
    
    return {
      dataPoints,
      minConsumption,
      maxConsumption
    };
  }, [fillings]);

  // If there aren't enough data points, don't render anything
  if (!chartData.dataPoints || chartData.dataPoints.length < 2 || !fillings || fillings.length < 5) {
    return null;
  }

  if (!showGraph) {
    return (
      <Surface style={styles.container}>
        <Button
          mode="contained"
          onPress={() => setShowGraph(true)}
          style={styles.button}
        >
          {t('fillings.showConsumptionGraph')}
        </Button>
      </Surface>
    );
  }

  // Calculate the range for proper scaling
  const range = chartData.maxConsumption - chartData.minConsumption;
  const graphHeight = 200;

  return (
    <Surface style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t('fillings.consumptionOverTime')}</Text>
        <Button
          mode="text"
          onPress={() => setShowGraph(false)}
          style={styles.closeButton}
        >
          {t('common.hide')}
        </Button>
      </View>
      
      <View style={styles.graphContainer}>
        <View style={styles.yAxisLabels}>
          <Text style={styles.yAxisLabel}>{chartData.maxConsumption.toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{((chartData.maxConsumption + chartData.minConsumption) / 2).toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{chartData.minConsumption.toFixed(1)}</Text>
        </View>
        
        <View style={styles.chartArea}>
          {/* Y-axis line */}
          <View style={styles.yAxis} />
          
          {/* X-axis line */}
          <View style={styles.xAxis} />
          
          {/* Grid lines */}
          <View style={[styles.gridLine, { top: 0 }]} />
          <View style={[styles.gridLine, { top: graphHeight / 2 }]} />
          <View style={[styles.gridLine, { top: graphHeight }]} />
          
          {/* Data points and lines */}
          {chartData.dataPoints.map((point, index) => {
            // Skip first point for lines (no previous point)
            if (index === 0) return null;
            
            const previousPoint = chartData.dataPoints[index - 1];
            
            // Calculate positions
            const pointWidth = (screenWidth - 50) / (chartData.dataPoints.length - 1);
            const x1 = (index - 1) * pointWidth;
            const x2 = index * pointWidth;
            
            // Y positions (inverted because 0,0 is top-left)
            const y1Position = graphHeight - ((previousPoint.consumption - chartData.minConsumption) / range) * graphHeight;
            const y2Position = graphHeight - ((point.consumption - chartData.minConsumption) / range) * graphHeight;
            
            return (
              <View key={index} style={styles.lineContainer}>
                <View
                  style={[
                    styles.dataLine,
                    {
                      left: x1,
                      width: pointWidth,
                      height: 2,
                      transform: [
                        { translateY: y1Position },
                        { rotate: Math.atan2(y2Position - y1Position, pointWidth) + 'rad' },
                        { translateY: -y1Position }
                      ],
                    },
                  ]}
                />
                
                <View
                  style={[
                    styles.dataPoint,
                    {
                      left: x2 - 4, // Center the dot
                      top: y2Position - 4, // Center the dot
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>
      
      {/* X-axis labels */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.xAxisLabels}>
          {chartData.dataPoints.map((point, index) => {
            const pointWidth = (screenWidth - 50) / (chartData.dataPoints.length);
            return (
              <Text
                key={index}
                style={[
                  styles.xAxisLabel,
                  { width: pointWidth, left: index * pointWidth - pointWidth / 2 },
                ]}
              >
                {point.date}
              </Text>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.yAxisTitle}>
        <Text style={styles.axisTitle}>L/100km</Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 8,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    marginVertical: 8,
  },
  closeButton: {
    marginLeft: 8,
  },
  graphContainer: {
    height: 220,
    flexDirection: 'row',
    marginTop: 10,
  },
  yAxisLabels: {
    width: 40,
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#666',
  },
  chartArea: {
    flex: 1,
    height: 200,
    position: 'relative',
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
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#2e7d32',
    transformOrigin: 'left center',
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
    flexDirection: 'row',
    height: 30,
    marginLeft: 40,
    marginTop: 5,
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  yAxisTitle: {
    position: 'absolute',
    left: 0,
    top: 100,
    width: 30,
    alignItems: 'center',
  },
  axisTitle: {
    fontSize: 10,
    color: '#666',
    transform: [{ rotate: '-90deg' }],
  },
});

export default SimpleFuelConsumptionGraph;