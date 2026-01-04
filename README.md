# 📱 iPhone Karar Destek Sistemi (KDS) - Node.js MVC Versiyonu

## 📖 Proje Hakkında

Bu proje, iPhone tamir servis verilerini analiz eden bir Karar Destek Sistemi'nin **MVC (Model-View-Controller)** mimarisine uygun olarak **Node.js** ile geliştirilmiş versiyonudur.

### 🎯 Projenin Amacı
- iPhone tamir operasyonlarını analiz etmek
- Servis merkezlerinin performansını değerlendirmek
- Anomalileri tespit etmek
- Gelecek dönem tahminleri yapmak

### 🏗️ Mimari Yapı

Proje **MVC (Model-View-Controller)** mimarisine tam uyumlu olarak tasarlanmıştır:
```
project/
├── app.js                          # Ana sunucu dosyası
├── config/                         # Yapılandırma dosyaları
│   └── constants.js                # Sabit değerler ve konfigürasyonlar
├── controllers/                    # Controller katmanı
│   └── iphoneController.js         # HTTP request/response yönetimi
├── services/                       # Service katmanı (İş mantığı)
│   └── iphoneService.js            # İş mantığı ve algoritmalar
├── models/                         # Model katmanı
│   └── iphoneModel.js              # Veritabanı işlemleri
├── routers/                        # Routing katmanı
│   └── iphoneRouter.js             # API endpoint tanımları
├── utils/                          # Yardımcı fonksiyonlar
│   └── dateHelpers.js              # Tarih işlemleri
├── db/                             # Veritabanı bağlantısı
│   └── mysql_connect.js            # MySQL connection pool
└── public/                         # Frontend (View katmanı)
    ├── index.html
    ├── css/
    └── js/
```

## 🔄 MVC Katmanları

### 📊 Model Katmanı (`models/`)
- Veritabanı ile doğrudan iletişim
- SQL sorguları ve veri erişimi
- **Sorumluluk**: Sadece veri okuma/yazma

### 🎮 Controller Katmanı (`controllers/`)
- HTTP request/response yönetimi
- Kullanıcı isteklerini Service katmanına yönlendirme
- Hata yönetimi (error handling)
- **Sorumluluk**: Sadece HTTP protokol yönetimi

### 💼 Service Katmanı (`services/`)
- İş mantığı ve hesaplamalar
- Algoritmaların çalıştırılması
- Model'den gelen verilerin işlenmesi
- **Sorumluluk**: Tüm business logic

### 🛣️ Router Katmanı (`routers/`)
- URL routing
- Endpoint tanımları
- **Sorumluluk**: İstekleri doğru controller'a yönlendirme

### 🎨 View Katmanı (`public/`)
- Kullanıcı arayüzü (HTML, CSS, JavaScript)
- **Sorumluluk**: Veri görselleştirme

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v14 veya üzeri)
- MySQL (v5.7 veya üzeri)
- npm veya yarn

### 1. Projeyi İndir
```bash
git clone <repo-url>
cd iphone-kds-nodejs
```

### 2. Bağımlılıkları Yükle
```bash
npm install
```

### 3. Veritabanı Ayarları
`.env` dosyasını düzenleyin:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=iphone_kds
```

### 4. Sunucuyu Başlat
```bash
# Production modunda
npm start

# Development modunda (nodemon ile)
npm run dev
```

Sunucu başarıyla başladığında:
```
🚀 iPhone KDS Node.js Sunucusu Başlatıldı
📍 Yerel Adres: http://localhost:3000
📊 API Test:    http://localhost:3000/api/kpi
```

## 📡 API Endpoints

### 1. KPI Kartları
```
GET /api/kpi?period=30
```
**Parametreler:**
- `period`: Analiz periyodu (gün) - varsayılan: 30

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_repairs": { "value": 150, "change": 12.5 },
    "customer_satisfaction": { "value": "4.35", "change": 0.15 },
    "critical_anomalies": { "value": 5, "change": -2 },
    "avg_cost": { "value": 450 }
  }
}
```

### 2. Aylık Trend Grafiği
```
GET /api/monthly-trend?months=12
```

### 3. Anomali Listesi
```
GET /api/anomalies?severity=CRITICAL&limit=20
```

### 4. Servis Performansı
```
GET /api/services?period=30
```

### 5. Tahminler
```
GET /api/predictions
```

## 🧮 İş Mantığı ve Algoritmalar

### Servis Performans Skoru Algoritması
Servis merkezlerinin performansı 3 metrik üzerinden hesaplanır:
```javascript
Performance Score = (Rating × 0.40) + (Success Rate × 0.40) + (Volume × 0.20)
```

- **Müşteri Puanı (40%)**: 5 üzerinden alınan puanın 100'lük sisteme çevrilmesi
- **Başarı Oranı (40%)**: Başarılı tamir oranı
- **İşlem Hacmi (20%)**: Normalize edilmiş tamir sayısı

### Tahmin Algoritması
Son 90 günün verisi baz alınarak çeyrek bazlı projeksiyon:
```javascript
Q1: Baz × 1.05  // %5 artış
Q2: Baz × 1.10  // %10 artış
Q3: Baz × 1.15  // %15 artış
Q4: Baz × 1.20  // %20 artış
```

## 🎨 Kullanılan Teknolojiler

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MySQL2**: Veritabanı driver (Promise desteği)
- **dotenv**: Environment variables yönetimi
- **cors**: Cross-Origin Resource Sharing

### Frontend
- **HTML5**: Yapı
- **CSS3**: Stil
- **JavaScript (Vanilla)**: Etkileşim ve veri görselleştirme

## 📂 Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `app.js` | Ana sunucu ve middleware yapılandırması |
| `iphoneController.js` | HTTP request/response yönetimi |
| `iphoneService.js` | İş mantığı ve algoritmalar |
| `iphoneModel.js` | Veritabanı sorguları |
| `constants.js` | Tüm sabit değerler |
| `dateHelpers.js` | Tarih işlem fonksiyonları |

## 🔐 Güvenlik

- ✅ SQL Injection koruması (parametreli sorgular)
- ✅ Environment variables ile hassas bilgi yönetimi
- ✅ CORS yapılandırması
- ✅ Error handling

## 📚 Proje Evrimi

Bu proje başlangıçta **Python Flask** ile backend, **JavaScript** ile frontend olarak geliştirilmiştir. Daha sonra tam olarak **Node.js** diline çevrilmiş ve **MVC mimarisi** uygulanarak yeniden yapılandırılmıştır.

### Python → Node.js Çevirisi
- Flask route'ları → Express.js route'ları
- Python fonksiyonları → JavaScript async/await
- SQLAlchemy → MySQL2 Promise API

### MVC Refactoring
- İş mantığı Controller'dan Service katmanına taşındı
- Yardımcı fonksiyonlar Utils klasörüne ayrıldı
- Sabit değerler Config dosyasına toplandı
- Separation of Concerns prensibi uygulandı

## 👨‍💻 Geliştirici Notları

### MVC Prensiplerine Uygunluk
- ✅ **Model**: Sadece veri erişimi
- ✅ **Controller**: Sadece HTTP yönetimi
- ✅ **Service**: Tüm iş mantığı
- ✅ **Separation of Concerns**: Her katman kendi sorumluluğu
- ✅ **Single Responsibility**: Her fonksiyon tek iş yapar
- ✅ **DRY**: Kod tekrarı yok

### Performans Optimizasyonları
- Connection pooling ile veritabanı bağlantı yönetimi
- Promise.all ile paralel sorgu çalıştırma
- Async/await ile non-blocking I/O

## 📄 Lisans

ISC License

---

**Not**: Bu proje eğitim amaçlı geliştirilmiştir ve MVC mimarisinin Node.js ile nasıl uygulanacağını göstermektedir.