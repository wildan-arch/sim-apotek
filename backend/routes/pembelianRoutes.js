const express = require("express");
const router = express.Router();
const Pembelian = require("../models/Pembelian");
const Obat = require("../models/Obat");
const LogHarga = require("../models/LogHarga");

// GET ALL RIWAYAT PEMBELIAN PBF
router.get("/", async (req, res) => {
  try {
    const riwayat = await Pembelian.find()
      .populate({
        path: "items.obat",
        populate: { path: "tipeBarang" },
      })
      .sort({ tglFaktur: -1, createdAt: -1 });
    res.json(riwayat);
  } catch (error) {
    console.error("Error GET /api/pembelian:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🎯 ENDPOINT LAPORAN PEMBELIAN PBF (DENGAN FILTER TANGGAL)
router.get("/laporan", async (req, res) => {
  try {
    const { tglAwal, tglAkhir } = req.query;
    let filter = {};

    if (tglAwal && tglAkhir) {
      const startDate = new Date(tglAwal);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(tglAkhir);
      endDate.setHours(23, 59, 59, 999);

      filter.$or = [{ tglFaktur: { $gte: startDate, $lte: endDate } }, { createdAt: { $gte: startDate, $lte: endDate } }];
    }

    const dataPembelian = await Pembelian.find(filter)
      .populate({
        path: "items.obat",
        populate: { path: "tipeBarang" },
      })
      .sort({ tglFaktur: -1, createdAt: -1 });

    res.json({ dataPembelian });
  } catch (error) {
    console.error("Error GET /api/pembelian/laporan:", error);
    res.status(500).json({ message: error.message });
  }
});

// 1. GET LAPORAN HUTANG PBF (TEMPO)
router.get("/hutang", async (req, res) => {
  try {
    const daftarHutang = await Pembelian.find({ metodeBayar: "Tempo" }).sort({ tglJatuhTempo: 1 });

    let totalHutangBelumLunas = 0;
    let totalFakturBelumLunas = 0;

    daftarHutang.forEach((f) => {
      if (f.statusBayar === "Belum Lunas") {
        totalHutangBelumLunas += f.totalBayar;
        totalFakturBelumLunas++;
      }
    });

    res.json({
      ringkasan: {
        totalHutangBelumLunas,
        totalFakturBelumLunas,
      },
      dataHutang: daftarHutang,
    });
  } catch (error) {
    console.error("Error GET /api/pembelian/hutang:", error);
    res.status(500).json({ message: error.message });
  }
});

// 2. PUT PELUNASAN HUTANG FAKTUR
router.put("/lunas/:id", async (req, res) => {
  try {
    const faktur = await Pembelian.findByIdAndUpdate(req.params.id, { statusBayar: "Lunas" }, { returnDocument: "after" });
    res.json({ message: "Faktur PBF berhasil dilunasi!", data: faktur });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. POST SIMPAN FAKTUR PEMBELIAN (PBF), AUTO-UPDATE KATALOG & LOG HISTORI HARGA
router.post("/", async (req, res) => {
  try {
    const { header, items, totalBayar } = req.body;

    if (!header || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Payload request tidak lengkap." });
    }

    const statusAwal = header.metodeBayar === "Tempo" ? "Belum Lunas" : "Lunas";
    const namaPBF = header.pbf || header.pabrik || "-";

    const pembelianBaru = new Pembelian({
      noFaktur: header.noFaktur || `FAK-${Date.now()}`,
      pabrik: namaPBF,
      tglFaktur: header.tglFaktur || new Date(),
      tglJatuhTempo: header.tglJatuhTempo || null,
      metodeBayar: header.metodeBayar || "Tunai",
      statusBayar: statusAwal,
      items: items.map((item) => ({
        obat: item.obat || item.obatId,
        qty: Number(item.qty || 0),
        hargaBeli: Number(item.hargaBeli || 0),
        diskonPersen: Number(item.diskonPersen || 0),
        diskonNominal: Number(item.diskonNominal || 0),
        hargaBersih: Number(item.hargaBersih || item.hargaBeli || 0),
        hargaJual: Number(item.hargaJual || 0),
        subtotal: Number(item.subtotal || 0),
      })),
      totalBayar: Number(totalBayar || 0),
    });

    await pembelianBaru.save();

    for (const item of items) {
      const targetObatId = item.obat || item.obatId;

      if (targetObatId) {
        const obat = await Obat.findById(targetObatId);

        if (obat) {
          const konversi = Number(obat.nilaiKonversi) > 1 ? Number(obat.nilaiKonversi) : 1;
          const penambahanStok = Number(item.qty || 0) * konversi;

          const hargaBoxBersih = Number(item.hargaBersih || item.hargaBeli || 0);
          const hppEceranBaru = Math.round(hargaBoxBersih / konversi);

          const margin = Number(obat.marginPersen || 20);
          const hargaJualBaru = Number(item.hargaJual) > 0 ? Number(item.hargaJual) : Math.round(hppEceranBaru + hppEceranBaru * (margin / 100));

          try {
            await LogHarga.create({
              obat: obat._id,
              obatId: obat._id,
              namaObat: obat.nama,
              noFaktur: header.noFaktur || "-",
              pbf: namaPBF,
              hargaBeliLama: Number(obat.hargaBeli || 0),
              hargaBeliBaru: Number(hppEceranBaru),
              hargaJualLama: Number(obat.hargaJual || 0),
              hargaJualBaru: Number(hargaJualBaru),
              tanggal: header.tglFaktur ? new Date(header.tglFaktur) : new Date(),
            });
          } catch (errLog) {
            console.error("Gagal mencatat log harga:", errLog.message);
          }

          const updateData = {
            $inc: { stok: penambahanStok },
            $set: {
              hargaBeliSatuanBesar: hargaBoxBersih,
              hargaBeli: hppEceranBaru,
              hargaJual: hargaJualBaru,
              pabrik: namaPBF,
            },
            $addToSet: {
              daftarPBF: { nama: namaPBF, hargaBeli: hargaBoxBersih, isUtama: false },
            },
          };

          await Obat.findByIdAndUpdate(targetObatId, updateData);
        }
      }
    }

    res.status(201).json({ message: "Faktur PBF berhasil disimpan, stok dan katalog terupdate!" });
  } catch (error) {
    console.error("CRITICAL ERROR POST /api/pembelian:", error);
    res.status(500).json({ message: error.message || "Terjadi kesalahan pada server." });
  }
});

// GET HISTORI HARGA BERDASARKAN ID OBAT
router.get("/log-harga/:obatId", async (req, res) => {
  try {
    const logs = await LogHarga.find({
      $or: [{ obatId: req.params.obatId }, { obat: req.params.obatId }],
    }).sort({ tanggal: -1, createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
