<template>
  <div v-if="transaksiTerakhir" class="hidden print:block text-black font-mono text-xs p-2 max-w-[80mm] mx-auto">
    <div class="text-center border-b pb-2 mb-2">
      <div class="font-extrabold text-sm">APOTEK SHABAH</div>
      <div>Jl. Raya Apotek No. 123</div>
      <div>Telp: 0812-3456-7890</div>
    </div>

    <div class="text-[10px] space-y-0.5 border-b pb-2 mb-2">
      <div>No. Struk : {{ transaksiTerakhir.noStruk }}</div>
      <div>Tanggal : {{ transaksiTerakhir.tanggal }}</div>
      <div>Kasir : Admin Kasir</div>
    </div>

    <div class="border-b pb-2 mb-2 space-y-1">
      <div v-for="(i, idx) in transaksiTerakhir.items" :key="idx" class="flex justify-between text-[11px]">
        <div>
          <div>{{ i.nama }}</div>
          <div class="text-[10px]">{{ i.qty }} x {{ formatRupiah(i.hargaJual) }}</div>
        </div>
        <div class="font-bold">Rp {{ formatRupiah(i.qty * i.hargaJual) }}</div>
      </div>
    </div>

    <div class="text-[11px] space-y-1 border-b pb-2 mb-2">
      <div class="flex justify-between">
        <span>Subtotal:</span><span>Rp {{ formatRupiah(transaksiTerakhir.subtotal) }}</span>
      </div>
      <div v-if="transaksiTerakhir.diskon > 0" class="flex justify-between">
        <span>Diskon:</span><span>-Rp {{ formatRupiah(transaksiTerakhir.diskon) }}</span>
      </div>
      <div class="flex justify-between font-bold border-t pt-1">
        <span>TOTAL:</span><span>Rp {{ formatRupiah(transaksiTerakhir.total) }}</span>
      </div>
      <div class="flex justify-between">
        <span>Bayar ({{ transaksiTerakhir.metode }}):</span><span>Rp {{ formatRupiah(transaksiTerakhir.bayar) }}</span>
      </div>
      <div class="flex justify-between font-bold">
        <span>Kembali:</span><span>Rp {{ formatRupiah(transaksiTerakhir.kembali) }}</span>
      </div>
    </div>

    <div class="text-center text-[10px] pt-2">
      <div>Terima Kasih Atas Kunjungan Anda</div>
      <div>Semoga Lekas Sembuh!</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  transaksiTerakhir: Object,
  formatRupiah: Function,
});
</script>
