import { defineStore } from "pinia";
import axios from "axios";

export const useSettingStore = defineStore("setting", {
  state: () => ({
    profilApotek: {
      namaApotek: "APOTEK SHABAH",
      apoteker: "ARGANDITA FAIRUZ SHABAH",
      noHp: "085745320912",
      alamat: "JL. ARGOSUKO WANGKAL LOR",
      footerNota: "Terimakasih telah berbelanja di APOTEK SHABAH\nBarang yang sudah dibeli tidak dapat ditukar/dikembalikan",
    },
  }),
  actions: {
    async fetchSetting() {
      try {
        const res = await axios.get("http://localhost:5000/api/settings");
        if (res.data) {
          this.profilApotek = res.data;
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan toko:", err);
      }
    },
    async updateSetting(payload) {
      try {
        const res = await axios.put("http://localhost:5000/api/settings", payload);
        if (res.data && res.data.setting) {
          this.profilApotek = res.data.setting;
        } else {
          this.profilApotek = { ...payload };
        }
        return { success: true, message: "Pengaturan berhasil disimpan!" };
      } catch (err) {
        // Fallback jika backend belum jalan
        this.profilApotek = { ...payload };
        return { success: true, message: "Disimpan secara lokal." };
      }
    },
  },
});
