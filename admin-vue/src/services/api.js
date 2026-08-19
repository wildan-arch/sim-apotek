// const BASE_URL = "https://sim-apotek-production.up.railway.app/api";
const BASE_URL = "http://localhost:5000/api";
// 1. ENDPOINT OBAT
export const apiObat = {
  getAll: () => fetch(`${BASE_URL}/obat`).then((r) => r.json()),
  create: (data) =>
    fetch(`${BASE_URL}/obat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  update: (id, data) =>
    fetch(`${BASE_URL}/obat/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  delete: (id) => fetch(`${BASE_URL}/obat/${id}`, { method: "DELETE" }),
  importExcel: (items) =>
    fetch(`${BASE_URL}/obat/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).then((r) => r.json()),

  getHistoriHarga: (id) => fetch(`${BASE_URL}/obat/${id}/histori-harga`).then((r) => r.json()),

  // 🎯 TAMBAHKAN KODE INI DI BAWAH (JANGAN LUPA SIMPAN FILE):
  stokOpnameBulk: (items) =>
    fetch(`${BASE_URL}/obat/stok-opname-bulk`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).then((r) => r.json()),
};

// 2. ENDPOINT KATEGORI & SATUAN
export const apiKategori = {
  getAll: () => fetch(`${BASE_URL}/kategori`).then((r) => r.json()),
  create: (nama) =>
    fetch(`${BASE_URL}/kategori`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, klasifikasi: "bebas" }),
    }).then((r) => r.json()),
};

export const apiSatuan = {
  getAll: () => fetch(`${BASE_URL}/satuan`).then((r) => r.json()),
  create: (nama) =>
    fetch(`${BASE_URL}/satuan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama }),
    }).then((r) => r.json()),
};

// 3. ENDPOINT PENJUALAN (POS & LAPORAN)
export const apiPenjualan = {
  transaksiBaru: (payload) =>
    fetch(`${BASE_URL}/penjualan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json()),

  getLaporan: (tglAwal, tglAkhir) => {
    // Ambil role langsung dari localStorage
    const currentRole = localStorage.getItem("user_role") || "kasir";

    return fetch(`${BASE_URL}/penjualan/laporan?tglAwal=${tglAwal}&tglAkhir=${tglAkhir}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": currentRole, // Mengirim role user yang sedang aktif
      },
    }).then((r) => r.json());
  },

  getRiwayat: () => {
    const hariIni = new Date().toISOString().split("T")[0];
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");

    return fetch(`${BASE_URL}/penjualan/laporan?tglAwal=${hariIni}&tglAkhir=${hariIni}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json());
  },

  // ANALISIS PERGERAKAN (Jika endpoint ini juga ingin dikunci khusus owner, tambahkan header token juga di sini)
  getAnalisisPergerakan: () => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    return fetch(`${BASE_URL}/penjualan/analisis-pergerakan`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json());
  },
};

// 4. ENDPOINT PEMBELIAN (FAKTUR PBF, LOG HARGA, & HUTANG)
export const apiPembelian = {
  getAll: () => fetch(`${BASE_URL}/pembelian`).then((r) => r.json()),

  // 🎯 BARIS TAMBAHAN UNTUK LAPORAN PEMBELIAN (PBF)
  getLaporan: (tglAwal, tglAkhir) => fetch(`${BASE_URL}/pembelian/laporan?tglAwal=${tglAwal}&tglAkhir=${tglAkhir}`).then((r) => r.json()),

  simpanFaktur: (payload) =>
    fetch(`${BASE_URL}/pembelian`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json()),
  getLogHarga: (obatId) => fetch(`${BASE_URL}/pembelian/log-harga/${obatId}`).then((r) => r.json()),
  getHutang: () => fetch(`${BASE_URL}/pembelian/hutang`).then((r) => r.json()),
  lunasiHutang: (id) => fetch(`${BASE_URL}/pembelian/lunas/${id}`, { method: "PUT" }),
};
// 5. ENDPOINT INTEGRASI WHATSAPP
export const apiWA = {
  getStatus: () => fetch(`${BASE_URL}/wa-status`).then((r) => r.json()),
  kirimPesan: (nomorTujuan, pesan) =>
    fetch(`${BASE_URL}/kirim-wa-otomatis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomorTujuan, pesan }),
    }).then((r) => r.json()),
};

// ENDPOINT TIPE BARANG
export const apiTipeBarang = {
  getAll: () => fetch(`${BASE_URL}/tipe-barang`).then((r) => r.json()),
  create: (data) =>
    fetch(`${BASE_URL}/tipe-barang`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  update: (id, data) =>
    fetch(`${BASE_URL}/tipe-barang/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  delete: (id) => fetch(`${BASE_URL}/tipe-barang/${id}`, { method: "DELETE" }).then((r) => r.json()),
};
