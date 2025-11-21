// utils/exportVehicleData.js
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Helper function to format dates consistently
const formatDate = (date) => {
  if (!date) return "";

  let dateObj;

  // Handle Firestore timestamp objects
  if (date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  }
  // Handle Date objects
  else if (date instanceof Date) {
    dateObj = date;
  }
  // Handle string dates
  else {
    try {
      dateObj = new Date(date);
    } catch (e) {
      return date;
    }
  }

  // Format as dd.mm.yyyy
  return `${dateObj.getDate().toString().padStart(2, "0")}.${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}.${dateObj.getFullYear()}`;
};

// Helper function to format numbers consistently
const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined) return "0";
  return parseFloat(value).toFixed(decimals).replace(".", ",");
};

// Helper function to format odometer readings
const formatOdometer = (value) => {
  if (value === null || value === undefined) return "0";
  return Math.round(parseFloat(value)).toLocaleString('de-DE');
};

// Generate CSV content for vehicle data
const generateCSV = (vehicle, fillings, chargingSessions, stats, t) => {
  let csv = "";
  
  // Add UTF-8 BOM for Excel to properly recognize encoding
  csv = "\uFEFF";
  
  // Vehicle Information Section
  csv += `${t("export.vehicleInfo")}\n`;
  csv += `${t("vehicles.name")},${vehicle.name}\n`;
  csv += `${t("vehicles.make")},${vehicle.make}\n`;
  csv += `${t("vehicles.model")},${vehicle.model}\n`;
  csv += `${t("vehicles.type")},${t(`vehicles.types.${vehicle.vehicleType || 'ICE'}`)}\n`;
  if (vehicle.vin) csv += `${t("vehicles.vin")},${vehicle.vin}\n`;
  if (vehicle.licensePlate) csv += `${t("vehicles.licensePlate")},${vehicle.licensePlate}\n`;
  csv += `\n`;

  // Statistics Section
  csv += `${t("export.statistics")}\n`;
  
  if (stats.avgFuelConsumption !== null && stats.avgFuelConsumption !== undefined) {
    csv += `${t("fillings.consumption")},${formatNumber(stats.avgFuelConsumption)} l/100km\n`;
  }
  
  if (stats.avgElectricityConsumption !== null && stats.avgElectricityConsumption !== undefined) {
    csv += `${t("charging.avgConsumption")},${formatNumber(stats.avgElectricityConsumption)} kWh/100km\n`;
  }
  
  if (stats.avgPricePerLiter !== null && stats.avgPricePerLiter !== undefined) {
    csv += `${t("fillings.avgPricePerLiter")},${formatNumber(stats.avgPricePerLiter, 2)} €\n`;
  }
  
  if (stats.avgPricePerKWh !== null && stats.avgPricePerKWh !== undefined) {
    csv += `${t("charging.avgPricePerKWh")},${formatNumber(stats.avgPricePerKWh, 2)} €\n`;
  }
  
  if (stats.totalFuelCost !== null && stats.totalFuelCost !== undefined) {
    csv += `${t("vehicles.totalFuelCost")},${formatNumber(stats.totalFuelCost, 2)} €\n`;
  }
  
  if (stats.totalChargingCost !== null && stats.totalChargingCost !== undefined) {
    csv += `${t("vehicles.totalChargingCost")},${formatNumber(stats.totalChargingCost, 2)} €\n`;
  }
  
  csv += `\n`;

  // Additional Statistics Section
  csv += `${t("vehicles.additionalStatistics")}\n`;
  
  // Fuel additional statistics
  if (stats.averageDistancePerFilling !== null && stats.averageDistancePerFilling !== undefined) {
    csv += `${t("vehicles.avgDistancePerFilling")},${formatNumber(stats.averageDistancePerFilling)} km\n`;
  }
  
  if (stats.longestDistanceSingleTank !== null && stats.longestDistanceSingleTank !== undefined) {
    csv += `${t("vehicles.longestDistanceSingleTank")},${formatNumber(stats.longestDistanceSingleTank)} km\n`;
  }
  
  if (stats.daysSinceLastFilling !== null && stats.daysSinceLastFilling !== undefined) {
    csv += `${t("vehicles.daysSinceLastFilling")},${stats.daysSinceLastFilling}\n`;
  }
  
  if (stats.averageDaysBetweenFillings !== null && stats.averageDaysBetweenFillings !== undefined) {
    csv += `${t("vehicles.avgDaysBetweenFillings")},${formatNumber(stats.averageDaysBetweenFillings, 1)}\n`;
  }
  
  if (stats.averageCostPerDayFuel !== null && stats.averageCostPerDayFuel !== undefined) {
    csv += `${t("vehicles.avgCostPerDayFuel")},${formatNumber(stats.averageCostPerDayFuel, 2)} €\n`;
  }
  
  if (stats.totalFuelDistance !== null && stats.totalFuelDistance !== undefined) {
    csv += `${t("vehicles.totalDistance")},${formatOdometer(stats.totalFuelDistance)} km\n`;
  }
  
  if (stats.averageFuelCostPer100km !== null && stats.averageFuelCostPer100km !== undefined) {
    csv += `${t("vehicles.avgCostPer100km")},${formatNumber(stats.averageFuelCostPer100km, 2)} €\n`;
  }
  
  // Charging additional statistics
  if (stats.averageDistancePerCharging !== null && stats.averageDistancePerCharging !== undefined) {
    csv += `${t("vehicles.avgDistancePerCharging")},${formatNumber(stats.averageDistancePerCharging)} km\n`;
  }
  
  if (stats.longestDistanceSingleCharge !== null && stats.longestDistanceSingleCharge !== undefined) {
    csv += `${t("vehicles.longestDistanceSingleCharge")},${formatNumber(stats.longestDistanceSingleCharge)} km\n`;
  }
  
  if (stats.daysSinceLastCharging !== null && stats.daysSinceLastCharging !== undefined) {
    csv += `${t("vehicles.daysSinceLastCharging")},${stats.daysSinceLastCharging}\n`;
  }
  
  if (stats.averageDaysBetweenCharging !== null && stats.averageDaysBetweenCharging !== undefined) {
    csv += `${t("vehicles.avgDaysBetweenCharging")},${formatNumber(stats.averageDaysBetweenCharging, 1)}\n`;
  }
  
  if (stats.averageCostPerDayCharging !== null && stats.averageCostPerDayCharging !== undefined) {
    csv += `${t("vehicles.avgCostPerDayCharging")},${formatNumber(stats.averageCostPerDayCharging, 2)} €\n`;
  }
  
  if (stats.totalElectricityDistance !== null && stats.totalElectricityDistance !== undefined) {
    csv += `${t("vehicles.totalDistance")},${formatOdometer(stats.totalElectricityDistance)} km\n`;
  }
  
  if (stats.averageElectricityCostPer100km !== null && stats.averageElectricityCostPer100km !== undefined) {
    csv += `${t("vehicles.avgCostPer100km")},${formatNumber(stats.averageElectricityCostPer100km, 2)} €\n`;
  }
  
  csv += `\n`;

  // Fillings Section (if available)
  if (fillings && fillings.length > 0) {
    csv += `${t("fillings.nav")}\n`;
    csv += `${t("common.date")},${t("fillings.odometer")},${t("fillings.liters")},${t("fillings.cost")},${t("fillings.pricePerLiter")},${t("fillings.fuelType")}\n`;
    
    const sortedFillings = [...fillings].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA;
    });

    sortedFillings.forEach((filling) => {
      const pricePerLiter = filling.liters > 0 ? filling.cost / filling.liters : 0;
      csv += `${formatDate(filling.date)},${formatOdometer(filling.odometer)},${formatNumber(filling.liters, 2)},${formatNumber(filling.cost, 2)},${formatNumber(pricePerLiter, 3)},${filling.fuelType || "-"}\n`;
    });
    
    csv += `\n`;
  }

  // Charging Sessions Section (if available)
  if (chargingSessions && chargingSessions.length > 0) {
    csv += `${t("charging.nav")}\n`;
    csv += `${t("common.date")},${t("fillings.odometer")},${t("charging.energyAdded")},${t("fillings.cost")},${t("charging.pricePerKWh")},${t("charging.chargingType")}\n`;
    
    const sortedSessions = [...chargingSessions].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA;
    });

    sortedSessions.forEach((session) => {
      const pricePerKWh = session.energyAdded > 0 ? session.cost / session.energyAdded : 0;
      csv += `${formatDate(session.date)},${formatOdometer(session.odometer)},${formatNumber(session.energyAdded, 2)},${formatNumber(session.cost, 2)},${formatNumber(pricePerKWh, 3)},${session.chargingType || "-"}\n`;
    });
    
    csv += `\n`;
  }

  csv += `${t("export.generatedOn")}: ${formatDate(new Date())}\n`;
  
  return csv;
};

// Export vehicle data to CSV file
export const exportToCSV = async (vehicle, fillings, chargingSessions, stats, t) => {
  try {
    const csvContent = generateCSV(vehicle, fillings, chargingSessions, stats, t);
    
    // Create filename with vehicle name and current date
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${vehicle.name.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Write CSV file
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: t("export.shareTitle"),
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      throw new Error(t("export.sharingNotAvailable"));
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to calculate consumption data points for graph
const calculateConsumptionData = (fillings, chargingSessions, vehicleType) => {
  const dataPoints = [];
  
  // Combine and sort all entries by odometer
  const allEntries = [];
  
  if (fillings && fillings.length > 0) {
    fillings.forEach(f => {
      allEntries.push({ ...f, entryType: 'fuel' });
    });
  }
  
  if (chargingSessions && chargingSessions.length > 0) {
    chargingSessions.forEach(c => {
      allEntries.push({ ...c, entryType: 'electricity' });
    });
  }
  
  if (allEntries.length < 2) return [];
  
  const sorted = [...allEntries].sort((a, b) => a.odometer - b.odometer);
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const previous = sorted[i - 1];
    const distance = current.odometer - previous.odometer;
    
    if (distance <= 0) continue;
    
    let consumption;
    let isValid = false;
    
    if (current.entryType === 'fuel' && current.liters) {
      consumption = (current.liters / distance) * 100;
      isValid = consumption >= 3 && consumption <= 30;
    } else if (current.entryType === 'electricity' && current.energyAdded) {
      consumption = (current.energyAdded / distance) * 100;
      isValid = consumption >= 1 && consumption <= 50;
    }
    
    if (isValid) {
      let dateObj;
      if (current.date?.seconds) {
        dateObj = new Date(current.date.seconds * 1000);
      } else if (current.date instanceof Date) {
        dateObj = current.date;
      } else {
        dateObj = new Date(current.date);
      }
      
      const dateLabel = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getFullYear()).slice(-2)}`;
      
      dataPoints.push({
        date: dateLabel,
        consumption: consumption,
        type: current.entryType,
        odometer: current.odometer,
        index: dataPoints.length
      });
    }
  }
  
  return dataPoints;
};

// Generate HTML content for PDF
const generateHTML = (vehicle, fillings, chargingSessions, stats, t) => {
  const vehicleType = vehicle.vehicleType || 'ICE';
  
  // Calculate consumption data for graph
  const consumptionData = calculateConsumptionData(fillings, chargingSessions, vehicleType);
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      padding: 40px;
      color: #333;
      background: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3169ad;
    }
    .header h1 {
      font-size: 28px;
      color: #3169ad;
      margin-bottom: 10px;
    }
    .header .subtitle {
      font-size: 16px;
      color: #666;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #3169ad;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    .info-item {
      display: flex;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .info-label {
      font-weight: 600;
      margin-right: 8px;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      padding: 15px;
      background: #f0f7ff;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #d0e5ff;
    }
    .stat-value {
      font-size: 22px;
      font-weight: bold;
      color: #2e7d32;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 12px;
    }
    thead {
      background: #3169ad;
      color: white;
    }
    th {
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 8px;
      border-bottom: 1px solid #e0e0e0;
    }
    tbody tr:nth-child(even) {
      background: #f8f9fa;
    }
    tbody tr:hover {
      background: #f0f7ff;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    .no-data {
      padding: 20px;
      text-align: center;
      color: #999;
      font-style: italic;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .chart-container {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .chart-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #333;
    }
    .chart-svg {
      width: 100%;
      height: 300px;
      overflow: visible;
    }
    .chart-line {
      fill: none;
      stroke-width: 2;
    }
    .chart-line-fuel {
      stroke: #4CAF50;
    }
    .chart-line-electricity {
      stroke: #2196F3;
    }
    .chart-point {
      r: 4;
      cursor: pointer;
    }
    .chart-point-fuel {
      fill: #4CAF50;
    }
    .chart-point-electricity {
      fill: #2196F3;
    }
    .chart-axis {
      stroke: #ccc;
      stroke-width: 1;
    }
    .chart-label {
      font-size: 11px;
      fill: #666;
    }
    .chart-legend {
      display: flex;
      gap: 20px;
      margin-top: 15px;
      justify-content: center;
    }
    .chart-legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .chart-legend-color {
      width: 16px;
      height: 16px;
      border-radius: 3px;
    }
    .chart-legend-color-fuel {
      background: #4CAF50;
    }
    .chart-legend-color-electricity {
      background: #2196F3;
    }
    .chart-legend-label {
      font-size: 12px;
      color: #666;
    }
    .advanced-stats-section {
      margin-top: 20px;
    }
    .advanced-stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 15px;
    }
    .advanced-stat-item {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
      text-align: center;
    }
    .advanced-stat-value {
      font-size: 18px;
      font-weight: bold;
      color: #2e7d32;
      margin-bottom: 4px;
    }
    .advanced-stat-label {
      font-size: 11px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${vehicle.name}</h1>
    <div class="subtitle">${t("export.vehicleReport")}</div>
  </div>

  <div class="section">
    <h2 class="section-title">${t("export.vehicleInfo")}</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">${t("vehicles.make")}:</span>
        <span class="info-value">${vehicle.make}</span>
      </div>
      <div class="info-item">
        <span class="info-label">${t("vehicles.model")}:</span>
        <span class="info-value">${vehicle.model}</span>
      </div>
      <div class="info-item">
        <span class="info-label">${t("vehicles.type")}:</span>
        <span class="info-value">${t(`vehicles.types.${vehicleType}`)}</span>
      </div>
      ${vehicle.vin ? `
      <div class="info-item">
        <span class="info-label">${t("vehicles.vin")}:</span>
        <span class="info-value">${vehicle.vin}</span>
      </div>
      ` : ''}
      ${vehicle.licensePlate ? `
      <div class="info-item">
        <span class="info-label">${t("vehicles.licensePlate")}:</span>
        <span class="info-value">${vehicle.licensePlate}</span>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">${t("export.statistics")}</h2>
    <div class="stats-grid">
      ${stats.avgFuelConsumption !== null && stats.avgFuelConsumption !== undefined ? `
      <div class="stat-card">
        <div class="stat-value">${formatNumber(stats.avgFuelConsumption)} l/100km</div>
        <div class="stat-label">${t("fillings.consumption")}</div>
      </div>
      ` : ''}
      ${stats.avgElectricityConsumption !== null && stats.avgElectricityConsumption !== undefined ? `
      <div class="stat-card">
        <div class="stat-value">${formatNumber(stats.avgElectricityConsumption)} kWh/100km</div>
        <div class="stat-label">${t("charging.avgConsumption")}</div>
      </div>
      ` : ''}
      ${stats.avgPricePerLiter !== null && stats.avgPricePerLiter !== undefined ? `
      <div class="stat-card">
        <div class="stat-value">${formatNumber(stats.avgPricePerLiter, 2)} €</div>
        <div class="stat-label">${t("fillings.avgPricePerLiter")}</div>
      </div>
      ` : ''}
      ${stats.avgPricePerKWh !== null && stats.avgPricePerKWh !== undefined ? `
      <div class="stat-card">
        <div class="stat-value">${formatNumber(stats.avgPricePerKWh, 2)} €</div>
        <div class="stat-label">${t("charging.avgPricePerKWh")}</div>
      </div>
      ` : ''}
      ${stats.totalFuelCost !== null && stats.totalFuelCost !== undefined ? `
      <div class="stat-card">
        <div class="stat-value">${formatNumber(stats.totalFuelCost, 2)} €</div>
        <div class="stat-label">${t("vehicles.totalFuelCost")}</div>
      </div>
      ` : ''}
      ${stats.totalChargingCost !== null && stats.totalChargingCost !== undefined ? `
      <div class="stat-card">
        <div class="stat-value">${formatNumber(stats.totalChargingCost, 2)} €</div>
        <div class="stat-label">${t("vehicles.totalChargingCost")}</div>
      </div>
      ` : ''}
    </div>
  </div>

  ${consumptionData.length >= 5 ? `
  <div class="section">
    <h2 class="section-title">${t("vehicles.consumptionOverTime")}</h2>
    <div class="chart-container">
      <div class="chart-title">${vehicleType === 'PHEV' ? t("vehicles.fuelConsumption") + ' / ' + t("vehicles.electricConsumption") : (vehicleType === 'BEV' ? t("vehicles.electricConsumption") : t("vehicles.fuelConsumption"))}</div>
      <svg class="chart-svg" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
        ${(() => {
          const padding = 60;
          const chartWidth = 800 - padding * 2;
          const chartHeight = 300 - padding * 2;
          const dataPoints = consumptionData;
          
          if (dataPoints.length === 0) return '';
          
          // Separate fuel and electricity points
          const fuelPoints = dataPoints.filter(p => p.type === 'fuel');
          const electricityPoints = dataPoints.filter(p => p.type === 'electricity');
          
          // Calculate min/max for scaling
          const allConsumptions = dataPoints.map(p => p.consumption);
          const minConsumption = Math.min(...allConsumptions);
          const maxConsumption = Math.max(...allConsumptions);
          const range = maxConsumption - minConsumption || 1;
          const paddingRange = range * 0.1;
          
          const scaleY = (value) => {
            const normalized = (value - minConsumption + paddingRange) / (range + paddingRange * 2);
            return chartHeight - (normalized * chartHeight) + padding;
          };
          
          const scaleX = (index, total) => {
            return (index / (total - 1 || 1)) * chartWidth + padding;
          };
          
          let svg = '';
          
          // Draw axes
          svg += `<line class="chart-axis" x1="${padding}" y1="${padding}" x2="${padding}" y2="${chartHeight + padding}" />`;
          svg += `<line class="chart-axis" x1="${padding}" y1="${chartHeight + padding}" x2="${chartWidth + padding}" y2="${chartHeight + padding}" />`;
          
          // Draw fuel line
          if (fuelPoints.length > 0) {
            let pathData = '';
            fuelPoints.forEach((point, idx) => {
              const x = scaleX(point.index, dataPoints.length);
              const y = scaleY(point.consumption);
              if (idx === 0) {
                pathData += `M ${x} ${y}`;
              } else {
                pathData += ` L ${x} ${y}`;
              }
            });
            svg += `<path class="chart-line chart-line-fuel" d="${pathData}" />`;
            
            // Draw fuel points
            fuelPoints.forEach(point => {
              const x = scaleX(point.index, dataPoints.length);
              const y = scaleY(point.consumption);
              svg += `<circle class="chart-point chart-point-fuel" cx="${x}" cy="${y}" />`;
            });
          }
          
          // Draw electricity line
          if (electricityPoints.length > 0) {
            let pathData = '';
            electricityPoints.forEach((point, idx) => {
              const x = scaleX(point.index, dataPoints.length);
              const y = scaleY(point.consumption);
              if (idx === 0) {
                pathData += `M ${x} ${y}`;
              } else {
                pathData += ` L ${x} ${y}`;
              }
            });
            svg += `<path class="chart-line chart-line-electricity" d="${pathData}" />`;
            
            // Draw electricity points
            electricityPoints.forEach(point => {
              const x = scaleX(point.index, dataPoints.length);
              const y = scaleY(point.consumption);
              svg += `<circle class="chart-point chart-point-electricity" cx="${x}" cy="${y}" />`;
            });
          }
          
          // Y-axis labels
          const ySteps = 5;
          for (let i = 0; i <= ySteps; i++) {
            const value = minConsumption - paddingRange + (range + paddingRange * 2) * (i / ySteps);
            const y = scaleY(value);
            svg += `<text class="chart-label" x="${padding - 10}" y="${y + 4}" text-anchor="end">${formatNumber(value, 1)}</text>`;
          }
          
          // X-axis labels (show first, middle, last)
          if (dataPoints.length > 0) {
            const indices = [0, Math.floor(dataPoints.length / 2), dataPoints.length - 1];
            indices.forEach(idx => {
              if (dataPoints[idx]) {
                const x = scaleX(idx, dataPoints.length);
                svg += `<text class="chart-label" x="${x}" y="${chartHeight + padding + 20}" text-anchor="middle">${dataPoints[idx].date}</text>`;
              }
            });
          }
          
          return svg;
        })()}
      </svg>
      <div class="chart-legend">
        ${vehicleType === 'PHEV' || vehicleType === 'ICE' || vehicleType === 'HYBRID' ? `
        <div class="chart-legend-item">
          <div class="chart-legend-color chart-legend-color-fuel"></div>
          <span class="chart-legend-label">${t("vehicles.fuelConsumption")} (l/100km)</span>
        </div>
        ` : ''}
        ${vehicleType === 'PHEV' || vehicleType === 'BEV' ? `
        <div class="chart-legend-item">
          <div class="chart-legend-color chart-legend-color-electricity"></div>
          <span class="chart-legend-label">${t("vehicles.electricConsumption")} (kWh/100km)</span>
        </div>
        ` : ''}
      </div>
    </div>
  </div>
  ` : ''}

  <div class="section advanced-stats-section">
    <h2 class="section-title">${t("vehicles.additionalStatistics")}</h2>
    <div class="advanced-stats-grid">
      ${stats.averageDistancePerFilling !== null && stats.averageDistancePerFilling !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatNumber(stats.averageDistancePerFilling)} km</div>
        <div class="advanced-stat-label">${t("vehicles.avgDistancePerFilling")}</div>
      </div>
      ` : ''}
      ${stats.longestDistanceSingleTank !== null && stats.longestDistanceSingleTank !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatNumber(stats.longestDistanceSingleTank)} km</div>
        <div class="advanced-stat-label">${t("vehicles.longestDistanceSingleTank")}</div>
      </div>
      ` : ''}
      ${stats.daysSinceLastFilling !== null && stats.daysSinceLastFilling !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${stats.daysSinceLastFilling}</div>
        <div class="advanced-stat-label">${t("vehicles.daysSinceLastFilling")}</div>
      </div>
      ` : ''}
      ${stats.averageDaysBetweenFillings !== null && stats.averageDaysBetweenFillings !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatNumber(stats.averageDaysBetweenFillings, 1)}</div>
        <div class="advanced-stat-label">${t("vehicles.avgDaysBetweenFillings")}</div>
      </div>
      ` : ''}
      ${stats.averageCostPerDayFuel !== null && stats.averageCostPerDayFuel !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatNumber(stats.averageCostPerDayFuel, 2)} €</div>
        <div class="advanced-stat-label">${t("vehicles.avgCostPerDayFuel")}</div>
      </div>
      ` : ''}
      ${stats.totalFuelDistance !== null && stats.totalFuelDistance !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatOdometer(stats.totalFuelDistance)} km</div>
        <div class="advanced-stat-label">${t("vehicles.totalDistance")}</div>
      </div>
      ` : ''}
      ${stats.averageFuelCostPer100km !== null && stats.averageFuelCostPer100km !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatNumber(stats.averageFuelCostPer100km, 2)} €</div>
        <div class="advanced-stat-label">${t("vehicles.avgCostPer100km")}</div>
      </div>
      ` : ''}
      ${stats.averageDistancePerCharging !== null && stats.averageDistancePerCharging !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatNumber(stats.averageDistancePerCharging)} km</div>
        <div class="advanced-stat-label">${t("vehicles.avgDistancePerCharging")}</div>
      </div>
      ` : ''}
      ${stats.longestDistanceSingleCharge !== null && stats.longestDistanceSingleCharge !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatNumber(stats.longestDistanceSingleCharge)} km</div>
        <div class="advanced-stat-label">${t("vehicles.longestDistanceSingleCharge")}</div>
      </div>
      ` : ''}
      ${stats.daysSinceLastCharging !== null && stats.daysSinceLastCharging !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${stats.daysSinceLastCharging}</div>
        <div class="advanced-stat-label">${t("vehicles.daysSinceLastCharging")}</div>
      </div>
      ` : ''}
      ${stats.averageDaysBetweenCharging !== null && stats.averageDaysBetweenCharging !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatNumber(stats.averageDaysBetweenCharging, 1)}</div>
        <div class="advanced-stat-label">${t("vehicles.avgDaysBetweenCharging")}</div>
      </div>
      ` : ''}
      ${stats.averageCostPerDayCharging !== null && stats.averageCostPerDayCharging !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatNumber(stats.averageCostPerDayCharging, 2)} €</div>
        <div class="advanced-stat-label">${t("vehicles.avgCostPerDayCharging")}</div>
      </div>
      ` : ''}
      ${stats.totalElectricityDistance !== null && stats.totalElectricityDistance !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatOdometer(stats.totalElectricityDistance)} km</div>
        <div class="advanced-stat-label">${t("vehicles.totalDistance")}</div>
      </div>
      ` : ''}
      ${stats.averageElectricityCostPer100km !== null && stats.averageElectricityCostPer100km !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${formatNumber(stats.averageElectricityCostPer100km, 2)} €</div>
        <div class="advanced-stat-label">${t("vehicles.avgCostPer100km")}</div>
      </div>
      ` : ''}
    </div>
  </div>
`;

  // Fillings Section
  if (fillings && fillings.length > 0) {
    const sortedFillings = [...fillings].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA;
    });

    html += `
  <div class="section">
    <h2 class="section-title">${t("fillings.title")} (${fillings.length})</h2>
    <table>
      <thead>
        <tr>
          <th>${t("common.date")}</th>
          <th>${t("fillings.odometer")}</th>
          <th>${t("fillings.liters")}</th>
          <th>${t("fillings.cost")}</th>
          <th>${t("fillings.pricePerLiter")}</th>
          <th>${t("fillings.fuelType")}</th>
        </tr>
      </thead>
      <tbody>
`;

    sortedFillings.forEach((filling) => {
      const pricePerLiter = filling.liters > 0 ? filling.cost / filling.liters : 0;
      html += `
        <tr>
          <td>${formatDate(filling.date)}</td>
          <td>${formatOdometer(filling.odometer)} km</td>
          <td>${formatNumber(filling.liters, 2)} L</td>
          <td>${formatNumber(filling.cost, 2)} €</td>
          <td>${formatNumber(pricePerLiter, 3)} €</td>
          <td>${filling.fuelType || "-"}</td>
        </tr>
`;
    });

    html += `
      </tbody>
    </table>
  </div>
`;
  }

  // Charging Sessions Section
  if (chargingSessions && chargingSessions.length > 0) {
    const sortedSessions = [...chargingSessions].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA;
    });

    html += `
  <div class="section">
    <h2 class="section-title">${t("charging.title")} (${chargingSessions.length})</h2>
    <table>
      <thead>
        <tr>
          <th>${t("common.date")}</th>
          <th>${t("fillings.odometer")}</th>
          <th>${t("charging.energyAdded")}</th>
          <th>${t("fillings.cost")}</th>
          <th>${t("charging.pricePerKWh")}</th>
          <th>${t("charging.chargingType")}</th>
        </tr>
      </thead>
      <tbody>
`;

    sortedSessions.forEach((session) => {
      const pricePerKWh = session.energyAdded > 0 ? session.cost / session.energyAdded : 0;
      html += `
        <tr>
          <td>${formatDate(session.date)}</td>
          <td>${formatOdometer(session.odometer)} km</td>
          <td>${formatNumber(session.energyAdded, 2)} kWh</td>
          <td>${formatNumber(session.cost, 2)} €</td>
          <td>${formatNumber(pricePerKWh, 3)} €</td>
          <td>${session.chargingType || "-"}</td>
        </tr>
`;
    });

    html += `
      </tbody>
    </table>
  </div>
`;
  }

  html += `
  <div class="footer">
    ${t("export.generatedOn")}: ${formatDate(new Date())}
  </div>
</body>
</html>
`;

  return html;
};

// Export vehicle data to PDF (as HTML file that can be printed to PDF)
export const exportToPDF = async (vehicle, fillings, chargingSessions, stats, t) => {
  try {
    const htmlContent = generateHTML(vehicle, fillings, chargingSessions, stats, t);
    
    // Create filename with vehicle name and current date
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${vehicle.name.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.html`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Write HTML file
    await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/html',
        dialogTitle: t("export.shareTitle"),
        UTI: 'public.html',
      });
    } else {
      throw new Error(t("export.sharingNotAvailable"));
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    return { success: false, error: error.message };
  }
};

