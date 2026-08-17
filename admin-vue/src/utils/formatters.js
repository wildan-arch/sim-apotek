// ==============================================================
// formatter.js adalah Fungsi pembantu (format Rupiah, tanggal, capitalize, Excel).
// ==============================================================

// Format angka ke format Rupiah Indonesia (contoh: 15.000)
export const formatRupiah = (val) => Number(val || 0).toLocaleString("id-ID");

// Format tanggal lengkap dengan jam (contoh: 12 Agt 2026, 14.30)
export const formatTanggal = (iso) => (iso ? new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-");

// Format tanggal singkat (contoh: 12 Agt 2026)
export const formatTanggalSingkat = (iso) => (iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-");

// Format string menjadi Capital Case (contoh: "paracetamol 500mg" -> "Paracetamol 500mg")
export const formatCapitalize = (text) => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Cek apakah tanggal ED kurang dari atau sama dengan 90 hari
export const isDekatExpired = (dateStr) => {
  if (!dateStr) return false;
  const edDate = new Date(dateStr);
  const diffDays = Math.ceil((edDate - new Date()) / (1000 * 60 * 60 * 24));
  return diffDays <= 90;
};
