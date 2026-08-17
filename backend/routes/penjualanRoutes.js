const express = require("express");
const router = express.Router();
const Penjualan = require("../models/Penjualan");
const Obat = require("../models/Obat");
const { verifyOwner } = require("../middleware/authMiddleware");

// 🎯 ENDPOINT ANALISIS PERGERAKAN STOK (DENGAN FILTER PERIODE TANGGAL)
router.get("/analisis-pergerakan", async (req, res) => {
  try {
    const { periode } = req.query;

    let filterTanggal = {};
    const skrg = new Date();

    if (periode === "7_hari") {
      const tglAwal = new Date();
      tglAwal.setDate(skrg.getDate() - 7);
      tglAwal.setHours(0, 0, 0, 0);
      filterTanggal = { createdAt: { $gte: tglAwal } };
    } else if (periode === "30_hari") {
      const tglAwal = new Date();
      tglAwal.setDate(skrg.getDate() - 30);
      tglAwal.setHours(0, 0, 0, 0);
      filterTanggal = { createdAt: { $gte: tglAwal } };
    } else if (periode === "bulan_ini" || !periode) {
      const tglAwal = new Date(skrg.getFullYear(), skrg.getMonth(), 1);
      filterTanggal = { createdAt: { $gte: tglAwal } };
    }

    const pipeline = [];

    if (Object.keys(filterTanggal).length > 0) {
      pipeline.push({ $match: filterTanggal });
    }

    pipeline.push(
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.obat",
          nama: { $first: "$items.nama" },
          totalTerjual: { $sum: "$items.qty" },
          totalOmset: { $sum: { $multiply: ["$items.qty", "$items.hargaJual"] } },
        },
      },
      {
        $lookup: {
          from: "obats",
          let: { idBarang: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [{ $eq: ["$_id", "$$idBarang"] }, { $eq: ["$_id", { $toObjectId: "$$idBarang" }] }, { $eq: ["$idObat", "$$idBarang"] }],
                },
              },
            },
          ],
          as: "katalogObat",
        },
      },
      {
        $lookup: {
          from: "satuans",
          localField: "katalogObat.satuanTerkecil",
          foreignField: "_id",
          as: "dataSatuan",
        },
      },
      {
        $addFields: {
          stok: {
            $ifNull: [{ $arrayElemAt: ["$katalogObat.stok", 0] }, 0],
          },
          satuan: {
            $ifNull: [{ $arrayElemAt: ["$dataSatuan.nama", 0] }, "Pcs"],
          },
        },
      },
      {
        $project: {
          katalogObat: 0,
          dataSatuan: 0,
        },
      },
    );

    const hasilAgregasi = await Penjualan.aggregate(pipeline);

    const fastMoving = [...hasilAgregasi].sort((a, b) => b.totalTerjual - a.totalTerjual).slice(0, 10);
    const slowMoving = [...hasilAgregasi].sort((a, b) => a.totalTerjual - b.totalTerjual).slice(0, 10);

    res.json({ fastMoving, slowMoving });
  } catch (error) {
    console.error("Error agregasi pergerakan:", error);
    res.status(500).json({ message: error.message });
  }
});

// 1. SIMPAN TRANSAKSI KASIR BARU & POTONG STOK
router.post("/", async (req, res) => {
  try {
    const { items, diskon, metodeBayar, bayar, kembali, tglTransaksi } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Keranjang belanja kosong" });
    }

    let itemsDetail = [];
    let subtotal = 0;
    let totalHpp = 0;

    for (const item of items) {
      const targetId = item._id || item.id || item.obat;

      const obat = await Obat.findOne({
        $or: [{ _id: targetId }, { idObat: targetId }],
      });

      if (!obat) {
        return res.status(404).json({ message: `Obat (${item.nama || targetId}) tidak ditemukan di katalog!` });
      }

      if (obat.stok < item.qty) {
        return res.status(400).json({ message: `Stok ${obat.nama} tidak mencukupi! Sisa: ${obat.stok}` });
      }

      const itemHpp = Number(obat.hargaBeli || 0);
      const itemHargaJual = Number(item.hargaJual || obat.hargaJual);
      if (itemHargaJual < itemHpp) {
        return res.status(400).json({
          message: `Transaksi dibatalkan! Harga jual ${obat.nama} (Rp${itemHargaJual}) lebih kecil dari harga modal (Rp${itemHpp}).`,
        });
      }

      // Potong Stok Catalog
      obat.stok = Number(obat.stok) - Number(item.qty);

      if (item.hargaJual && Number(item.hargaJual) !== obat.hargaJual) {
        obat.hargaJual = Number(item.hargaJual);
      }

      await obat.save();

      const itemSubtotal = itemHargaJual * Number(item.qty);
      const itemLaba = (itemHargaJual - itemHpp) * Number(item.qty);

      subtotal += itemSubtotal;
      totalHpp += itemHpp * Number(item.qty);

      itemsDetail.push({
        obat: obat._id,
        nama: obat.nama,
        qty: Number(item.qty),
        hargaBeli: itemHpp,
        hargaJual: itemHargaJual,
        subtotal: itemSubtotal,
        labaKotorItem: itemLaba,
        tipeBarang: obat.tipeBarang || item.tipeBarang || null,
      });
    }

    const totalBayar = subtotal - Number(diskon || 0);
    const totalLabaKotor = totalBayar - totalHpp;

    const penjualanBaru = new Penjualan({
      noStruk: `STR-${Date.now().toString().slice(-6)}`,
      items: itemsDetail,
      subtotal,
      diskon: Number(diskon || 0),
      totalBayar,
      totalHpp,
      totalLabaKotor,
      metodeBayar,
      bayar: Number(bayar),
      kembali: Number(kembali),
      createdAt: tglTransaksi ? new Date(tglTransaksi) : new Date(),
    });

    await penjualanBaru.save();

    // 🎯 AMBIL ULANG DENGAN POPULATE OBAT & TIPE BARANG DARI KATALOG
    const populated = await Penjualan.findById(penjualanBaru._id).populate({
      path: "items.obat",
      populate: { path: "tipeBarang" },
    });

    res.status(201).json({ message: "Transaksi berhasil disimpan!", data: populated });
  } catch (error) {
    console.error("Error POST /api/penjualan:", error);
    res.status(500).json({ message: error.message });
  }
});

// 2. GET REKAP LAPORAN PENJUALAN & KEUNTUNGAN
router.get("/laporan", verifyOwner, async (req, res) => {
  try {
    const { tglAwal, tglAkhir } = req.query;
    let filter = {};

    if (tglAwal && tglAkhir) {
      const startDate = new Date(tglAwal);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(tglAkhir);
      endDate.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const daftarPenjualan = await Penjualan.find(filter)
      .populate({
        path: "items.obat",
        populate: { path: "tipeBarang" },
      })
      .sort({ createdAt: -1 });

    let totalOmset = 0;
    let totalModalHpp = 0;
    let totalLabaKotor = 0;

    const formattedPenjualan = daftarPenjualan.map((p) => {
      const obj = p.toObject();

      obj.items = (obj.items || []).map((item) => {
        const tipeObj = item.tipeBarang || item.obat?.tipeBarang || null;
        return {
          ...item,
          tipeBarang: tipeObj,
        };
      });

      const omset = Number(obj.totalBayar || obj.grandTotal || 0);
      const laba = Number(obj.totalLabaKotor || obj.totalLaba || 0);
      const hpp = Number(obj.totalHpp || obj.totalModal || omset - laba || 0);

      totalOmset += omset;
      totalLabaKotor += laba;
      totalModalHpp += hpp;

      return obj;
    });

    res.json({
      ringkasan: {
        totalOmset,
        totalModalHpp,
        totalLabaKotor,
        totalTransaksi: formattedPenjualan.length,
      },
      dataPenjualan: formattedPenjualan,
    });
  } catch (error) {
    console.error("Error GET /api/penjualan/laporan:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
