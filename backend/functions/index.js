// index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment-timezone');
const express = require('express');

// Inisialisasi Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Timezone ke Jakarta
const TIMEZONE = 'Asia/Jakarta';

// --- Placeholder WA Notification ---
function sendWhatsAppNotification(to, name, status, time) {
    // Logic untuk memanggil API WA Bot Self-Hosted/Gratis di sini
    console.log(`[WA PENDING] Kirim notifikasi ke ${to}: ${name} absen ${status} pukul ${time}`);
    // Contoh: axios.post('URL_WA_API', data);
    return true; 
}

// --- 1. FIREBASE FUNCTION: submitAbsensi (Dipanggil oleh ESP32) ---
app.post('/', async (req, res) => {
    const uid_rfid = req.body.uid;

    if (!uid_rfid) {
        return res.status(400).json({ status: 'ERROR', message: 'UID Missing' });
    }

    const currentMoment = moment().tz(TIMEZONE);
    const currentDate = currentMoment.format('YYYY-MM-DD');
    const currentTime = currentMoment.format('HH:mm:ss');
    const dayOfWeek = currentMoment.isoWeekday(); // 1 (Mon) - 7 (Sun)

    // A. Cek Hari Libur Otomatis (Sabtu & Minggu)
    if (dayOfWeek === 6 || dayOfWeek === 7) {
        return res.status(200).json({ status: 'HARI_LIBUR', message: 'Absensi tutup weekend.' });
    }

    try {
        // B. Cek Tanggal Merah (koleksi hari_libur)
        const liburSnapshot = await db.collection('hari_libur').where('tanggal', '==', currentDate).get();
        if (!liburSnapshot.empty) {
            return res.status(200).json({ status: 'HARI_LIBUR', message: 'Absensi tutup hari libur nasional.' });
        }

        // C. Cari Pengguna
        const userSnapshot = await db.collection('pengguna').where('uidRfid', '==', uid_rfid).limit(1).get();

        if (userSnapshot.empty) {
            // KARTU BELUM TERDAFTAR
            return res.status(200).json({ status: 'BELUM_TERDAFTAR', message: 'Kartu belum terdaftar.' });
        }

        const userData = userSnapshot.docs[0].data();
        const userId = userSnapshot.docs[0].id;
        
        // D. Cek Log Absensi Hari Ini
        const logSnapshot = await db.collection('absensi_log')
            .where('userId', '==', userId)
            .where('tanggalAbsen', '==', currentDate)
            .orderBy('waktuAbsen', 'desc')
            .limit(1)
            .get();

        let status_notif = 'HADIR';
        let logMessage = `${userData.nama} telah absen HADIR pukul ${currentTime}`;

        if (!logSnapshot.empty) {
            // Sudah ada log hari ini, catat sebagai PULANG
            status_notif = 'PULANG';
            logMessage = `${userData.nama} telah absen PULANG pukul ${currentTime}`;
        }
        
        // E. Catat Absensi Baru
        await db.collection('absensi_log').add({
            userId: userId,
            waktuAbsen: admin.firestore.Timestamp.now(),
            tanggalAbsen: currentDate,
            statusKehadiran: status_notif.toLowerCase(),
            tipePengguna: userData.tipe
        });

        // F. Notifikasi WA
        sendWhatsAppNotification(userData.noWa, userData.nama, status_notif, currentTime);

        return res.status(200).json({ 
            status: 'ABSENSI_SUKSES', 
            message: logMessage, 
            user: userData.nama,
            kehadiran: status_notif 
        });

    } catch (error) {
        console.error("Absensi Error:", error);
        return res.status(500).json({ status: 'SERVER_ERROR', message: 'Internal Server Error.' });
    }
});

// Export fungsi yang akan di-deploy
exports.submitAbsensi = functions.https.onRequest(app);

// exports.exportExcel = functions.https.onRequest(...) // Function untuk Export Excel
// exports.manageUser = functions.https.onRequest(...) // Function untuk CRUD Pengguna
