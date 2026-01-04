// config/constants.js

/**
 * Simülasyonun "bugün" tarihi
 * Python kodundaki sabit değerle aynı
 */
const SIMULATION_END_DATE = new Date('2025-01-18');

/**
 * Varsayılan analiz periyotları (gün cinsinden)
 */
const DEFAULT_PERIODS = {
    KPI: 30,
    TREND: 12 * 30, // 12 ay
    PREDICTION: 90
};

/**
 * Anomali şiddet seviyeleri
 */
const ANOMALY_SEVERITY = {
    CRITICAL: 'CRITICAL',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW'
};

/**
 * Servis performans skoru ağırlıkları
 */
const PERFORMANCE_WEIGHTS = {
    CUSTOMER_RATING: 0.40,  // %40
    SUCCESS_RATE: 0.40,     // %40
    VOLUME: 0.20            // %20
};

/**
 * Tahmin artış oranları (çeyrek bazlı)
 */
const PREDICTION_GROWTH_RATES = {
    Q1: 1.05,  // %5 artış
    Q2: 1.10,  // %10 artış
    Q3: 1.15,  // %15 artış
    Q4: 1.20   // %20 artış
};

/**
 * Varsayılan limit değerleri
 */
const DEFAULT_LIMITS = {
    ANOMALIES: 20,
    TOP_SERVICES: 5,
    TOP_PREDICTIONS: 15
};

module.exports = {
    SIMULATION_END_DATE,
    DEFAULT_PERIODS,
    ANOMALY_SEVERITY,
    PERFORMANCE_WEIGHTS,
    PREDICTION_GROWTH_RATES,
    DEFAULT_LIMITS
};