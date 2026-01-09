// controllers/iphoneController.js
const IphoneService = require('../services/iphoneService');

/**
 * Controller sadece HTTP request/response yönetimi yapar
 * İş mantığı Service katmanına taşındı
 */
const controller = {

    /**
     * KPI Kartları Endpoint
     * GET /api/kpi?period=30
     */
    kpi: async (req, res) => {
        try {
            const period = parseInt(req.query.period) || 30;
            
            // Service katmanından veriyi al
            const data = await IphoneService.getKPIData(period);
            
            res.json({
                status: 'success',
                data: data
            });

        } catch (err) {
            console.error('KPI Hatası:', err);
            res.status(500).json({ 
                status: 'error',
                message: 'KPI verileri alınamadı' 
            });
        }
    },

    /**
     * Aylık Trend Grafiği Endpoint
     * GET /api/monthly-trend?months=12
     */
    monthlyTrend: async (req, res) => {
        try {
            const months = parseInt(req.query.months) || 12;
            
            // Service katmanından veriyi al
            const data = await IphoneService.getMonthlyTrendData(months);
            
            res.json({
                status: 'success',
                data: data
            });

        } catch (err) {
            console.error('Trend Hatası:', err);
            res.status(500).json({ 
                status: 'error',
                message: 'Trend verisi alınamadı' 
            });
        }
    },

    /**
     * Anomaliler Endpoint
     * GET /api/anomalies?severity=CRITICAL&limit=20
     */
    anomalies: async (req, res) => {
        try {
            const severity = req.query.severity || null;
            const limit = parseInt(req.query.limit) || 20;
            
            // Service katmanından veriyi al
            const data = await IphoneService.getAnomalyData(severity, limit);
            
            res.json({
                status: 'success',
                data: data
            });

        } catch (err) {
            console.error('Anomali Hatası:', err);
            res.status(500).json({ 
                status: 'error',
                message: 'Anomali verisi alınamadı' 
            });
        }
    },

    /**
     * Servis Performansı Endpoint
     * GET /api/services?period=30
     */
    services: async (req, res) => {
        try {
            const period = parseInt(req.query.period) || 30;
            
            // Service katmanından hesaplanmış veriyi al
            const data = await IphoneService.calculateServicePerformance(period);
            
            res.json({
                status: 'success',
                data: data
            });

        } catch (err) {
            console.error('Servis Hatası:', err);
            res.status(500).json({ 
                status: 'error',
                message: 'Servis verisi alınamadı' 
            });
        }
    },

    /**
     * Tahminler Endpoint
     * GET /api/predictions
     */
    predictions: async (req, res) => {
        try {
            // Service katmanından tahmin verilerini al
            const data = await IphoneService.calculatePredictions();
            
            res.json({
                status: 'success',
                method: data.method,
                base_period: data.base_period,
                data: data.predictions
            });

        } catch (err) {
            console.error('Tahmin Hatası:', err);
            res.status(500).json({ 
                status: 'error',
                message: 'Tahmin verisi alınamadı' 
            });
        }
    },
    // ========================================
    // CRUD ENDPOINT'LERİ
    // ========================================

    /**
     * Yeni Tamir Kaydı Oluştur
     * POST /api/repairs
     */
    createRepair: async (req, res) => {
        try {
            const data = req.body;
            
            const result = await IphoneService.createRepairWithValidation(data);
            
            res.status(201).json({
                status: 'success',
                message: result.message,
                data: {
                    operation_id: result.operation_id
                }
            });

        } catch (err) {
            console.error('Tamir Oluşturma Hatası:', err);
            res.status(400).json({
                status: 'error',
                message: err.message
            });
        }
    },

    /**
     * Tek Bir Tamir Kaydını Getir
     * GET /api/repairs/:id
     */
    getRepairById: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            
            const repair = await IphoneService.getRepairById(id);
            
            res.json({
                status: 'success',
                data: repair
            });

        } catch (err) {
            console.error('Tamir Getirme Hatası:', err);
            res.status(404).json({
                status: 'error',
                message: err.message
            });
        }
    },

    /**
     * Tüm Tamir Kayıtlarını Listele
     * GET /api/repairs?limit=50
     */
    getAllRepairs: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 50;
            
            const result = await IphoneService.getAllRepairs(limit);
            
            res.json({
                status: 'success',
                total: result.total,
                data: result.repairs
            });

        } catch (err) {
            console.error('Tamir Listeleme Hatası:', err);
            res.status(500).json({
                status: 'error',
                message: 'Tamir kayıtları alınamadı'
            });
        }
    },

    /**
     * Tamir Kaydını Güncelle
     * PUT /api/repairs/:id
     */
    updateRepair: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const data = req.body;
            
            const result = await IphoneService.updateRepairWithValidation(id, data);
            
            res.json({
                status: 'success',
                message: result.message,
                data: {
                    operation_id: result.operation_id
                }
            });

        } catch (err) {
            console.error('Tamir Güncelleme Hatası:', err);
            res.status(400).json({
                status: 'error',
                message: err.message
            });
        }
    },

    /**
     * Tamir Kaydını Sil
     * DELETE /api/repairs/:id
     */
    deleteRepair: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            
            const result = await IphoneService.deleteRepairWithValidation(id);
            
            res.json({
                status: 'success',
                message: result.message,
                data: {
                    operation_id: result.operation_id
                }
            });

        } catch (err) {
            console.error('Tamir Silme Hatası:', err);
            res.status(400).json({
                status: 'error',
                message: err.message
            });
        }
    }
};

module.exports = controller;