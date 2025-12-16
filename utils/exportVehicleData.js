// utils/exportVehicleData.js
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getCurrentLanguage } from './i18n';
import { defaultUserProfile, getUserProfile } from './userProfile';

// Month names in English
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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

  const currentLanguage = getCurrentLanguage() || 'en';
  
  // Format based on language
  if (currentLanguage === 'en') {
    // English format: "29 November 2025"
    const day = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  } else {
    // Slovenian format: "dd. mm. yyyy"
    return `${dateObj.getDate().toString().padStart(2, "0")}. ${(
      dateObj.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}. ${dateObj.getFullYear()}`;
  }
};

// Helper function to format numbers consistently (for HTML/display - uses comma as decimal separator)
const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined) return "0";
  return parseFloat(value).toFixed(decimals).replace(".", ",");
};

// Helper function to format numbers for CSV (uses period as decimal separator to avoid column splitting)
const formatNumberForCSV = (value, decimals = 1) => {
  if (value === null || value === undefined) return "0";
  return parseFloat(value).toFixed(decimals);
};

// Helper function to format odometer readings
const formatOdometer = (value) => {
  if (value === null || value === undefined) return "0";
  return Math.round(parseFloat(value)).toLocaleString('de-DE');
};

// Unit and currency helpers
const getCurrencySymbol = (currencyCode) => {
  switch (currencyCode) {
    case 'USD':
      return '$';
    case 'EUR':
    default:
      return '€';
  }
};

const convertFuelConsumption = (value, unitSystem) => {
  if (value === null || value === undefined) return value;
  if (unitSystem === 'imperial') {
    return 235.214583 / value; // L/100km -> MPG
  }
  return value;
};

const convertElectricConsumption = (value, unitSystem) => {
  if (value === null || value === undefined) return value;
  if (unitSystem === 'imperial') {
    return value * 1.60934; // kWh/100km -> kWh/100mi
  }
  return value;
};

const convertFuelPricePerUnit = (value, unitSystem) => {
  if (value === null || value === undefined) return value;
  if (unitSystem === 'imperial') {
    return value * 3.78541; // per liter -> per gallon
  }
  return value;
};

// Generate CSV content for vehicle data
const generateCSV = (vehicle, fillings, chargingSessions, stats, t, settings) => {
  const unitSystem = settings?.unitSystem || defaultUserProfile.unitSystem;
  const currencyCode = settings?.currency || defaultUserProfile.currency;
  const currencySymbol = getCurrencySymbol(currencyCode);
  // Use formatNumberForCSV for all CSV exports to avoid comma decimal separator issues
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
    const converted = convertFuelConsumption(stats.avgFuelConsumption, unitSystem);
    const unit = unitSystem === 'imperial' ? 'MPG' : 'l / 100km';
    csv += `${t("fillings.consumption")},${formatNumberForCSV(converted)} ${unit}\n`;
  }
  
  if (stats.avgElectricityConsumption !== null && stats.avgElectricityConsumption !== undefined) {
    const converted = convertElectricConsumption(stats.avgElectricityConsumption, unitSystem);
    const unit = unitSystem === 'imperial' ? 'kWh / 100mi' : 'kWh / 100km';
    csv += `${t("charging.avgConsumption")},${formatNumberForCSV(converted)} ${unit}\n`;
  }
  
  if (stats.avgPricePerLiter !== null && stats.avgPricePerLiter !== undefined) {
    const converted = convertFuelPricePerUnit(stats.avgPricePerLiter, unitSystem);
    const unit = unitSystem === 'imperial' ? 'per gal' : 'per L';
    csv += `${t("fillings.avgPricePerLiter")},${formatNumberForCSV(converted, 2)} ${currencySymbol} ${unit}\n`;
  }
  
  if (stats.avgPricePerKWh !== null && stats.avgPricePerKWh !== undefined) {
    csv += `${t("charging.avgPricePerKWh")},${formatNumberForCSV(stats.avgPricePerKWh, 2)} ${currencySymbol} / kWh\n`;
  }
  
  if (stats.totalFuelCost !== null && stats.totalFuelCost !== undefined) {
    csv += `${t("vehicles.totalFuelCost")},${formatNumberForCSV(stats.totalFuelCost, 2)} ${currencySymbol}\n`;
  }
  
  if (stats.totalChargingCost !== null && stats.totalChargingCost !== undefined) {
    csv += `${t("vehicles.totalChargingCost")},${formatNumberForCSV(stats.totalChargingCost, 2)} ${currencySymbol}\n`;
  }
  
  csv += `\n`;

  // Additional Statistics Section
  csv += `${t("vehicles.additionalStatistics")}\n`;
  
  // Fuel additional statistics
  if (stats.averageDistancePerFilling !== null && stats.averageDistancePerFilling !== undefined) {
    csv += `${t("vehicles.avgDistancePerFilling")},${formatNumberForCSV(stats.averageDistancePerFilling)} km\n`;
  }
  
  if (stats.longestDistanceSingleTank !== null && stats.longestDistanceSingleTank !== undefined) {
    csv += `${t("vehicles.longestDistanceSingleTank")},${formatNumberForCSV(stats.longestDistanceSingleTank)} km\n`;
  }
  
  if (stats.daysSinceLastFilling !== null && stats.daysSinceLastFilling !== undefined) {
    csv += `${t("vehicles.daysSinceLastFilling")},${stats.daysSinceLastFilling}\n`;
  }
  
  if (stats.averageDaysBetweenFillings !== null && stats.averageDaysBetweenFillings !== undefined) {
    csv += `${t("vehicles.avgDaysBetweenFillings")},${formatNumberForCSV(stats.averageDaysBetweenFillings, 1)}\n`;
  }
  
  if (stats.averageCostPerDayFuel !== null && stats.averageCostPerDayFuel !== undefined) {
    csv += `${t("vehicles.avgCostPerDayFuel")},${formatNumberForCSV(stats.averageCostPerDayFuel, 2)} ${currencySymbol}\n`;
  }
  
  if (stats.totalFuelDistance !== null && stats.totalFuelDistance !== undefined) {
    csv += `${t("vehicles.totalDistance")},${formatOdometer(stats.totalFuelDistance)} km\n`;
  }
  
  if (stats.averageFuelCostPer100km !== null && stats.averageFuelCostPer100km !== undefined) {
    const value =
      unitSystem === 'imperial'
        ? stats.averageFuelCostPer100km / 0.621371 // per 100mi
        : stats.averageFuelCostPer100km; // per 100km
    const unit = unitSystem === 'imperial' ? '100 mi' : '100 km';
    csv += `${t("vehicles.avgCostPer100km")},${formatNumberForCSV(value, 2)} ${currencySymbol} / ${unit}\n`;
  }
  
  // Charging additional statistics
  if (stats.averageDistancePerCharging !== null && stats.averageDistancePerCharging !== undefined) {
    csv += `${t("vehicles.avgDistancePerCharging")},${formatNumberForCSV(stats.averageDistancePerCharging)} km\n`;
  }
  
  if (stats.longestDistanceSingleCharge !== null && stats.longestDistanceSingleCharge !== undefined) {
    csv += `${t("vehicles.longestDistanceSingleCharge")},${formatNumberForCSV(stats.longestDistanceSingleCharge)} km\n`;
  }
  
  if (stats.daysSinceLastCharging !== null && stats.daysSinceLastCharging !== undefined) {
    csv += `${t("vehicles.daysSinceLastCharging")},${stats.daysSinceLastCharging}\n`;
  }
  
  if (stats.averageDaysBetweenCharging !== null && stats.averageDaysBetweenCharging !== undefined) {
    csv += `${t("vehicles.avgDaysBetweenCharging")},${formatNumberForCSV(stats.averageDaysBetweenCharging, 1)}\n`;
  }
  
  if (stats.averageCostPerDayCharging !== null && stats.averageCostPerDayCharging !== undefined) {
    csv += `${t("vehicles.avgCostPerDayCharging")},${formatNumberForCSV(stats.averageCostPerDayCharging, 2)} ${currencySymbol}\n`;
  }
  
  if (stats.totalElectricityDistance !== null && stats.totalElectricityDistance !== undefined) {
    csv += `${t("vehicles.totalDistance")},${formatOdometer(stats.totalElectricityDistance)} km\n`;
  }
  
  if (stats.averageElectricityCostPer100km !== null && stats.averageElectricityCostPer100km !== undefined) {
    const value =
      unitSystem === 'imperial'
        ? stats.averageElectricityCostPer100km / 0.621371 // per 100mi
        : stats.averageElectricityCostPer100km; // per 100km
    const unit = unitSystem === 'imperial' ? '100 mi' : '100 km';
    csv += `${t("vehicles.avgCostPer100km")},${formatNumberForCSV(value, 2)} ${currencySymbol} / ${unit}\n`;
  }
  
  csv += `\n`;

  // Fillings Section (if available)
  if (fillings && fillings.length > 0) {
    csv += `${t("fillings.nav")}\n`;
    const distanceHeaderUnit = unitSystem === 'imperial' ? 'mi' : 'km';
    const volumeHeaderUnit = unitSystem === 'imperial' ? 'gal' : 'L';
    const priceUnitLabel = unitSystem === 'imperial' ? `${currencySymbol} / gal` : `${currencySymbol} / L`;
    csv += `${t("common.date")},${t("fillings.odometer")} (${distanceHeaderUnit}),${t("fillings.liters")} (${volumeHeaderUnit}),${t("fillings.cost")} (${currencySymbol}),${t("fillings.pricePerLiter")} (${priceUnitLabel})\n`;
    
    const sortedFillings = [...fillings].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA;
    });

    sortedFillings.forEach((filling) => {
      const distance = filling.odometer;
      const distanceValue = unitSystem === 'imperial' ? distance * 0.621371 : distance;
      const volume = filling.liters;
      const volumeValue = unitSystem === 'imperial' ? volume / 3.78541 : volume;
      const pricePerUnit = volume > 0 ? filling.cost / volume : 0;
      const convertedPricePerUnit = convertFuelPricePerUnit(pricePerUnit, unitSystem);
      csv += `${formatDate(filling.date)},${formatOdometer(distanceValue)},${formatNumberForCSV(volumeValue, 2)},${formatNumberForCSV(filling.cost, 2)},${formatNumberForCSV(convertedPricePerUnit, 3)}\n`;
    });
    
    csv += `\n`;
  }

  // Charging Sessions Section (if available)
  if (chargingSessions && chargingSessions.length > 0) {
    csv += `${t("charging.nav")}\n`;
    const distanceHeaderUnit2 = unitSystem === 'imperial' ? 'mi' : 'km';
    csv += `${t("common.date")},${t("fillings.odometer")} (${distanceHeaderUnit2}),${t("charging.energyAdded")} (kWh),${t("fillings.cost")} (${currencySymbol}),${t("charging.pricePerKWh")} (${currencySymbol} / kWh)\n`;
    
    const sortedSessions = [...chargingSessions].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA;
    });

    sortedSessions.forEach((session) => {
      const distance = session.odometer;
      const distanceValue = unitSystem === 'imperial' ? distance * 0.621371 : distance;
      const pricePerKWh = session.energyAdded > 0 ? session.cost / session.energyAdded : 0;
      csv += `${formatDate(session.date)},${formatOdometer(distanceValue)},${formatNumberForCSV(session.energyAdded, 2)},${formatNumberForCSV(session.cost, 2)},${formatNumberForCSV(pricePerKWh, 3)}\n`;
    });
    
    csv += `\n`;
  }

  csv += `${t("export.generatedOn")}: ${formatDate(new Date())}\n`;
  
  return csv;
};

// Export vehicle data to CSV file
export const exportToCSV = async (vehicle, fillings, chargingSessions, stats, t) => {
  try {
    let settings = defaultUserProfile;
    try {
      settings = await getUserProfile();
    } catch (e) {
      settings = defaultUserProfile;
    }

    const csvContent = generateCSV(vehicle, fillings, chargingSessions, stats, t, settings);
    
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
const calculateConsumptionData = (fillings, chargingSessions, unitSystem) => {
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
      const base = (current.liters / distance) * 100;
      consumption = convertFuelConsumption(base, unitSystem);
      isValid = consumption >= 3 && consumption <= 30;
    } else if (current.entryType === 'electricity' && current.energyAdded) {
      const base = (current.energyAdded / distance) * 100;
      consumption = convertElectricConsumption(base, unitSystem);
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
const generateHTML = (vehicle, fillings, chargingSessions, stats, t, settings) => {
  const unitSystem = settings?.unitSystem || defaultUserProfile.unitSystem;
  const currencyCode = settings?.currency || defaultUserProfile.currency;
  const currencySymbol = getCurrencySymbol(currencyCode);
  const vehicleType = vehicle.vehicleType || 'ICE';
  
  // Calculate consumption data for graph (respect unit system)
  const consumptionData = calculateConsumptionData(fillings, chargingSessions, unitSystem);
  
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
        <div class="stat-value">${
          (() => {
            const converted = convertFuelConsumption(stats.avgFuelConsumption, unitSystem);
            const unit = unitSystem === 'imperial' ? 'MPG' : 'l / 100km';
            return `${formatNumber(converted)} ${unit}`;
          })()
        }</div>
        <div class="stat-label">${t("fillings.consumption")}</div>
      </div>
      ` : ''}
      ${stats.avgElectricityConsumption !== null && stats.avgElectricityConsumption !== undefined ? `
      <div class="stat-card">
        <div class="stat-value">${
          (() => {
            const converted = convertElectricConsumption(stats.avgElectricityConsumption, unitSystem);
            const unit = unitSystem === 'imperial' ? 'kWh / 100mi' : 'kWh / 100km';
            return `${formatNumber(converted)} ${unit}`;
          })()
        }</div>
        <div class="stat-label">${t("charging.avgConsumption")}</div>
      </div>
      ` : ''}
      ${stats.avgPricePerLiter !== null && stats.avgPricePerLiter !== undefined ? `
      <div class="stat-card">
        <div class="stat-value">${
          (() => {
            const converted = convertFuelPricePerUnit(stats.avgPricePerLiter, unitSystem);
            const unit = unitSystem === 'imperial' ? 'per gal' : 'per L';
            return `${formatNumber(converted, 2)} ${currencySymbol} ${unit}`;
          })()
        }</div>
        <div class="stat-label">${t("fillings.avgPricePerLiter")}</div>
      </div>
      ` : ''}
      ${stats.avgPricePerKWh !== null && stats.avgPricePerKWh !== undefined ? `
      <div class="stat-card">
        <div class="stat-value">${formatNumber(stats.avgPricePerKWh, 2)} ${currencySymbol} / kWh</div>
        <div class="stat-label">${t("charging.avgPricePerKWh")}</div>
      </div>
      ` : ''}
      ${stats.totalFuelCost !== null && stats.totalFuelCost !== undefined ? `
      <div class="stat-card">
        <div class="stat-value">${formatNumber(stats.totalFuelCost, 2)} ${currencySymbol}</div>
        <div class="stat-label">${t("vehicles.totalFuelCost")}</div>
      </div>
      ` : ''}
      ${stats.totalChargingCost !== null && stats.totalChargingCost !== undefined ? `
      <div class="stat-card">
        <div class="stat-value">${formatNumber(stats.totalChargingCost, 2)} ${currencySymbol}</div>
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
          <span class="chart-legend-label">${t("vehicles.fuelConsumption")} ${unitSystem === 'imperial' ? '(MPG)' : '(l / 100km)'}</span>
        </div>
        ` : ''}
        ${vehicleType === 'PHEV' || vehicleType === 'BEV' ? `
        <div class="chart-legend-item">
          <div class="chart-legend-color chart-legend-color-electricity"></div>
          <span class="chart-legend-label">${t("vehicles.electricConsumption")} ${unitSystem === 'imperial' ? '(kWh / 100mi)' : '(kWh / 100km)'}</span>
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
        <div class="advanced-stat-value">${
          (() => {
            const value = unitSystem === 'imperial' ? stats.averageDistancePerFilling * 0.621371 : stats.averageDistancePerFilling;
            const unit = unitSystem === 'imperial' ? 'mi' : 'km';
            return `${formatNumber(value)} ${unit}`;
          })()
        }</div>
        <div class="advanced-stat-label">${t("vehicles.avgDistancePerFilling")}</div>
      </div>
      ` : ''}
      ${stats.longestDistanceSingleTank !== null && stats.longestDistanceSingleTank !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${
          (() => {
            const value = unitSystem === 'imperial' ? stats.longestDistanceSingleTank * 0.621371 : stats.longestDistanceSingleTank;
            const unit = unitSystem === 'imperial' ? 'mi' : 'km';
            return `${formatNumber(value)} ${unit}`;
          })()
        }</div>
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
        <div class="advanced-stat-value">${formatNumber(stats.averageCostPerDayFuel, 2)} ${currencySymbol}</div>
        <div class="advanced-stat-label">${t("vehicles.avgCostPerDayFuel")}</div>
      </div>
      ` : ''}
      ${stats.totalFuelDistance !== null && stats.totalFuelDistance !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${
          (() => {
            const value = unitSystem === 'imperial' ? stats.totalFuelDistance * 0.621371 : stats.totalFuelDistance;
            const unit = unitSystem === 'imperial' ? 'mi' : 'km';
            return `${formatOdometer(value)} ${unit}`;
          })()
        }</div>
        <div class="advanced-stat-label">${t("vehicles.totalDistance")}</div>
      </div>
      ` : ''}
      ${stats.averageFuelCostPer100km !== null && stats.averageFuelCostPer100km !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${
          (() => {
            const value =
              unitSystem === 'imperial'
                ? stats.averageFuelCostPer100km / 0.621371
                : stats.averageFuelCostPer100km;
            const unit = unitSystem === 'imperial' ? '100 mi' : '100 km';
            return `${formatNumber(value, 2)} ${currencySymbol} / ${unit}`;
          })()
        }</div>
        <div class="advanced-stat-label">${t("vehicles.avgCostPer100km")}</div>
      </div>
      ` : ''}
      ${stats.averageDistancePerCharging !== null && stats.averageDistancePerCharging !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${
          (() => {
            const value = unitSystem === 'imperial' ? stats.averageDistancePerCharging * 0.621371 : stats.averageDistancePerCharging;
            const unit = unitSystem === 'imperial' ? 'mi' : 'km';
            return `${formatNumber(value)} ${unit}`;
          })()
        }</div>
        <div class="advanced-stat-label">${t("vehicles.avgDistancePerCharging")}</div>
      </div>
      ` : ''}
      ${stats.longestDistanceSingleCharge !== null && stats.longestDistanceSingleCharge !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${
          (() => {
            const value = unitSystem === 'imperial' ? stats.longestDistanceSingleCharge * 0.621371 : stats.longestDistanceSingleCharge;
            const unit = unitSystem === 'imperial' ? 'mi' : 'km';
            return `${formatNumber(value)} ${unit}`;
          })()
        }</div>
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
        <div class="advanced-stat-value">${formatNumber(stats.averageCostPerDayCharging, 2)} ${currencySymbol}</div>
        <div class="advanced-stat-label">${t("vehicles.avgCostPerDayCharging")}</div>
      </div>
      ` : ''}
      ${stats.totalElectricityDistance !== null && stats.totalElectricityDistance !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${
          (() => {
            const value = unitSystem === 'imperial' ? stats.totalElectricityDistance * 0.621371 : stats.totalElectricityDistance;
            const unit = unitSystem === 'imperial' ? 'mi' : 'km';
            return `${formatOdometer(value)} ${unit}`;
          })()
        }</div>
        <div class="advanced-stat-label">${t("vehicles.totalDistance")}</div>
      </div>
      ` : ''}
      ${stats.averageElectricityCostPer100km !== null && stats.averageElectricityCostPer100km !== undefined ? `
      <div class="advanced-stat-item">
        <div class="advanced-stat-value">${
          (() => {
            const value =
              unitSystem === 'imperial'
                ? stats.averageElectricityCostPer100km / 0.621371
                : stats.averageElectricityCostPer100km;
            const unit = unitSystem === 'imperial' ? '100 mi' : '100 km';
            return `${formatNumber(value, 2)} ${currencySymbol} / ${unit}`;
          })()
        }</div>
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
          <th>${t("fillings.odometer")} (${unitSystem === 'imperial' ? 'mi' : 'km'})</th>
          <th>${t("fillings.liters")} (${unitSystem === 'imperial' ? 'gal' : 'L'})</th>
          <th>${t("fillings.cost")} (${currencySymbol})</th>
          <th>${t("fillings.pricePerLiter")} (${unitSystem === 'imperial' ? `${currencySymbol} / gal` : `${currencySymbol} / L`})</th>
        </tr>
      </thead>
      <tbody>
`;

    sortedFillings.forEach((filling) => {
      const distance = filling.odometer;
      const distanceValue = unitSystem === 'imperial' ? distance * 0.621371 : distance;
      const volume = filling.liters;
      const volumeValue = unitSystem === 'imperial' ? volume / 3.78541 : volume;
      const pricePerLiter = volume > 0 ? filling.cost / volume : 0;
      const convertedPricePerUnit = convertFuelPricePerUnit(pricePerLiter, unitSystem);
      html += `
        <tr>
          <td>${formatDate(filling.date)}</td>
          <td>${formatOdometer(distanceValue)} ${unitSystem === 'imperial' ? 'mi' : 'km'}</td>
          <td>${formatNumber(volumeValue, 2)} ${unitSystem === 'imperial' ? 'gal' : 'L'}</td>
          <td>${formatNumber(filling.cost, 2)} ${currencySymbol}</td>
          <td>${formatNumber(convertedPricePerUnit, 3)} ${currencySymbol}</td>
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
          <th>${t("fillings.odometer")} (${unitSystem === 'imperial' ? 'mi' : 'km'})</th>
          <th>${t("charging.energyAdded")}</th>
          <th>${t("fillings.cost")} (${currencySymbol})</th>
          <th>${t("charging.pricePerKWh")} (${currencySymbol} / kWh)</th>
        </tr>
      </thead>
      <tbody>
`;

    sortedSessions.forEach((session) => {
      const distance = session.odometer;
      const distanceValue = unitSystem === 'imperial' ? distance * 0.621371 : distance;
      const pricePerKWh = session.energyAdded > 0 ? session.cost / session.energyAdded : 0;
      html += `
        <tr>
          <td>${formatDate(session.date)}</td>
          <td>${formatOdometer(distanceValue)} ${unitSystem === 'imperial' ? 'mi' : 'km'}</td>
          <td>${formatNumber(session.energyAdded, 2)} kWh</td>
          <td>${formatNumber(session.cost, 2)} ${currencySymbol}</td>
          <td>${formatNumber(pricePerKWh, 3)} ${currencySymbol}</td>
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
    let settings = defaultUserProfile;
    try {
      settings = await getUserProfile();
    } catch (e) {
      settings = defaultUserProfile;
    }

    const htmlContent = generateHTML(vehicle, fillings, chargingSessions, stats, t, settings);
    
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

