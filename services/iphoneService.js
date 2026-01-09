const IphoneModel = require('../models/iphoneModel');
const { getToday, subDays, formatDateSQL, calculateChange } = require('../utils/dateHelpers');

const IphoneService = {
    // GET /api/kpi -> controller.kpi
    getKPIData: async (period) => {
        const endDate = getToday();
        const startDate = subDays(endDate, period);
        const prevEnd = subDays(startDate, 1);
        const prevStart = subDays(prevEnd, period);

        const [currRepairs, prevRepairs, currRating, prevRating, currCritical, prevCritical, avgCost] = await Promise.all([
            IphoneModel.getRepairCount(formatDateSQL(startDate), formatDateSQL(endDate)),
            IphoneModel.getRepairCount(formatDateSQL(prevStart), formatDateSQL(prevEnd)),
            IphoneModel.getAvgRating(formatDateSQL(startDate), formatDateSQL(endDate)),
            IphoneModel.getAvgRating(formatDateSQL(prevStart), formatDateSQL(prevEnd)),
            IphoneModel.getCriticalAnomalies(formatDateSQL(startDate), formatDateSQL(endDate)),
            IphoneModel.getCriticalAnomalies(formatDateSQL(prevStart), formatDateSQL(prevEnd)),
            IphoneModel.getAvgCost(formatDateSQL(startDate), formatDateSQL(endDate))
        ]);

        return {
            total_repairs: { value: currRepairs, change: calculateChange(prevRepairs, currRepairs) },
            customer_satisfaction: { value: parseFloat(currRating).toFixed(2), change: parseFloat((currRating - prevRating).toFixed(2)) },
            critical_anomalies: { value: currCritical, change: currCritical - prevCritical },
            avg_cost: { value: Math.round(avgCost) }
        };
    },

    // GET /api/monthly-trend -> controller.monthlyTrend
    getMonthlyTrendData: async (months) => {
        const d_start = formatDateSQL(subDays(getToday(), months * 30));
        const total = await IphoneModel.getMonthlyTrendTotal(d_start);
        return { total };
    },

    // GET /api/anomalies -> controller.anomalies (Hata buradaydı, isim düzeltildi)
    getAnomalyData: async (severity, limit) => {
        const anomalies = await IphoneModel.getAnomalies(severity, limit);
        return { anomalies };
    },

    // GET /api/services -> controller.services
    calculateServicePerformance: async (period) => {
        const d_end = formatDateSQL(getToday());
        const d_start = formatDateSQL(subDays(getToday(), period));
        const results = await IphoneModel.getServiceStats(d_start, d_end);

        let maxVolume = Math.max(...results.map(i => i.repair_count), 1);
        results.forEach(item => {
            const score = (parseFloat(item.avg_rating) * 20 * 0.4) + (parseFloat(item.success_rate) * 0.4) + ((item.repair_count / maxVolume) * 100 * 0.2);
            item.performance_score = parseFloat(score.toFixed(1));
        });
        return results.sort((a, b) => b.performance_score - a.performance_score).slice(0, 5);
    },

    // GET /api/predictions -> controller.predictions
    calculatePredictions: async () => {
        const d_start = formatDateSQL(subDays(getToday(), 90));
        const predictions = await IphoneModel.getPredictionData(d_start);
        predictions.forEach(item => {
            const base = parseFloat(item.avg_monthly_repairs) * 3;
            item.ceyrek_1 = Math.round(base * 1.05);
            item.ceyrek_4 = Math.round(base * 1.20);
            item.yillik = Math.round(base * 4.5); // Örnek toplama
        });
        return { method: 'trend_projection', base_period: '90_days', predictions };
    },

    // CRUD Metotları (Controller isimleri ile uyumlu)
    createRepairWithValidation: async (data) => {
        const today = getToday();
        if (new Date(data.operation_date) < today.setHours(0,0,0,0)) throw new Error('Geçmiş tarihe kayıt eklenemez');
        const id = await IphoneModel.createRepair(data);
        return { operation_id: id, message: 'Başarıyla oluşturuldu' };
    },
    getRepairById: async (id) => await IphoneModel.getRepairById(id),
    getAllRepairs: async (limit) => {
        const repairs = await IphoneModel.getAllRepairs(limit);
        return { total: repairs.length, repairs };
    },
    updateRepairWithValidation: async (id, data) => {
        if (await IphoneModel.hasRepairCriticalAnomaly(id)) throw new Error('Kritik anomalili kayıt güncellenemez');
        await IphoneModel.updateRepair(id, data);
        return { operation_id: id, message: 'Güncellendi' };
    },
    deleteRepairWithValidation: async (id) => {
        const r = await IphoneModel.getRepairById(id);
        if (r && r.if_repair_successful === 1) throw new Error('Tamamlanmış tamir silinemez');
        await IphoneModel.deleteRepair(id);
        return { operation_id: id, message: 'Silindi' };
    }
};

module.exports = IphoneService;