// services/iphoneService.js
const IphoneModel = require('../models/iphoneModel');
const { subDays, formatDateSQL, calculateChange } = require('../utils/dateHelpers');
const { SIMULATION_END_DATE } = require('../config/constants');

const IphoneService = {

    // ========================================
    // KPI İŞ MANTIĞI
    // ========================================
    getKPIData: async (period = 30) => {
        // Tarih aralıklarını hesapla
        const endDate = SIMULATION_END_DATE;
        const startDate = subDays(endDate, period);
        const prevEnd = subDays(startDate, 1);
        const prevStart = subDays(prevEnd, period);

        const d_end = formatDateSQL(endDate);
        const d_start = formatDateSQL(startDate);
        const d_prev_end = formatDateSQL(prevEnd);
        const d_prev_start = formatDateSQL(prevStart);

        // Paralel sorguları çalıştır
        const [
            currRepairs, prevRepairs,
            currRating, prevRating,
            currCritical, prevCritical,
            avgCost
        ] = await Promise.all([
            IphoneModel.getRepairCount(d_start, d_end),
            IphoneModel.getRepairCount(d_prev_start, d_prev_end),
            IphoneModel.getAvgRating(d_start, d_end),
            IphoneModel.getAvgRating(d_prev_start, d_prev_end),
            IphoneModel.getCriticalAnomalies(d_start, d_end),
            IphoneModel.getCriticalAnomalies(d_prev_start, d_prev_end),
            IphoneModel.getAvgCost(d_start, d_end)
        ]);

        // Verileri işle ve formatla
        return {
            total_repairs: { 
                value: currRepairs, 
                change: calculateChange(prevRepairs, currRepairs) 
            },
            customer_satisfaction: { 
                value: parseFloat(currRating).toFixed(2), 
                change: parseFloat((currRating - prevRating).toFixed(2)) 
            },
            critical_anomalies: { 
                value: currCritical, 
                change: currCritical - prevCritical 
            },
            avg_cost: { 
                value: Math.round(avgCost) 
            }
        };
    },

    // ========================================
    // AYLIK TREND İŞ MANTIĞI
    // ========================================
    getMonthlyTrendData: async (months = 12) => {
        const startDate = subDays(SIMULATION_END_DATE, months * 30);
        const d_start = formatDateSQL(startDate);

        // Toplam trendi al
        const totalResults = await IphoneModel.getMonthlyTrendTotal(d_start);
        
        // En popüler 3 modeli bul
        const topModels = await IphoneModel.getTop3Models(d_start);
        
        // Bu 3 modelin detaylı trendini al
        const breakdown = await IphoneModel.getModelBreakdown(d_start, topModels);

        return {
            total: totalResults,
            by_model: breakdown
        };
    },

    // ========================================
    // ANOMALİ İŞ MANTIĞI
    // ========================================
    getAnomalyData: async (severity = null, limit = 20) => {
        const data = await IphoneModel.getAnomalies(severity, limit);
        
        return {
            anomalies: data,
            total_count: data.length,
            severity_filter: severity || 'all'
        };
    },

    // ========================================
    // SERVİS PERFORMANS SKORLAMA ALGORİTMASI
    // ========================================
    calculateServicePerformance: async (period = 30) => {
        const d_end = formatDateSQL(SIMULATION_END_DATE);
        const d_start = formatDateSQL(subDays(SIMULATION_END_DATE, period));

        // Ham veriyi modelden al
        const results = await IphoneModel.getServiceStats(d_start, d_end);

        // Normalizasyon için en yüksek hacmi bul
        let maxVolume = 1;
        if (results.length > 0) {
            maxVolume = Math.max(...results.map(item => item.repair_count));
        }

        // Her servis için performans skoru hesapla
        results.forEach(item => {
            // A. Müşteri Puanı (5 üzerinden -> 100'lük, Ağırlık %40)
            const ratingBase = parseFloat(item.avg_rating) * 20; 
            const weightedRating = ratingBase * 0.40;
            
            // B. Başarı Oranı (Ağırlık %40)
            const weightedSuccess = parseFloat(item.success_rate) * 0.40;
            
            // C. İşlem Hacmi (Normalize edilmiş, Ağırlık %20)
            const volumeScore = (item.repair_count / maxVolume) * 100;
            const weightedVolume = volumeScore * 0.20;

            // TOPLAM PERFORMANS SKORU
            item.performance_score = parseFloat(
                (weightedRating + weightedSuccess + weightedVolume).toFixed(1)
            );
        });

        // Puanı yüksek olandan düşük olana sırala
        results.sort((a, b) => b.performance_score - a.performance_score);

        return results.slice(0, 5); // İlk 5 servis
    },

    // ========================================
    // TAHMİN ALGORİTMASI (ÇEYREKLİK PROJEKSIYYON)
    // ========================================
    calculatePredictions: async () => {
        // Son 3 ayın (90 gün) verisini baz al
        const d_start = formatDateSQL(subDays(SIMULATION_END_DATE, 90));
        
        // Modelden ortalama verileri al
        const results = await IphoneModel.getPredictionData(d_start);

        // Her parça için gelecek yılın çeyreklerini hesapla
        results.forEach(item => {
            const baseAvg = parseFloat(item.avg_monthly_repairs);
            const baseQuarter = baseAvg * 3; // 3 aylık baz değer

            // Çeyrek bazlı artış senaryosu
            item.ceyrek_1 = Math.round(baseQuarter * 1.05); // %5 artış
            item.ceyrek_2 = Math.round(baseQuarter * 1.10); // %10 artış
            item.ceyrek_3 = Math.round(baseQuarter * 1.15); // %15 artış
            item.ceyrek_4 = Math.round(baseQuarter * 1.20); // %20 artış
            
            item.yillik = item.ceyrek_1 + item.ceyrek_2 + item.ceyrek_3 + item.ceyrek_4;
        });

        return {
            method: 'quarterly_trend_projection',
            base_period: '90_days',
            predictions: results
        };
    }
};

module.exports = IphoneService;