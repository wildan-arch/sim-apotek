// Middleware sederhana untuk memverifikasi apakah user adalah Owner berdasarkan role
const verifyOwner = (req, res, next) => {
  try {
    // Ambil role dari header custom (misal: x-user-role) atau authorization
    const userRole = req.headers["x-user-role"] || req.headers["authorization"];

    // Cek apakah yang akses adalah owner
    if (userRole !== "owner") {
      return res.status(403).json({ message: "Akses dilarang! Hanya Owner yang berhak mengakses data ini." });
    }

    // Jika lolos, lanjut
    next();
  } catch (error) {
    return res.status(401).json({ message: "Terjadi kesalahan verifikasi akses." });
  }
};

module.exports = { verifyOwner };
