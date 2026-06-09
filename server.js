const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({ status: 'KreditAz Backend işləyir ✅' });
});

// SMS göndər
app.post('/send-sms', async (req, res) => {
  const { phone, code } = req.body;
  try {
    await axios.post('https://smsc.kz/sys/send.php', null, {
      params: {
        login: process.env.SMS_LOGIN,
        psw: process.env.SMS_PASSWORD,
        phones: '+994' + phone,
        mes: `KreditAz: Təsdiq kodunuz: ${code}`,
        fmt: 3
      }
    });
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// Qeydiyyat saxla
app.post('/register', async (req, res) => {
  const data = req.body;
  try {
    const db = require('./firebase');
    await db.collection('users').add({
      ...data,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    res.json({ success: true, message: 'Qeydiyyat tamamlandı' });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// Giriş yoxla
app.post('/login', async (req, res) => {
  const { fin, password } = req.body;
  try {
    const db = require('./firebase');
    const snap = await db.collection('users')
      .where('fin', '==', fin).limit(1).get();
    if (snap.empty) return res.json({ success: false, message: 'İstifadəçi tapılmadı' });
    const user = snap.docs[0].data();
    if (user.password !== password) return res.json({ success: false, message: 'Şifrə yanlışdır' });
    res.json({ success: true, user: { name: user.fname, fin: user.fin } });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda işləyir`));
