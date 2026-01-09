const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Rotaları (Router) içe aktaralım
const iphoneRouter = require('./routers/iphoneRouter');

const app = express();
const port = process.env.PORT || 3000;

// ========================================
// 1. MIDDLEWARE AYARLARI
// ========================================

// CORS ayarı
app.use(cors());

// Body-parser: JSON verilerini okuyabilmek için
app.use(express.json());

// Statik Dosyalar: public klasöründeki html, css ve js dosyalarını dışarı açar
// Bu satır, frontend dosyalarının localhost:3000 üzerinden erişilmesini sağlar
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// 2. ROTA TANIMLARI (API)
// ========================================

/**
 * Tüm API isteklerini '/api' öneki ile router'a yönlendiriyoruz.
 * Örneğin: Frontend fetch('/api/kpi') yazdığında iphoneRouter çalışır.
 */
app.use('/api', iphoneRouter);

// ========================================
// 3. ANA SAYFA YÖNLENDİRMESİ
// ========================================

/**
 * Tarayıcıda doğrudan localhost:3000 yazıldığında 
 * public içindeki index.html'i gönderir.
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========================================
// 4. HATA YÖNETİMİ (Opsiyonel ama Güvenli)
// ========================================

app.use((err, req, res, next) => {
    console.error('Sunucu Hatası:', err.stack);
    res.status(500).json({ status: 'error', message: 'Bir sunucu hatası oluştu!' });
});

// ========================================
// 5. SUNUCUYU BAŞLAT
// ========================================

app.listen(port, () => {
    console.log(`===========================================`);
    console.log(`🚀 Sunucu şu adreste çalışıyor: http://localhost:${port}`);
    console.log(`📅 Simülasyon Tarihi: 18 Ocak 2025`);
    console.log(`===========================================`);
});