export interface BatteryProfile {
  capacityKwh: number;
  chemistry: "LFP" | "NMC" | "NCA";
  maxChargingSpeedKw: number;
  currentSoC: number; // 0 to 100
  stateOfHealth: number; // 0 to 100 (percentage)
  nominalTemperatureC: number;
  degradationRatePercentPerYear: number;
  optimalChargingHabits: string[];
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  battery: BatteryProfile;
  connectorType: "CCS1" | "CCS2" | "NACS" | "CHAdeMO";
  currentRangeMiles: number;
  maxRangeMiles: number;
  averageConsumptionWhPerMile: number;
}

export interface ChargingOperator {
  id: string;
  name: string;
  logoUrl?: string;
  networkRating: number; // 0.0 to 5.0
  activeChargersCount: number;
}

export interface PricingModel {
  baseRatePerKwh: number;
  peakRatePerKwh: number;
  peakHoursStart: string; // e.g. "16:00"
  peakHoursEnd: string; // e.g. "20:00"
  idleFeePerMinute: number;
  subscriptionDiscountPercent?: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  operator: ChargingOperator;
  latitude: number;
  longitude: number;
  address: string;
  availablePorts: number;
  totalPorts: number;
  pricing: PricingModel;
  maxSpeedKw: number;
  reliabilityScore: number; // 0 to 100
  safetyScore: number; // 0 to 100
  amenities: string[]; // e.g. ["WiFi", "Coffee", "Restrooms"]
  estimatedQueueMinutes: number;
  confidenceScore: number; // 0 to 100 (percentage accuracy of predictions)
}

export interface QueuePrediction {
  stationId: string;
  timestamp: string;
  predictedWaitMinutes: number;
  confidenceInterval: [number, number]; // [min, max]
  demandFactor: number; // multiplier, e.g. 1.2 for peak demand
}

export interface FailurePrediction {
  stationId: string;
  portId: string;
  probabilityOfFailure: number; // 0 to 1
  predictedDowntimeHours: number;
  failureMode: "CoolingLoopFault" | "ConnectorWear" | "CommunicationTimeout" | "GridOverload";
  recommendedMaintenanceWindow: string; // ISO date
}

export interface PredictionResult {
  chargerReliability: number; // 0 to 100
  estimatedQueueTimeMinutes: number;
  expectedChargingSpeedKw: number;
  confidenceScore: number; // 0 to 100
  queuePredictions: QueuePrediction[];
  failurePrediction?: FailurePrediction;
}

export interface ChargingSession {
  id: string;
  vehicleId: string;
  stationId: string;
  portId: string;
  startSoC: number;
  endSoC?: number;
  energyDeliveredKwh: number;
  startTime: string;
  endTime?: string;
  cost: number;
  peakDrawKw: number;
  averageDrawKw: number;
}

export interface RoutePlan {
  id: string;
  origin: string;
  destination: string;
  totalDistanceMiles: number;
  estimatedTravelTimeMinutes: number;
  startingSoC: number;
  predictedArrivalSoC: number;
  recommendedStops: {
    station: ChargingStation;
    arrivalSoC: number;
    targetSoC: number;
    chargingDurationMinutes: number;
  }[];
}

export interface FleetVehicle extends Vehicle {
  fleetId: string;
  currentTask?: string;
  driverName?: string;
  assignedRouteId?: string;
}

export interface FleetRoute {
  id: string;
  fleetId: string;
  assignedVehicleId: string;
  route: RoutePlan;
  departureTime: string;
  arrivalTimeEstimated: string;
  optimizedChargingCost: number;
}

export interface InfrastructureAnalytics {
  utilizationRatePercent: number;
  revenueGeneratedToday: number;
  activeQueuesCount: number;
  predictedDowntimeRiskPercent: number;
  demandHeatmapCoords: { lat: number; lng: number; intensity: number }[];
}
