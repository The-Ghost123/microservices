const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET    /products       - Ambil semua produk
router.get('/', productController.index);

// GET    /products/:id   - Ambil produk berdasarkan ID
router.get('/:id', productController.show);

// POST   /products       - Buat produk baru
router.post('/', productController.create);

// PUT    /products/:id   - Update produk berdasarkan ID
router.put('/:id', productController.update);

// DELETE /products/:id   - Hapus produk berdasarkan ID
router.delete('/:id', productController.destroy);

module.exports = router;