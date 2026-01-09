const db = require('../db/mysql_connect');

const IphoneModel = {
    getRepairCount: async (s, e) => {
        const [rows] = await db.execute("SELECT COUNT(*) as count FROM repair_operations WHERE DATE(operation_date) BETWEEN ? AND ?", [s, e]);
        return rows[0].count;
    },
    getAvgRating: async (s, e) => {
        const [rows] = await db.execute("SELECT AVG(rating) as avg FROM customer_feedback WHERE DATE(feedback_date) BETWEEN ? AND ?", [s, e]);
        return rows[0].avg || 0;
    },
    getCriticalAnomalies: async (s, e) => {
        const [rows] = await db.execute("SELECT COUNT(*) as count FROM anomaly_log WHERE severity IN ('CRITICAL', 'HIGH') AND DATE(anomaly_date) BETWEEN ? AND ?", [s, e]);
        return rows[0].count;
    },
    getAvgCost: async (s, e) => {
        const [rows] = await db.execute("SELECT AVG(service_cost) as avg FROM repair_operations WHERE DATE(operation_date) BETWEEN ? AND ?", [s, e]);
        return rows[0].avg || 0;
    },
    getMonthlyTrendTotal: async (s) => {
        const [rows] = await db.execute("SELECT DATE_FORMAT(operation_date, '%Y-%m') as month, COUNT(*) as count FROM repair_operations WHERE DATE(operation_date) >= ? GROUP BY month ORDER BY month", [s]);
        return rows;
    },
    getAnomalies: async (sev, lim) => {
        let sql = "SELECT * FROM anomaly_log";
        const params = [];
        if (sev) { sql += " WHERE severity = ?"; params.push(sev); }
        sql += " ORDER BY anomaly_date DESC LIMIT ?"; params.push(String(lim));
        const [rows] = await db.execute(sql, params);
        return rows;
    },
    getServiceStats: async (s, e) => {
        const sql = `SELECT sc.service_name, sc.city, COUNT(ro.operation_id) as repair_count, 
                     ROUND(SUM(CASE WHEN ro.if_repair_successful = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as success_rate,
                     COALESCE(ROUND(AVG(cf.rating), 2), 0) as avg_rating
                     FROM repair_operations ro JOIN service_centers sc ON ro.service_id = sc.service_id
                     LEFT JOIN customer_feedback cf ON ro.operation_id = cf.operation_id
                     WHERE DATE(ro.operation_date) BETWEEN ? AND ? GROUP BY sc.service_id`;
        const [rows] = await db.execute(sql, [s, e]);
        return rows;
    },
    getPredictionData: async (s) => {
        const sql = `SELECT im.model_name, pt.part_name, ROUND(COUNT(*) / 3, 0) as avg_monthly_repairs
                     FROM repair_operations ro JOIN iphone_models im ON ro.model_id = im.model_id
                     JOIN part_types pt ON ro.part_id = pt.part_id WHERE DATE(ro.operation_date) >= ?
                     GROUP BY im.model_name, pt.part_name LIMIT 15`;
        const [rows] = await db.execute(sql, [s]);
        return rows;
    },
    // CRUD SQL
    createRepair: async (d) => {
        const [res] = await db.execute("INSERT INTO repair_operations (model_id, service_id, part_id, operation_date, service_cost) VALUES (?, ?, ?, ?, ?)", [d.model_id, d.service_id, d.part_id, d.operation_date, d.service_cost]);
        return res.insertId;
    },
    getRepairById: async (id) => {
        const [rows] = await db.execute("SELECT * FROM repair_operations WHERE operation_id = ?", [id]);
        return rows[0] || null;
    },
    getAllRepairs: async (lim) => {
        const [rows] = await db.execute("SELECT * FROM repair_operations ORDER BY operation_date DESC LIMIT ?", [lim]);
        return rows;
    },
    updateRepair: async (id, d) => {
        const [res] = await db.execute("UPDATE repair_operations SET service_cost = ? WHERE operation_id = ?", [d.service_cost, id]);
        return res.affectedRows;
    },
    deleteRepair: async (id) => {
        const [res] = await db.execute("DELETE FROM repair_operations WHERE operation_id = ?", [id]);
        return res.affectedRows;
    },
    hasRepairCriticalAnomaly: async (id) => {
        const [rows] = await db.execute("SELECT COUNT(*) as count FROM anomaly_log WHERE operation_id = ? AND severity IN ('CRITICAL', 'HIGH')", [id]);
        return rows[0].count > 0;
    }
};

module.exports = IphoneModel;