<template>
  <!-- ### TAMPILKAN INI JIKA BELUM LOGIN ###-->
  <LoginView v-if="!isLoggedIn" @login-success="handleLoginSuccess" />
  <div v-else class="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
    <!-- TAMPILAN JIKA SUDAH LOGIN -->
    <!-- 1. SIDEBAR NAVIGASI -->
    <Sidebar
      :menuAktif="menuAktif"
      @gantiMenu="gantiMenu"
      @bukaMenuLaporan="gantiMenu('laporan-penjualan')"
      @bukaMenuHutang="gantiMenu('hutang')"
      @open-setting="bukaModalSetting"
      @bukaStokOpname="showModalStokOpname = true"
      @bukaUserManagement="isUserModalOpen = true"
      @bukaResetPassword="isResetModalOpen = true"
      @logout="handleLogout"
    />

    <!-- 2. KONTEN UTAMA Halaman -->
    <main class="flex-1 h-full p-8 overflow-y-auto print:p-0">
      <!-- VIEW DASHBOARD -->
      <DashboardView v-if="menuAktif === 'dashboard'" :daftarObat="daftarObat" :obatAkanED="obatAkanED" :rekapHutang="rekapHutang" />

      <!-- VIEW KATALOG OBAT -->
      <KatalogView
        v-if="menuAktif === 'katalog'"
        :daftarObat="daftarObat"
        :daftarTipeBarang="masterTipeBarang"
        @bukaModalBarangBaru="bukaModalBarangBaru"
        @bukaModalFaktur="bukaModalFaktur"
        @editObat="editObat"
        @bukaModalHistoriHarga="bukaModalHistoriHarga"
        @refreshData="loadAllData"
      />

      <!-- VIEW KASIR POS -->
      <KasirView v-if="menuAktif === 'kasir'" :daftarObat="daftarObat" @transaksiSukses="loadAllData" />

      <DefectaView v-else-if="menuAktif === 'defecta'" />

      <!-- RENDER HALAMAN LAPORAN -->
      <LaporanPenjualanView v-else-if="menuAktif === 'laporan-penjualan' || menuAktif === 'laporan'" />
      <LaporanPembelianView v-else-if="menuAktif === 'laporan-pembelian'" />

      <!-- VIEW HUTANG USAHA PBF -->
      <HutangView v-if="menuAktif === 'hutang'" />

      <ProfileView v-if="menuAktif === 'profile'" />

      <!-- ========================================== -->
      <!-- MODAL-MODAL GLOBAL -->
      <!-- ========================================== -->
      <ModalStokOpnameMobile :isOpen="showModalStokOpname" :daftarObat="daftarObat" @close="showModalStokOpname = false" @suksesUpdate="loadAllData" />
      <ModalObatMaster v-model:isOpen="barangModalAktif" :editData="editDataModal" @suksesSimpan="loadAllData" />
      <ModalFaktur v-model:modalFakturAktif="modalFakturAktif" @bukaModalBarangBaru="bukaModalBarangBaru" @suksesSimpan="loadAllData" />
      <ModalHistoriHarga v-model:modalHistoriHargaAktif="modalHistoriHargaAktif" :obatAktifHistori="obatAktifHistori" />
      <ModalSettingApotek :isOpen="showModalSetting" @close="showModalSetting = false" />
      <UserManagementModal :isOpen="isUserModalOpen" @close="isUserModalOpen = false" @user-created="fetchUserList" />
      <ResetPasswordModal :isOpen="isResetModalOpen" @close="isResetModalOpen = false" />
      <ToastNotif />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import LoginView from "./views/LoginView.vue";
import ResetPasswordModal from "@/components/modals/ResetPasswordModal.vue";

// IMPORT VIEWS & SIDEBAR
import Sidebar from "@/components/Sidebar.vue";
import DashboardView from "@/views/DashboardView.vue";
import KatalogView from "@/views/KatalogView.vue";
import KasirView from "@/views/KasirView.vue";
import HutangView from "@/views/HutangView.vue";
import LaporanPenjualanView from "@/views/LaporanPenjualanView.vue";
import LaporanPembelianView from "@/views/LaporanPembelianView.vue";

// IMPORT MODALS
import ModalObatMaster from "@/components/modals/ModalObatMaster.vue";
import ModalFaktur from "@/components/modals/ModalFaktur.vue";
import ModalHistoriHarga from "@/components/modals/ModalHistoriHarga.vue";
import ModalStokOpnameMobile from "@/components/modals/ModalStokOpnameMobile.vue";
import ModalSettingApotek from "@/components/modals/ModalSettingApotek.vue";
import ToastNotif from "@/components/ToastNotif.vue";
import DefectaView from "./views/DefectaView.vue";
import UserManagementModal from "@/components/modals/UserManagementModal.vue";
import ProfileView from "@/views/ProfileView.vue";
// IMPORT STORE
import { useMasterStore } from "@/stores/useMasterStore.js";

// TITLE WEBSITE
onMounted(() => {
  document.title = "Sim Apotek";
  // --- TAMBAHKAN PENGECEKAN INI AGAR TIDAK TEMBUS URL ---
  const statusLogin = localStorage.getItem("is_logged_in");
  if (statusLogin === "true") {
    isLoggedIn.value = true;
  }
  loadAllData();
});

const isUserModalOpen = ref(false);
const isResetModalOpen = ref(false);

// INISIALISASI STORE UTAMA
const masterStore = useMasterStore();
const { daftarObat, masterTipeBarang, obatAkanED, rekapHutang, loadAllData } = masterStore;

// STATE KONTROL MODAL STOCK OPNAME & SETTING
const showModalStokOpname = ref(false);
const showModalSetting = ref(false);

const bukaModalSetting = () => {
  showModalSetting.value = true;
};

// STATE NAVIGASI
const menuAktif = ref(localStorage.getItem("menuAktif") || "dashboard");

// STATE KONTROL MODAL
const barangModalAktif = ref(false);
const editDataModal = ref(null);
const modalFakturAktif = ref(false);
const modalHistoriHargaAktif = ref(false);
const obatAktifHistori = ref(null);

// FUNGSI NAVIGASI & PEMICU MODAL (DENGAN PENGAMAN ROLE)
const gantiMenu = (namaMenu) => {
  // Ambil role user yang sedang aktif dari localStorage
  const currentRole = localStorage.getItem("user_role");

  // Daftar menu yang khusus hanya boleh diakses oleh Owner
  const restrictedMenusForKasir = ["laporan-penjualan", "laporan-pembelian", "laporan"];

  // Jika akun kasir mencoba membuka menu khusus owner, blokir dan alihkan
  if (currentRole === "kasir" && restrictedMenusForKasir.includes(namaMenu)) {
    toast.trigger("Akses ditolak! Menu ini khusus untuk Owner.", "error");
    menuAktif.value = "dashboard";
    localStorage.setItem("menuAktif", "dashboard");
    return;
  }

  // Jika aman (Owner atau menu umum kasir), jalankan perpindahan menu normal
  menuAktif.value = namaMenu;
  localStorage.setItem("menuAktif", namaMenu);
};

const bukaModalBarangBaru = () => {
  editDataModal.value = null;
  barangModalAktif.value = true;
};

const editObat = (itemObat) => {
  editDataModal.value = itemObat;
  barangModalAktif.value = true;
};

const bukaModalFaktur = () => {
  modalFakturAktif.value = true;
};

const bukaModalHistoriHarga = (itemObat) => {
  obatAktifHistori.value = itemObat;
  modalHistoriHargaAktif.value = true;
};

const isLoggedIn = ref(sessionStorage.getItem("is_logged_in") === "true");
// Fungsi yang dieksekusi saat tombol logout di Sidebar diklik
const handleLogout = () => {
  sessionStorage.removeItem("is_logged_in");
  sessionStorage.removeItem("user_role");
  sessionStorage.removeItem("username");
  isLoggedIn.value = false;
};

const fetchUserList = () => {
  // Fungsi untuk memuat ulang daftar user jika diperlukan nanti
  toast.trigger("User list diperbarui", "success");
  console.log("User list diperbarui");
};

const handleLoginSuccess = (userData) => {
  // Simpan data login dari backend nanti di sini
  localStorage.setItem("is_logged_in", "true");
  localStorage.setItem("user_role", userData.role);
  isLoggedIn.value = true;
};

// INITIAL LOAD DATA
onMounted(() => {
  loadAllData();
});
</script>
