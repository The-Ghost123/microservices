const productModel = require('../models/productModel');
const { validateImage } = require('../helpers/imageValidator');

// GET /products - Ambil semua produk
async function index(req, res) {
    try {
        const products = await productModel.getAllProducts();
        res.json({
            message: 'Berhasil mengambil data produk',
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal mengambil data produk',
            error: error.message,
        });
    }
}

// GET /products/:id - Ambil produk berdasarkan ID
async function show(req, res) {
    try {
        const product = await productModel.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan',
            });
        }
        res.json({
            message: 'Berhasil mengambil data produk',
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal mengambil data produk',
            error: error.message,
        });
    }
}

// POST /products - Buat produk baru
async function create(req, res) {
    try {
        const { name, description, price, stock, image } = req.body;

        // Validasi field wajib non-image
        if (!name || price === undefined || price === null) {
            return res.status(400).json({
                message: 'Field name dan price wajib diisi',
            });
        }

        // Validasi image Base64
        const imgValidation = validateImage(image);
        if (!imgValidation.valid) {
            return res.status(400).json({
                message: imgValidation.error,
            });
        }

        const product = await productModel.createProduct({
            name,
            description,
            price,
            stock,
            image: imgValidation.clean, // simpan Base64 tanpa prefix Data URI
        });

        res.status(201).json({
            message: 'Produk berhasil dibuat',
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal membuat produk',
            error: error.message,
        });
    }
}

// PUT /products/:id - Update produk berdasarkan ID
async function update(req, res) {
    try {
        const existing = await productModel.getProductById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan',
            });
        }

        const { name, description, price, stock, image } = req.body;

        // Validasi image Base64
        const imgValidation = validateImage(image);
        if (!imgValidation.valid) {
            return res.status(400).json({
                message: imgValidation.error,
            });
        }

        const updated = await productModel.updateProduct(req.params.id, {
            name,
            description,
            price,
            stock,
            image: imgValidation.clean, // simpan Base64 tanpa prefix Data URI
        });

        res.json({
            message: 'Produk berhasil diperbarui',
            data: updated,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal memperbarui produk',
            error: error.message,
        });
    }
}

// DELETE /products/:id - Hapus produk berdasarkan ID
async function destroy(req, res) {
    try {
        const existing = await productModel.getProductById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan',
            });
        }

        await productModel.deleteProduct(req.params.id);
        res.json({
            message: 'Produk berhasil dihapus',
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal menghapus produk',
            error: error.message,
        });
    }
}

module.exports = { index, show, create, update, destroy };