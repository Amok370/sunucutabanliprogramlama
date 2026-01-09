// public/main.js

document.addEventListener('DOMContentLoaded', () => {
    refreshAllData();
});

async function refreshAllData() {
    console.log("Veriler sunucudan çekiliyor...");
    await Promise.all([
        updateKPIs(),
        updateCharts(),
        updateAnomalies(),
        updateServices(),
        updatePredictions()
    ]);
}

// 1. KPI Kartlarını Güncelle
async function updateKPIs() {
    try {
        const response = await fetch('/api/kpi');
        const result = await response.json();
        
        if (result.status === 'success') {
            const data = result.data;
            document.getElementById('total-repairs').innerText = data.total_repairs.value;
            document.getElementById('repairs-change').innerText = `%${data.total_repairs.change}`;
            
            document.getElementById('customer-satisfaction').innerText = data.customer_satisfaction.value + "/5";
            document.getElementById('satisfaction-change').innerText = data.customer_satisfaction.change;
            
            document.getElementById('critical-anomalies').innerText = data.critical_anomalies.value;
            document.getElementById('anomalies-change').innerText = data.critical_anomalies.change;
            
            document.getElementById('avg-cost').innerText = data.avg_cost.value.toLocaleString('tr-TR');
        }
    } catch (err) { console.error("KPI yükleme hatası:", err); }
}

// 2. Grafikleri Güncelle (ID düzeltildi: monthlyTrendChart)
let myTrendChart = null;
async function updateCharts() {
    try {
        const response = await fetch('/api/monthly-trend');
        const result = await response.json();
        
        if (result.status === 'success' && result.data.total) {
            const trendData = result.data.total;
            const labels = trendData.map(item => item.month);
            const values = trendData.map(item => item.count);

            const ctx = document.getElementById('monthlyTrendChart'); // ID eşlendi
            if (!ctx) return;

            if (myTrendChart) { myTrendChart.destroy(); }

            myTrendChart = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Aylık Tamir Sayısı',
                        data: values,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    } catch (err) { console.error("Grafik hatası:", err); }
}

// 3. Anomali Tablosunu Güncelle (ID düzeltildi: anomalies-body)
async function updateAnomalies() {
    try {
        const response = await fetch('/api/anomalies');
        const result = await response.json();
        
        const tableBody = document.getElementById('anomalies-body'); // ID eşlendi
        if (!tableBody || result.status !== 'success') return;

        tableBody.innerHTML = '';
        result.data.anomalies.forEach(item => {
            tableBody.innerHTML += `
                <tr>
                    <td>${new Date(item.anomaly_date).toLocaleDateString('tr-TR')}</td>
                    <td>${item.anomaly_type}</td>
                    <td>${item.service_name || 'Servis'}</td>
                    <td><span class="badge ${item.severity.toLowerCase()}">${item.severity}</span></td>
                </tr>`;
        });
    } catch (err) { console.error("Anomali hatası:", err); }
}

// 4. Servis Performansı Tablosunu Güncelle
async function updateServices() {
    try {
        const response = await fetch('/api/services');
        const result = await response.json();
        const tableBody = document.getElementById('services-body');
        if (!tableBody || result.status !== 'success') return;

        tableBody.innerHTML = '';
        result.data.forEach(item => {
            tableBody.innerHTML += `
                <tr>
                    <td>${item.service_name}</td>
                    <td>${item.repair_count}</td>
                    <td>%${item.success_rate}</td>
                    <td>${item.avg_rating}</td>
                    <td><strong>${item.performance_score}</strong></td>
                </tr>`;
        });
    } catch (err) { console.error("Servis tablosu hatası:", err); }
}

// 5. Tahminler Tablosunu Güncelle
async function updatePredictions() {
    try {
        const response = await fetch('/api/predictions');
        const result = await response.json();
        const tableBody = document.getElementById('predictions-body');
        if (!tableBody || result.status !== 'success') return;

        tableBody.innerHTML = '';
        result.data.forEach(item => {
            tableBody.innerHTML += `
                <tr>
                    <td>${item.model_name}</td>
                    <td>${item.part_name}</td>
                    <td>${item.avg_monthly_repairs}</td>
                    <td>${item.ceyrek_1}</td>
                    <td>${item.ceyrek_2 || '-'}</td>
                    <td>${item.ceyrek_3 || '-'}</td>
                    <td>${item.ceyrek_4}</td>
                    <td>${item.yillik}</td>
                </tr>`;
        });
    } catch (err) { console.error("Tahmin tablosu hatası:", err); }
}

// API Test Paneli Yardımcı Fonksiyonları
function toggleAPIPanel() {
    const panel = document.getElementById('api-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

async function testEndpoint(endpoint, method) {
    const output = document.getElementById('api-output');
    const responseDiv = document.getElementById('api-response');
    try {
        const response = await fetch(endpoint, { method });
        const result = await response.json();
        output.innerText = JSON.stringify(result, null, 2);
        responseDiv.style.display = 'block';
    } catch (err) {
        output.innerText = "Hata: " + err.message;
    }
}