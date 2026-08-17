const express = require("express");
const router = express.Router();
const Obat = require("../models/Obat");
const Kategori = require("../models/Kategori");
const Satuan = require("../models/Satuan");
const TipeBarang = require("../models/TipeBarang");

// 1. GET ALL OBAT
router.get("/", async (req, res) => {
  try {
    const { q, kategori } = req.query;
    let queryFilter = {};

    if (q) {
      queryFilter.$or = [{ nama: { $regex: q, $options: "i" } }, { idObat: { $regex: q, $options: "i" } }, { lokasiRak: { $regex: q, $options: "i" } }];
    }

    if (kategori) {
      queryFilter.kategori = kategori;
    }

    const daftarObat = await Obat.find(queryFilter).populate("kategori").populate("satuanTerkecil").populate("satuanBesar").populate("tipeBarang");

    res.json(daftarObat);
  } catch (error) {
    console.error("Error GET /api/obat:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🎯 2. GET HISTORI HARGA OBAT BY ID (SUDAH DIPERBAIKI)
router.get("/:id/histori-harga", async (req, res) => {
  try {
    const { id } = req.params;
    const obat = await Obat.findById(id);
    if (!obat) {
      return res.status(404).json({ message: "Obat tidak ditemukan" });
    }

    // ✅ Kembalikan data historiHarga dari database
    res.json(obat.historiHarga || []);
  } catch (error) {
    console.error("Error GET /api/obat/:id/histori-harga:", error);
    res.status(500).json({ message: error.message });
  }
});

// 3. GET SINGLE OBAT BY ID
router.get("/:id", async (req, res) => {
  try {
    const obat = await Obat.findById(req.params.id).populate("kategori").populate("satuanTerkecil").populate("satuanBesar");

    if (!obat) {
      return res.status(404).json({ message: "Obat tidak ditemukan" });
    }

    res.json(obat);
  } catch (error) {
    console.error("Error GET /api/obat/:id:", error);
    res.status(500).json({ message: error.message });
  }
});

// 4. POST: Tambah Obat Baru
router.post("/", async (req, res) => {
  try {
    const obatBaru = new Obat(req.body);

    // Otomatis catat histori harga pertama kali obat dibuat
    if (req.body.hargaBeli || req.body.hargaJual) {
      obatBaru.historiHarga.push({
        tanggal: new Date(),
        pabrik: req.body.pabrik || "-",
        noFaktur: req.body.noFaktur || "-",
        hargaBeli: Number(req.body.hargaBeli || 0),
        hargaJual: Number(req.body.hargaJual || 0),
      });
    }

    const saved = await obatBaru.save();
    const populated = await Obat.findById(saved._id).populate("kategori").populate("satuanTerkecil").populate("satuanBesar").populate("tipeBarang");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Error POST /api/obat:", err);
    res.status(400).json({ error: err.message });
  }
});

// 5. PUT: STOK OPNAME BULK
router.put("/stok-opname-bulk", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Daftar item opname tidak boleh kosong!" });
    }

    const hasilUpdate = [];

    for (const item of items) {
      const { _id, stokFisik, expiredDate, noBatch } = item;
      if (!_id) continue;

      const obat = await Obat.findById(_id);
      if (obat) {
        if (stokFisik !== undefined && stokFisik !== null && !isNaN(stokFisik)) {
          obat.stok = Number(stokFisik);
        }

        if (expiredDate) {
          obat.expiredDate = new Date(expiredDate);
        }

        if (noBatch && String(noBatch).trim() !== "") {
          obat.noBatch = String(noBatch).trim();
        }

        obat.terakhirOpname = new Date();
        await obat.save();

        hasilUpdate.push({
          _id: obat._id,
          nama: obat.nama,
          stokBaru: obat.stok,
        });
      }
    }

    return res.json({
      success: true,
      message: `Berhasil meng-update ${hasilUpdate.length} obat di database!`,
      data: hasilUpdate,
    });
  } catch (error) {
    console.error("🔥 Error Detail Stok Opname:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 🎯 6. PUT: Edit / Update Data Obat By ID (DENGAN PENCATATAN HISTORI HARGA)
router.put("/:id", async (req, res) => {
  try {
    const obat = await Obat.findById(req.params.id);
    if (!obat) {
      return res.status(404).json({ message: "Obat tidak ditemukan" });
    }

    // Cek apakah ada perubahan harga beli atau harga jual
    const adaPerubahanHarga = (req.body.hargaBeli && Number(req.body.hargaBeli) !== obat.hargaBeli) || (req.body.hargaJual && Number(req.body.hargaJual) !== obat.hargaJual);

    if (adaPerubahanHarga) {
      obat.historiHarga.push({
        tanggal: req.body.tglFaktur ? new Date(req.body.tglFaktur) : new Date(),
        pabrik: req.body.pabrik || obat.pabrik || "-",
        noFaktur: req.body.noFaktur || obat.noFaktur || "-",
        hargaBeli: Number(req.body.hargaBeli ?? obat.hargaBeli),
        hargaJual: Number(req.body.hargaJual ?? obat.hargaJual),
      });
    }

    // Update field-field data obat dari request body
    Object.assign(obat, req.body);

    await obat.save();

    const updatedObat = await Obat.findById(obat._id).populate("kategori").populate("satuanTerkecil").populate("satuanBesar");

    res.json(updatedObat);
  } catch (error) {
    console.error("Error PUT /api/obat/:id:", error);
    res.status(500).json({ message: error.message });
  }
});

// 7. DELETE: Hapus Obat By ID
router.delete("/:id", async (req, res) => {
  try {
    const obat = await Obat.findByIdAndDelete(req.params.id);

    if (!obat) {
      return res.status(404).json({ message: "Obat tidak ditemukan" });
    }

    res.json({ message: "Obat berhasil dihapus" });
  } catch (error) {
    console.error("Error DELETE /api/obat/:id:", error);
    res.status(500).json({ message: error.message });
  }
});

// 8. POST CHECKOUT / TRANSAKSI KASIR
router.post("/checkout", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Keranjang belanja kosong" });
    }

    for (const item of items) {
      const obat = await Obat.findById(item._id);

      if (!obat) {
        return res.status(404).json({ message: `Obat ID ${item._id} tidak ditemukan` });
      }

      if (obat.stok < item.qty) {
        return res.status(400).json({ message: `Stok obat ${obat.nama} tidak mencukupi!` });
      }

      obat.stok -= Number(item.qty);
      await obat.save();
    }

    res.json({ message: "Transaksi berhasil, stok obat diperbarui!" });
  } catch (error) {
    console.error("Error POST /api/obat/checkout:", error);
    res.status(500).json({ message: error.message });
  }
});

// 9. POST BULK IMPORT OBAT DARI EXCEL
router.post("/import", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Payload data import kosong." });
    }

    let berhasil = 0;
    let dilewati = 0;

    for (const item of items) {
      const obatEksis = await Obat.findOne({
        $or: [{ idObat: item.idObat }, { nama: item.nama }],
      });

      if (!obatEksis) {
        let kategoriId = null;
        let satuanId = null;

        if (item.kategori) {
          let kat = await Kategori.findOne({ nama: new RegExp(`^${item.kategori}$`, "i") });

          if (!kat) {
            kat = new Kategori({
              nama: item.kategori,
              klasifikasi: item.klasifikasi || "Obat",
            });
            await kat.save();
          }
          kategoriId = kat._id;
        }

        if (item.satuanTerkecil) {
          let sat = await Satuan.findOne({ nama: new RegExp(`^${item.satuanTerkecil}$`, "i") });
          if (!sat) {
            sat = new Satuan({ nama: item.satuanTerkecil });
            await sat.save();
          }
          satuanId = sat._id;
        }

        const obatBaru = new Obat({
          idObat: item.idObat,
          nama: item.nama,
          kategori: kategoriId || item.kategori,
          satuanTerkecil: satuanId || item.satuanTerkecil,
          hargaBeli: item.hargaBeli,
          hargaJual: item.hargaJual,
          stok: item.stok,
          minStok: item.minStok,
          expiredDate: item.expiredDate ? new Date(item.expiredDate) : null,
          historiHarga: [
            {
              tanggal: new Date(),
              pabrik: "-",
              noFaktur: "IMPORT EXCEL",
              hargaBeli: Number(item.hargaBeli || 0),
              hargaJual: Number(item.hargaJual || 0),
            },
          ],
        });

        await obatBaru.save();
        berhasil++;
      } else {
        dilewati++;
      }
    }

    res.json({
      message: `Proses Import Selesai! ${berhasil} obat baru ditambahkan, ${dilewati} obat dilewati karena sudah ada di katalog.`,
    });
  } catch (error) {
    console.error("Error POST /api/obat/import:", error);
    res.status(500).json({ message: error.message || "Gagal melakukan import data." });
  }
});

module.exports = router;
