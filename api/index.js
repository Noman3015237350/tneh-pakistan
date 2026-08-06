// ============================================================
// TNEH PAKISTAN SMS BOMBER - Main Server
// Developer: TNEH GROUP
// ============================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// IMPORT PAKISTAN SMS ROUTER
// ============================================================
const pakistanSmsRouter = require('./sms');

// ============================================================
// ROUTES
// ============================================================

// Root
app.get('/', (req, res) => {
    res.json({
        developer: "TNEH GROUP",
        service: "Pakistan SMS Bomber",
        version: "1.0.0",
        endpoints: {
            create_key: "/api/createkey",
            check_key: "/api/checkkey?key=YOUR_KEY",
            pakistan_bomb: "/api/pakistan?number=03123456789&count=10",
            pakistan_bomb_key: "/api/pakistan?key=YOUR_KEY&number=03123456789&count=10",
            all_apis: "/api/apis"
        },
        features: {
            total_apis: "25+ Pakistan SMS APIs",
            key_required: "Optional (free without key, unlimited with key)",
            count_limit: "50 per API"
        }
    });
});

// Pakistan SMS Routes
app.use('/api', pakistanSmsRouter);

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        developer: "TNEH GROUP",
        available_endpoints: [
            '/',
            '/api/createkey',
            '/api/checkkey',
            '/api/pakistan',
            '/api/apis'
        ]
    });
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        developer: "TNEH GROUP",
        message: err.message
    });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 TNEH PAKISTAN SMS BOMBER RUNNING`);
    console.log(`🌐 Port: ${PORT}`);
    console.log(`📡 Total APIs: 25+`);
    console.log(`\n📋 ENDPOINTS:`);
    console.log(`   🔑 Generate Key: /api/createkey`);
    console.log(`   ✅ Check Key: /api/checkkey?key=YOUR_KEY`);
    console.log(`   📱 Pakistan Bomb: /api/pakistan?number=03123456789&count=10`);
    console.log(`   📱 Pakistan Bomb (Key): /api/pakistan?key=YOUR_KEY&number=03123456789&count=10`);
    console.log(`   📊 All APIs: /api/apis`);
    console.log(`\n✅ Server ready!\n`);
});

module.exports = app;
