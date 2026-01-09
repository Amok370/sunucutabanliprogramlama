// routers/iphoneRouter.js
const express = require('express');
const router = express.Router();

// Controller dosyamızı çağırıyoruz
const controller = require('../controllers/iphoneController');

// ========================================
// ROTA TANIMLARI
// ========================================

// Tarayıcıdan '/api/kpi' isteği gelirse -> controller.kpi fonksiyonunu çalıştır
router.get('/kpi', controller.kpi);

// Tarayıcıdan '/api/monthly-trend' isteği gelirse -> controller.monthlyTrend fonksiyonunu çalıştır
router.get('/monthly-trend', controller.monthlyTrend);

// Tarayıcıdan '/api/anomalies' isteği gelirse -> controller.anomalies fonksiyonunu çalıştır
router.get('/anomalies', controller.anomalies);

// Tarayıcıdan '/api/services' isteği gelirse -> controller.services fonksiyonunu çalıştır
router.get('/services', controller.services);

// Tarayıcıdan '/api/predictions' isteği gelirse -> controller.predictions fonksiyonunu çalıştır
router.get('/predictions', controller.predictions);

// ========================================
// CRUD ENDPOINT'LERİ
// ========================================

// CREATE: Yeni tamir kaydı oluştur
router.post('/repairs', controller.createRepair);

// READ: Tek bir tamir kaydını getir
router.get('/repairs/:id', controller.getRepairById);

// READ: Tüm tamir kayıtlarını listele
router.get('/repairs', controller.getAllRepairs);

// UPDATE: Tamir kaydını güncelle
router.put('/repairs/:id', controller.updateRepair);

// DELETE: Tamir kaydını sil
router.delete('/repairs/:id', controller.deleteRepair);

module.exports = router;