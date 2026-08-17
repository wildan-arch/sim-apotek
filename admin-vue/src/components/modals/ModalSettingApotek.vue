<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden">
      <!-- Header Modal -->
      <div class="flex items-center justify-between border-b bg-emerald-700 px-5 py-4 text-white">
        <h3 class="font-bold text-lg flex items-center gap-2">⚙️ Pengaturan Toko & Nota Struk</h3>
        <button @click="closeModal" class="text-white/80 hover:text-white font-bold text-xl">&times;</button>
      </div>

      <!-- Form Inputs -->
      <form @submit.prevent="handleSimpan" class="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-sm">
        <div>
          <label class="block font-medium text-gray-700 mb-1">Nama Apotek</label>
          <input v-model="form.namaApotek" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none" placeholder="Contoh: APOTEK SHABAH" />
        </div>

        <div>
          <label class="block font-medium text-gray-700 mb-1">Nama Apoteker (SIPA)</label>
          <input v-model="form.apoteker" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none" placeholder="Nama Apoteker Penanggung Jawab" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-medium text-gray-700 mb-1">No. HP / WA</label>
            <input v-model="form.noHp" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none" placeholder="08xxx" />
          </div>
          <div>
            <label class="block font-medium text-gray-700 mb-1">Alamat Singkat</label>
            <input v-model="form.alamat" type="text" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none" placeholder="Kota / Jalan" />
          </div>
        </div>

        <div>
          <label class="block font-medium text-gray-700 mb-1">Footer Nota Struk (Pesan Bawah)</label>
          <textarea
            v-model="form.footerNota"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none font-mono text-xs"
            placeholder="Contoh: Terima kasih telah berbelanja. Barang yang sudah dibeli tidak dapat ditukar."
          ></textarea>
        </div>

        <!-- Tombol Aksi -->
        <div class="flex justify-end gap-2 pt-3 border-t">
          <button type="button" @click="closeModal" class="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 font-medium">Batal</button>
          <button type="submit" :disabled="loading" class="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
            {{ loading ? "Menyimpan..." : "💾 Simpan Pengaturan" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useSettingStore } from "@/stores/settingStore";
import { useToastStore } from "@/stores/toastStore";
const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const settingStore = useSettingStore();
const toastStore = useToastStore();
const loading = ref(false);

const form = ref({
  namaApotek: "",
  apoteker: "",
  noHp: "",
  alamat: "",
  footerNota: "",
});

// Setiap modal dibuka, isi form dengan data yang ada di store
watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      if (!settingStore.profilApotek.namaApotek) {
        await settingStore.fetchSetting();
      }
      form.value = { ...settingStore.profilApotek };
    }
  },
);

const closeModal = () => {
  emit("close");
};
const handleSimpan = async () => {
  loading.value = true;
  const res = await settingStore.updateSetting(form.value);
  loading.value = false;

  if (res.success) {
    // Memanggil toast notifikasi sukses
    toastStore.trigger("Pengaturan toko berhasil disimpan!", "success");
    closeModal();
  } else {
    // Memanggil toast notifikasi error
    toastStore.trigger("Gagal menyimpan pengaturan: " + res.message, "error");
  }
};
</script>
