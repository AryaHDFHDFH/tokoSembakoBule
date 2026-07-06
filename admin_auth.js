function validateUserLogin(event) {
    // 1. Mencegah form melakukan reload halaman
    event.preventDefault();

    // 2. Ambil elemen DOM untuk input, alert, dan tombol
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const alertError = document.getElementById('alert-error');
    const alertSuccess = document.getElementById('alert-success');
    const btnLogin = document.getElementById('btn-login');

    // Sembunyikan alert yang sedang aktif sebelum validasi ulang
    if (alertError) alertError.classList.remove('show');
    if (alertSuccess) alertSuccess.classList.remove('show');

    // 3. Tentukan data Akun Admin untuk simulasi login
    const ADMIN_USERNAME = "admin_Bule";
    const ADMIN_PASSWORD = "admin_buletokosembako";
    const ADMIN_DISPLAY_NAME = "Bule Owner"; // Nama asli admin yang akan ditampilkan di navbar atas

    // 4. Ubah status tombol menjadi Loading sejenak agar terasa realistis
    const originalBtnText = btnLogin.innerText;
    btnLogin.innerText = "Memverifikasi...";
    btnLogin.disabled = true;

    // Gunakan setTimeout singkat (500ms) untuk mensimulasikan jeda proses cek data
    setTimeout(() => {
        
        // 5. Cek apakah username dan password cocok
        if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
            
            // [PERBAIKAN UTAMA]: Set status login ke LocalStorage agar halaman admin bisa mengenali session ini
            localStorage.setItem('admin_logged_in', 'true');
            localStorage.setItem('admin_name', ADMIN_DISPLAY_NAME);

            // Jika benar, tampilkan alert sukses bertema hijau/gold
            if (alertSuccess) {
                alertSuccess.innerText = "Login berhasil! Selamat datang kembali, Admin.";
                alertSuccess.classList.add('show');
            }

            // Redirect ke halaman dashboard admin setelah 1.2 detik
            setTimeout(() => {
                // Menuju ke folder admin/index.html
                window.location.href = "index.html"; 
            }, 1200);

        } else {
            // Jika salah, tampilkan alert error merah
            if (alertError) {
                alertError.innerText = "Username atau Password Admin salah!";
                alertError.classList.add('show');
            }
            
            // Kembalikan tombol ke kondisi awal agar bisa dicoba lagi
            btnLogin.innerText = originalBtnText;
            btnLogin.disabled = false;
        }

    }, 500);
}