import EscPosEncoder from "esc-pos-encoder";

export const cetakStrukWebUSB = async (data) => {
  try {
    // 1. Minta akses perangkat USB dari browser
    const device = await navigator.usb.requestDevice({ filters: [] });
    await device.open();

    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }
    await device.claimInterface(0);

    // 2. Format isi struk ke dalam perintah ESC/POS murni
    let encoder = new EscPosEncoder();

    let encodedData = encoder
      .initialize()
      .codepage("cp437")
      .align("center")
      .bold(true)
      .line("APOTEK SHABAH")
      .bold(false)
      .line("Jl. Raya Apotek No. 123, Malang")
      .line("Telp/WA: 0812-3456-7890")
      .line("--------------------------------") // 32 Karakter (Standar POS-58)
      .align("left")
      .line(`No  : ${data.id}`)
      .line(`Tgl : ${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`)
      .line(`Bayar: ${data.metodeBayar || "Tunai"}`)
      .line("--------------------------------");

    // Loop Item Obat
    (data.items || []).forEach((item) => {
      const namaObat = item.nama || item.namaObat || "Item";
      const qty = item.qty || item.jumlah || 1;
      const harga = item.harga || item.hargaJual || 0;
      const totalItem = qty * harga;

      encodedData.line(namaObat.substring(0, 32)).line(`  ${qty}x @${harga.toLocaleString("id-ID")} = Rp ${totalItem.toLocaleString("id-ID")}`);
    });

    // Rincian Total
    encodedData.line("--------------------------------").line(`Subtotal : Rp ${(data.subtotal || 0).toLocaleString("id-ID")}`);

    if (data.diskon > 0) {
      encodedData.line(`Diskon   : -Rp ${(data.diskon || 0).toLocaleString("id-ID")}`);
    }

    // Ambil hasil encode (Uint8Array)
    const resultUint8 = encodedData
      .bold(true)
      .line(`TOTAL    : Rp ${(data.total || 0).toLocaleString("id-ID")}`)
      .bold(false)
      .line(`Bayar    : Rp ${(data.bayar || 0).toLocaleString("id-ID")}`)
      .line(`Kembali  : Rp ${(data.kembali || 0).toLocaleString("id-ID")}`)
      .line("--------------------------------")
      .align("center")
      .bold(true)
      .line("*** TERIMA KASIH ***")
      .line("Obat yang sudah dibeli")
      .line("tidak dapat ditukar/dikembalikan")
      .newline()
      .newline()
      .cut()
      .encode(); // Mengembalikan Uint8Array

    // 3. Pastikan tipe data yang dikirim adalah ArrayBuffer/Uint8Array yang valid untuk WebUSB
    const dataBuffer = new Uint8Array(resultUint8).buffer;

    // Cari Endpoint Out USB
    const endpoint = device.configuration.interfaces[0].alternate.endpoints.find((e) => e.direction === "out");

    // Kirim data buffer murni
    await device.transferOut(endpoint.endpointNumber, dataBuffer);

    // 4. Lepaskan interface setelah selesai
    await device.releaseInterface(0);
    await device.close();

    return { success: true };
  } catch (error) {
    console.error("WebUSB Printing Error:", error);
    return { success: false, error: error.message };
  }
};
