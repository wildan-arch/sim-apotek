import { ref, computed } from "vue";
import { apiObat, apiKategori, apiSatuan, apiPembelian, apiTipeBarang } from "@/services/api.js"; // 👈 Tambah apiTipeBarang
import { isDekatExpired } from "@/utils/formatters.js";

// Reactive Shared State Global
const daftarObat = ref([]);
const masterKategori = ref([]);
const masterSatuan = ref([]);
const masterTipeBarang = ref([]); // 👈 Tambah state masterTipeBarang
const rekapHutang = ref({ totalHutangBelumLunas: 0, totalFakturBelumLunas: 0 });
const historiHutang = ref([]);

export function useMasterStore() {
  const loadAllData = async () => {
    try {
      // 🎯 Tambah apiTipeBarang.getAll() ke dalam Promise.all
      const [obatRes, katRes, satRes, tipeRes] = await Promise.all([apiObat.getAll(), apiKategori.getAll(), apiSatuan.getAll(), apiTipeBarang.getAll()]);

      // Ekstrak data array/object
      daftarObat.value = Array.isArray(obatRes) ? obatRes : obatRes?.data || [];
      masterKategori.value = Array.isArray(katRes) ? katRes : katRes?.data || [];
      masterSatuan.value = Array.isArray(satRes) ? satRes : satRes?.data || [];
      masterTipeBarang.value = Array.isArray(tipeRes) ? tipeRes : tipeRes?.data || []; // 👈 Simpan tipe barang

      await loadLaporanHutang();
    } catch (err) {
      console.error("Gagal memuat data master:", err);
    }
  };

  const loadLaporanHutang = async () => {
    try {
      const data = await apiPembelian.getHutang();
      const resData = data?.data || data;
      rekapHutang.value = resData?.ringkasan || { totalHutangBelumLunas: 0, totalFakturBelumLunas: 0 };
      historiHutang.value = resData?.dataHutang || [];
    } catch (err) {
      console.error("Gagal memuat hutang:", err);
    }
  };

  const obatAkanED = computed(() => daftarObat.value.filter((o) => o.expiredDate && isDekatExpired(o.expiredDate)));

  return {
    daftarObat,
    masterKategori,
    masterSatuan,
    masterTipeBarang,
    rekapHutang,
    historiHutang,
    obatAkanED,
    loadAllData,
    loadLaporanHutang,
  };
}
