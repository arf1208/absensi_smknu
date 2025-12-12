// login.js

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('login-error');

// Cek apakah user sudah login
if (sessionStorage.getItem('admin_logged_in') === 'true') {
    window.location.href = 'dashboard.html';
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = ''; 

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    try {
        // 1. Cari pengguna di koleksi 'admin'
        const adminRef = db.collection('admin').where('username', '==', usernameInput);
        const snapshot = await adminRef.get();

        if (snapshot.empty) {
            errorMessage.textContent = "Username atau Password salah.";
            return;
        }

        const adminData = snapshot.docs[0].data();
        const storedHash = adminData.passwordHash;

        // 2. Verifikasi Password dengan Hash
        // Password default: 'admin123' -> Hash: '$2a$10$i/R149zDqK11jGz2oYh9zOTLp0gP.1X4mH2w7v/A6.v5H7UjW0Y8X'
        
        // Perhatikan: Fungsi compare dari bcryptjs memerlukan 3 parameter. 
        // Hasilnya adalah true/false
        const isMatch = await bcrypt.compare(passwordInput, storedHash); 
        
        if (isMatch) {
            sessionStorage.setItem('admin_logged_in', 'true');
            sessionStorage.setItem('admin_user', adminData.namaLengkap);
            window.location.href = 'dashboard.html'; 
        } else {
            errorMessage.textContent = "Username atau Password salah.";
        }

    } catch (error) {
        console.error("Login Error:", error);
        errorMessage.textContent = "Koneksi database gagal. Cek konsol.";
    }
});
