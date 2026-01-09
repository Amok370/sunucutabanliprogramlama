// models/iphoneModel.js
const db = require('../db/mysql_connect');

const IphoneModel = {
    
    // KPI 1: Toplam Tamir Sayısı
    getRepairCount: async (startDate, endDate) => {
        const sql = "SELECT COUNT(*) as count FROM repair_operations WHERE operation_date BETWEEN ? AND ?";
        const [rows] = await db.execute(sql, [startDate, endDate]);
        return rows[0].count;
    },

    // KPI 2: Müşteri Memnuniyeti (Ortalama Puan)
    getAvgRating: async (startDate, endDate) => {
        const sql = "SELECT AVG(rating) as avg_rating FROM customer_feedback WHERE feedback_date BETWEEN ? AND ?";
        const [rows] = await db.execute(sql, [startDate, endDate]);
        return rows[0].avg_rating || 0;
    },

    // KPI 3: Kritik Anomaliler
    getCriticalAnomalies: async (startDate, endDate) => {
        const sql = `
            SELECT COUNT(*) as count 
            FROM anomaly_log 
            WHERE severity IN ('CRITICAL', 'HIGH') 
            AND anomaly_date BETWEEN ? AND ?
        `;
        const [rows] = await db.execute(sql, [startDate, endDate]);
        return rows[0].count;
    },

    // KPI 4: Ortalama Tamir Maliyeti
    getAvgCost: async (startDate, endDate) => {
        const sql = "SELECT AVG(service_cost) as avg_cost FROM repair_operations WHERE operation_date BETWEEN ? AND ?";
        const [rows] = await db.execute(sql, [startDate, endDate]);
        return rows[0].avg_cost || 0;
    },

    // GRAFİK: Aylık Toplam Trend
    getMonthlyTrendTotal: async (startDate) => {
        const sql = `
            SELECT DATE_FORMAT(operation_date, '%Y-%m') as month, COUNT(*) as count
            FROM repair_operations 
            WHERE operation_date >= ?
            GROUP BY month 
            ORDER BY month
        `;
        const [rows] = await db.execute(sql, [startDate]);
        return rows;
    },

    // GRAFİK: En Çok Tamir Gören Top 3 Model (Dinamik Grafiği Çizmek İçin)
    getTop3Models: async (startDate) => {
        const sql = `
            SELECT im.model_name
            FROM repair_operations ro
            JOIN iphone_models im ON ro.model_id = im.model_id
            WHERE ro.operation_date >= ?
            GROUP BY im.model_name
            ORDER BY COUNT(ro.operation_id) DESC
            LIMIT 3
        `;
        const [rows] = await db.execute(sql, [startDate]);
        return rows.map(row => row.model_name); // Sadece isim listesi döndür
    },

    // GRAFİK: Seçilen Modellerin Aylık Kırılımı
    getModelBreakdown: async (startDate, modelNames) => {
        if (modelNames.length === 0) return [];

        // Dinamik sorgu oluşturma: (?, ?, ?) şeklinde placeholder yaratır
        const placeholders = modelNames.map(() => '?').join(',');
        
        const sql = `
            SELECT 
                DATE_FORMAT(ro.operation_date, '%Y-%m') as month,
                im.model_name,
                COUNT(*) as count
            FROM repair_operations ro
            JOIN iphone_models im ON ro.model_id = im.model_id
            WHERE ro.operation_date >= ? 
            AND im.model_name IN (${placeholders})
            GROUP BY month, im.model_name
            ORDER BY month, im.model_name
        `;
        
        // Parametreleri birleştir: [Tarih, Model1, Model2, Model3]
        const params = [startDate, ...modelNames];
        const [rows] = await db.execute(sql, params);
        return rows;
    },

    // TABLO: Anomali Listesi
    getAnomalies: async (severity, limit) => {
        let sql = `
            SELECT 
                al.anomaly_id, al.anomaly_type, al.anomaly_date, al.severity,
                sc.service_name, im.model_name
            FROM anomaly_log al
            JOIN repair_operations ro ON al.operation_id = ro.operation_id
            JOIN service_centers sc ON ro.service_id = sc.service_id
            JOIN iphone_models im ON ro.model_id = im.model_id
        `;
        
        const params = [];
        
        if (severity) {
            sql += " WHERE al.severity = ?";
            params.push(severity);
        }
        
        sql += " ORDER BY al.anomaly_date DESC, al.severity DESC LIMIT ?";
        params.push(limit);
        
        const [rows] = await db.execute(sql, params);
        return rows;
    },

    // TABLO: Servis Performans Verileri (Hesaplamadan önceki ham veri)
    getServiceStats: async (startDate, endDate) => {
        const sql = `
            SELECT 
                sc.service_name,
                sc.city,
                COUNT(ro.operation_id) as repair_count,
                ROUND(SUM(CASE WHEN ro.if_repair_successful = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as success_rate,
                COALESCE(ROUND(AVG(cf.rating), 2), 0) as avg_rating
            FROM repair_operations ro
            JOIN service_centers sc ON ro.service_id = sc.service_id
            LEFT JOIN customer_feedback cf ON ro.operation_id = cf.operation_id
            WHERE ro.operation_date BETWEEN ? AND ?
            GROUP BY sc.service_id, sc.service_name, sc.city
        `;
        const [rows] = await db.execute(sql, [startDate, endDate]);
        return rows;
    },

    // TABLO: Tahminler İçin Baz Veri
    getPredictionData: async (startDate) => {
        const sql = `
            SELECT 
                im.model_name,
                pt.part_name,
                ROUND(COUNT(*) / 3, 0) as avg_monthly_repairs
            FROM repair_operations ro
            JOIN iphone_models im ON ro.model_id = im.model_id
            JOIN part_types pt ON ro.part_id = pt.part_id
            WHERE ro.operation_date >= ?
            GROUP BY im.model_name, pt.part_name
            HAVING avg_monthly_repairs >= 5
            ORDER BY avg_monthly_repairs DESC
            LIMIT 15
        `;
        const [rows] = await db.execute(sql, [startDate]);
        return rows;
    },
    // ========================================
    // CRUD İŞLEMLERİ
    // ========================================

    // CREATE: Yeni tamir kaydı ekle
    createRepair: async (data) => {
        const sql = `
            INSERT INTO repair_operations 
            (model_id, service_id, part_id, operation_date, service_cost, if_repair_successful) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.model_id,
            data.service_id,
            data.part_id,
            data.operation_date,
            data.service_cost,
            data.if_repair_successful || 0
        ]);
        return result.insertId;
    },

    // READ: Tek bir tamir kaydını getir
    getRepairById: async (id) => {
        const sql = `
            SELECT 
                ro.*,
                im.model_name,
                sc.service_name,
                pt.part_name
            FROM repair_operations ro
            JOIN iphone_models im ON ro.model_id = im.model_id
            JOIN service_centers sc ON ro.service_id = sc.service_id
            JOIN part_types pt ON ro.part_id = pt.part_id
            WHERE ro.operation_id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0] || null;
    },

    // READ: Tüm tamir kayıtlarını listele
    getAllRepairs: async (limit = 50) => {
        const sql = `
            SELECT 
                ro.operation_id,
                ro.operation_date,
                ro.service_cost,
                ro.if_repair_successful,
                im.model_name,
                sc.service_name,
                pt.part_name
            FROM repair_operations ro
            JOIN iphone_models im ON ro.model_id = im.model_id
            JOIN service_centers sc ON ro.service_id = sc.service_id
            JOIN part_types pt ON ro.part_id = pt.part_id
            ORDER BY ro.operation_date DESC
            LIMIT ?
        `;
        const [rows] = await db.execute(sql, [limit]);
        return rows;
    },

    // UPDATE: Tamir kaydını güncelle
    updateRepair: async (id, data) => {
        const sql = `
            UPDATE repair_operations 
            SET 
                if_repair_successful = ?,
                service_cost = ?,
                service_time = ?
            WHERE operation_id = ?
        `;
        const [result] = await db.execute(sql, [
            data.if_repair_successful,
            data.service_cost,
            data.service_time,
            id
        ]);
        return result.affectedRows;
    },

    // DELETE: Tamir kaydını sil
    deleteRepair: async (id) => {
        const sql = "DELETE FROM repair_operations WHERE operation_id = ?";
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows;
    },

    // İş Kuralı için: Tamir'in kritik anomalisi var mı?
    hasRepairCriticalAnomaly: async (id) => {
        const sql = `
            SELECT COUNT(*) as count 
            FROM anomaly_log 
            WHERE operation_id = ? AND severity IN ('CRITICAL', 'HIGH')
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0].count > 0;
    }
};

module.exports = IphoneModel;