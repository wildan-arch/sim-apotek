export const vDebounceClick = {
  mounted(el, binding) {
    let timeout = null;
    const delay = binding.value || 1000;

    el.__handleClick__ = (event) => {
      // 1. Cegah jika sudah disabled
      if (el.disabled) {
        event.stopImmediatePropagation();
        return;
      }

      // 2. Tandai sebagai disabled
      el.disabled = true;

      // --- TAMBAHAN SCRIPT UNTUK KURSOR & VISUAL ---
      // Simpan style kursor asli agar bisa dikembalikan nanti
      el.dataset.originalCursor = el.style.cursor;
      // Paksa ubah kursor menjadi default (panah) atau not-allowed
      el.style.cursor = "default";
      // Opsional: Buat sedikit transparan agar terlihat mati
      el.style.opacity = "0.7";
      // ---------------------------------------------

      timeout = setTimeout(() => {
        // Kembalikan ke semula setelah delay habis
        el.disabled = false;
        el.style.cursor = el.dataset.originalCursor || "pointer"; // Kembalikan ke pointer awal
        el.style.opacity = "1";
      }, delay);
    };

    // Menggunakan useCapture = true agar menangkap event sebelum form submit
    el.addEventListener("click", el.__handleClick__, true);
  },

  unmounted(el) {
    if (el.__handleClick__) {
      el.removeEventListener("click", el.__handleClick__, true);
    }
  },
};
