// utils/dateHelpers.js

/**
 * Belirtilen tarihten belirtilen gün sayısını çıkarır
 * @param {Date} date - Başlangıç tarihi
 * @param {number} days - Çıkarılacak gün sayısı
 * @returns {Date} Yeni tarih
 */
const subDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

/**
 * Tarihi SQL formatına çevirir (YYYY-MM-DD)
 * @param {Date} date - Formatlanacak tarih
 * @returns {string} SQL formatında tarih
 */
const formatDateSQL = (date) => {
    return date.toISOString().split('T')[0];
};

/**
 * İki değer arasındaki yüzde değişimi hesaplar
 * @param {number} oldVal - Eski değer
 * @param {number} newVal - Yeni değer
 * @returns {number} Yüzde değişim
 */
const calculateChange = (oldVal, newVal) => {
    if (oldVal === 0) return 0;
    return parseFloat((((newVal - oldVal) / oldVal) * 100).toFixed(1));
};

/**
 * Tarihe gün ekler
 * @param {Date} date - Başlangıç tarihi
 * @param {number} days - Eklenecek gün sayısı
 * @returns {Date} Yeni tarih
 */
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * İki tarih arasındaki gün farkını hesaplar
 * @param {Date} date1 - İlk tarih
 * @param {Date} date2 - İkinci tarih
 * @returns {number} Gün farkı
 */
const daysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
};

module.exports = {
    subDays,
    formatDateSQL,
    calculateChange,
    addDays,
    daysBetween
};