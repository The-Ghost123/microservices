const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
// Naikkan limit ke 3 MB agar payload Base64 image bisa ditampung
app.use(express.json({ limit: '3mb' }));

// endpoint for healthcheck
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'product-service'
    });
});

app.use('/products', productRoutes);

// unknown path
app.use((req, res) => {
    res.status(404).json({
        message: 'Endpoint tidak dikenal'
    });
});

module.exports = app;