// utils/energyCalculations.js

/**
 * Calculate fuel consumption in l/100km
 * @param {Array} fillings - Array of fuel filling records
 * @returns {Object} - Consumption statistics
 */
export const calculateFuelConsumption = (fillings) => {
  if (fillings.length < 2) {
    return { 
      averageConsumption: null, 
      totalDistance: 0, 
      totalFuel: 0,
      consumptionData: []
    };
  }

  // Sort fillings by odometer reading (ascending)
  const sortedFillings = [...fillings].sort((a, b) => a.odometer - b.odometer);

  let totalDistance = 0;
  let totalFuel = 0;
  const consumptionData = [];

  for (let i = 1; i < sortedFillings.length; i++) {
    const currentFilling = sortedFillings[i];
    const previousFilling = sortedFillings[i - 1];
    
    const distance = currentFilling.odometer - previousFilling.odometer;
    
    // Skip invalid distances
    if (distance <= 0) continue;
    
    const fuel = currentFilling.liters;
    const consumption = (fuel / distance) * 100;
    
    // Skip unrealistic consumption values
    if (consumption < 3 || consumption > 30) continue;
    
    totalDistance += distance;
    totalFuel += fuel;
    
    consumptionData.push({
      date: currentFilling.date,
      distance,
      fuel,
      consumption,
      odometer: currentFilling.odometer
    });
  }

  const averageConsumption = totalDistance > 0 ? (totalFuel / totalDistance) * 100 : null;

  return {
    averageConsumption,
    totalDistance,
    totalFuel,
    consumptionData
  };
};

/**
 * Calculate electricity consumption in kWh/100km
 * @param {Array} chargingSessions - Array of charging session records
 * @returns {Object} - Consumption statistics
 */
export const calculateElectricityConsumption = (chargingSessions) => {
  if (chargingSessions.length < 2) {
    return { 
      averageConsumption: null, 
      totalDistance: 0, 
      totalEnergy: 0,
      consumptionData: []
    };
  }

  // Sort charging sessions by odometer reading (ascending)
  const sortedSessions = [...chargingSessions].sort((a, b) => a.odometer - b.odometer);

  let totalDistance = 0;
  let totalEnergy = 0;
  const consumptionData = [];

  for (let i = 1; i < sortedSessions.length; i++) {
    const currentSession = sortedSessions[i];
    const previousSession = sortedSessions[i - 1];
    
    const distance = currentSession.odometer - previousSession.odometer;
    
    // Skip invalid distances
    if (distance <= 0) continue;
    
    const energy = currentSession.energyAdded;
    const consumption = (energy / distance) * 100;
    
    // Skip unrealistic consumption values (1-50 kWh/100km range)
    if (consumption < 1 || consumption > 50) continue;
    
    totalDistance += distance;
    totalEnergy += energy;
    
    consumptionData.push({
      date: currentSession.date,
      distance,
      energy,
      consumption,
      odometer: currentSession.odometer
    });
  }

  const averageConsumption = totalDistance > 0 ? (totalEnergy / totalDistance) * 100 : null;

  return {
    averageConsumption,
    totalDistance,
    totalEnergy,
    consumptionData
  };
};

/**
 * Calculate combined statistics for PHEV vehicles
 * @param {Array} fillings - Array of fuel filling records
 * @param {Array} chargingSessions - Array of charging session records
 * @returns {Object} - Combined statistics
 */
export const calculateCombinedConsumption = (fillings, chargingSessions) => {
  const fuelStats = calculateFuelConsumption(fillings);
  const electricityStats = calculateElectricityConsumption(chargingSessions);

  return {
    fuel: fuelStats,
    electricity: electricityStats,
    totalEvents: fillings.length + chargingSessions.length,
    combinedDistance: fuelStats.totalDistance + electricityStats.totalDistance
  };
};

/**
 * Format consumption value for display
 * @param {number} value - Consumption value
 * @param {string} unit - Unit (l/100km or kWh/100km)
 * @returns {string} - Formatted string
 */
export const formatConsumption = (value, unit = 'l/100km') => {
  if (value === null || value === undefined) return '--';
  return `${parseFloat(value).toFixed(1).replace('.', ',')} ${unit}`;
};

/**
 * Calculate cost efficiency (cost per 100km)
 * @param {Array} events - Array of filling/charging records
 * @returns {Object} - Cost efficiency statistics
 */
export const calculateCostEfficiency = (events) => {
  if (events.length < 2) {
    return { averageCostPer100km: null, totalCost: 0, totalDistance: 0 };
  }

  const sortedEvents = [...events].sort((a, b) => a.odometer - b.odometer);

  let totalDistance = 0;
  let totalCost = 0;

  for (let i = 1; i < sortedEvents.length; i++) {
    const distance = sortedEvents[i].odometer - sortedEvents[i - 1].odometer;
    
    if (distance <= 0) continue;
    
    totalDistance += distance;
    totalCost += sortedEvents[i].cost;
  }

  const averageCostPer100km = totalDistance > 0 ? (totalCost / totalDistance) * 100 : null;

  return {
    averageCostPer100km,
    totalCost,
    totalDistance
  };
}; 