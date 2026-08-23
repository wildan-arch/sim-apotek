const BASE_URL = "https://sim-apotek-production.up.railway.app/api";

// 🛠️ Helper untuk mengambil data dari sessionStorage atau localStorage secara aman
const getAuthData = () => {
  const currentRole = sessionStorage.getItem("user_role") || sessionStorage.getItem("role") || localStorage.getItem("user_role") || localStorage.getItem("role") || "owner";

  const token = sessionStorage.getItem("token") || sessionStorage.getItem("access_token") || sessionStorage.getItem("auth_token") || localStorage.getItem("token") || localStorage.getItem("access_token");

  return { currentRole, token };
};

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
  transaksiBaru: (payload) => {
    const { token } = getAuthData();
    return fetch(`${BASE_URL}/penjualan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) {
        console.error("❌ Detail Error dari Server (400):", data);
      }
      return data;
    });
  },

  getLaporan: (tglAwal, tglAkhir) => {
    const { currentRole, token } = getAuthData();

    return fetch(`${BASE_URL}/penjualan/laporan?tglAwal=${tglAwal}&tglAkhir=${tglAkhir}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-user-role": currentRole,
      },
    }).then((r) => r.json());
  },

  getRiwayat: () => {
    const hariIni = new Date().toISOString().split("T")[0];
    const { token } = getAuthData();

    return fetch(`${BASE_URL}/penjualan/laporan?tglAwal=${hariIni}&tglAkhir=${hariIni}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json());
  },

  getAnalisisPergerakan: () => {
    const { token } = getAuthData();
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
  getAll: () => {
    const { token } = getAuthData();
    return fetch(`${BASE_URL}/pembelian`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  },

  getLaporan: (tglAwal, tglAkhir) => {
    const { token } = getAuthData();
    return fetch(`${BASE_URL}/pembelian/laporan?tglAwal=${tglAwal}&tglAkhir=${tglAkhir}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  },

  simpanFaktur: (payload) => {
    const { token } = getAuthData();
    return fetch(`${BASE_URL}/pembelian`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  },

  getLogHarga: (obatId) => {
    const { token } = getAuthData();
    return fetch(`${BASE_URL}/pembelian/log-harga/${obatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  },

  getHutang: () => {
    const { token } = getAuthData();
    return fetch(`${BASE_URL}/pembelian/hutang`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  },

  lunasiHutang: (id) => {
    const { token } = getAuthData();
    return fetch(`${BASE_URL}/pembelian/lunas/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// ENDPOINT TIPE BARANG
export const apiTipeBarang = {
  getAll: () => fetch(`${BASE_URL}/tipe-barang`).then((r) => r.json()),
  create: (data) => {
    const { token } = getAuthData();
    return fetch(`${BASE_URL}/tipe-barang`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  update: (id, data) => {
    const { token } = getAuthData();
    return fetch(`${BASE_URL}/tipe-barang/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },
  delete: (id) => {
    const { token } = getAuthData();
    return fetch(`${BASE_URL}/tipe-barang/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  },
};
