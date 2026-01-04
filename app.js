const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ========================================
// 1. MIDDLEWARE AYARLARI
// ========================================

// CORS: Frontend ve Backend farklı portlarda çalışırsa iletişim kurabilsin
app.use(cors());

// JSON Veri İşleme: Gelen isteklerin gövdesini (body) okuyabilmek için
app.use(express.json());

// Statik Dosyalar: HTML, CSS ve JS dosyalarını 'public' klasöründen sun
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// 2. ROTA (ROUTER) TANIMLARI
// ========================================

// API Rotalarını içe aktar
const iphoneRouter = require('./routers/iphoneRouter');

// '/api' ile başlayan tüm istekleri iphoneRouter'a yönlendir
// Örnek: /api/kpi, /api/services
app.use('/api', iphoneRouter);

// ========================================
// 3. TEMEL ROTALAR
// ========================================

// Ana Sayfa: Tarayıcıdan girildiğinde index.html'i gönder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health Check: Sunucunun ayakta olup olmadığını kontrol et
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'iPhone KDS Node.js Sunucusu Çalışıyor',
        timestamp: new Date().toISOString()
    });
});

// ========================================
// 4. SUNUCUYU BAŞLAT
// ========================================

app.listen(port, () => {
    console.log(`===========================================`);
    console.log(`🚀 iPhone KDS Node.js Sunucusu Başlatıldı`);
    console.log(`📍 Yerel Adres: http://localhost:${port}`);
    console.log(`📊 API Test:    http://localhost:${port}/api/kpi`);
    console.log(`===========================================`);
});