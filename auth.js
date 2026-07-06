// ==========================================
// 1. SHOW ALERT - Mengatur tampilan alert
// ==========================================
function showAlert(type, message) {
    // Ambil elemen alert
    const alertError = document.getElementById('alert-error');
    const alertSuccess = document.getElementById('alert-success');
    
    // Sembunyikan semua alert terlebih dahulu
    if (alertError) {
        alertError.style.display = 'none';
        alertError.style.opacity = '0';
    }
    if (alertSuccess) {
        alertSuccess.style.display = 'none';
        alertSuccess.style.opacity = '0';
    }
    
    // Tampilkan alert sesuai jenis
    if (type === 'error' && alertError) {
        alertError.innerHTML = message;
        alertError.style.display = 'block';
        alertError.style.opacity = '1';
        
        // Auto hide setelah 4 detik
        setTimeout(() => {
            alertError.style.opacity = '0';
            setTimeout(() => {
                alertError.style.display = 'none';
            }, 300);
        }, 4000);
        
    } else if (type === 'success' && alertSuccess) {
        alertSuccess.innerHTML = message;
        alertSuccess.style.display = 'block';
        alertSuccess.style.opacity = '1';
        
        // Auto hide setelah 4 detik
        setTimeout(() => {
            alertSuccess.style.opacity = '0';
            setTimeout(() => {
                alertSuccess.style.display = 'none';
            }, 300);
        }, 4000);
    }
}

// ==========================================
// 2. REGISTER - Simpan data user
// ==========================================
function handleRegister(event) {
    event.preventDefault();
    const form = document.getElementById('registerForm');
    
    if (!form) {
        console.error("❌ Form register tidak ditemukan!");
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('registered_users') || "[]");

    const username = form.elements['username']?.value.trim();
    const email = form.elements['email']?.value.trim();
    const password = form.elements['password']?.value;
    const fullname = form.elements['full_name']?.value.trim();
    const phone = form.elements['phone']?.value.trim();
    const address = form.elements['address']?.value.trim();
    
    // Validasi input kosong
    if (!username || !email || !password) {
        showAlert('error', '⚠️ Semua field wajib diisi!');
        return;
    }
    
    // Validasi email
    if (!email.includes('@') || !email.includes('.')) {
        showAlert('error', '⚠️ Email tidak valid!');
        return;
    }
    
    // Validasi password minimal 6 karakter
    if (password.length < 6) {
        showAlert('error', '⚠️ Password minimal 6 karakter!');
        return;
    }
    
    // Cek duplikat username
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        showAlert('error', '⚠️ Username sudah terdaftar!');
        return;
    }
    
    // Cek duplikat email
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showAlert('error', '⚠️ Email sudah terdaftar!');
        return;
    }

    const newUser = {
        id_user: "USR-" + Date.now(),
        username: username,
        fullname: fullname || username,
        email: email,
        whatsapp: phone || "",
        address: address || "",
        password: password,
        join_date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));
    
    showAlert('success', '✅ Registrasi berhasil! Silakan login.');
    
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

// ==========================================
// 3. LOGIN - Validasi user
// ==========================================
function validateUserLogin(event) {
    // CEK APAKAH DIPANGGIL DENGAN EVENT
    if (!event || typeof event.preventDefault !== 'function') {
        // console.log("⚠️ Fungsi login dipanggil tanpa event, diabaikan");
        return false;
    }
    
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const btnLogin = document.getElementById('btn-login');
    
    if (!usernameInput || !passwordInput) {
        console.error("❌ Elemen username atau password tidak ditemukan!");
        return false;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validasi input kosong
    if (!username || !password) {
        showAlert('error', '⚠️ Harap isi username dan password!');
        usernameInput.focus();
        return false;
    }
    
    const users = JSON.parse(localStorage.getItem('registered_users') || "[]");

    // Cek apakah ada user terdaftar
    if (users.length === 0) {
        showAlert('error', '❌ Belum ada akun terdaftar. Silakan daftar terlebih dahulu!');
        return false;
    }

    const validUser = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
    );

    if (validUser) {
        // Loading state
        if (btnLogin) {
            btnLogin.disabled = true;
            btnLogin.textContent = '⏳ Memproses...';
        }
        
        // Catat login log
        let loginLogs = JSON.parse(localStorage.getItem('login_logs') || "[]");

        const sudahLoginHariIni = loginLogs.some(log => 
            log.username === validUser.username && 
            log.date === new Date().toLocaleDateString('id-ID')
        );

        if (!sudahLoginHariIni) {
            loginLogs.push({
                username: validUser.username,
                fullname: validUser.fullname,
                id_user: validUser.id_user,
                email: validUser.email,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString('id-ID')
            });
            localStorage.setItem('login_logs', JSON.stringify(loginLogs));
            // console.log("📝 Login log dicatat untuk:", validUser.username);
        }

        // Simpan session
        localStorage.setItem('activeSessionUser', validUser.username);
        localStorage.setItem('activeSessionFullName', validUser.fullname);
        localStorage.setItem('activeSessionEmail', validUser.email || "");
        localStorage.setItem('activeSessionPhone', validUser.whatsapp || "");
        localStorage.setItem('activeSessionAddress', validUser.address || "");
        localStorage.setItem('activeSessionUserId', validUser.id_user || "");
        
        // console.log("✅ User login berhasil:", validUser.username);
        
        // 🔥 TAMPILKAN ALERT HIJAU (SUKSES)
        showAlert('success', '✅ Login berhasil! Selamat datang kembali, ' + validUser.fullname + '!');
        
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
        
    } else {
        // 🔥 TAMPILKAN ALERT MERAH (ERROR)
        showAlert('error', '❌ Username atau password salah!');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// ==========================================
// 4. UI SYNC - Update tampilan
// ==========================================
function displayActiveUser() {
    const user = localStorage.getItem('activeSessionUser');
    const fullName = localStorage.getItem('activeSessionFullName');
    
    const isLogged = !!user;

    // Nav Desktop
    const guestLinks = document.getElementById('auth-guest-links');
    const userDropdown = document.getElementById('auth-user-dropdown');
    
    if (guestLinks) {
        guestLinks.style.display = isLogged ? 'none' : 'flex';
    }
    if (userDropdown) {
        userDropdown.style.display = isLogged ? 'block' : 'none';
    }
    if (userDropdown && fullName) {
        const userNameEl = document.getElementById('user-nav-name');
        if (userNameEl) userNameEl.textContent = fullName;
    }

    // Sidebar Mobile
    const mobileSidebarUser = document.getElementById('sidebar-user-logged');
    const mobileSidebarGuest = document.getElementById('sidebar-guest-buttons');
    
    if (mobileSidebarUser) {
        mobileSidebarUser.style.display = isLogged ? 'block' : 'none';
    }
    if (mobileSidebarGuest) {
        mobileSidebarGuest.style.display = isLogged ? 'none' : 'flex';
    }
    if (isLogged) {
        const userSidebarEl = document.getElementById('user-sidebar-name');
        if (userSidebarEl) userSidebarEl.textContent = fullName;
    }
}

// ==========================================
// 5. LOGOUT - Hapus session
// ==========================================
function handleLogout(e) {
    if (e) e.preventDefault();
    
    if (!confirm("Apakah Anda yakin ingin logout?")) {
        return;
    }
    
    localStorage.removeItem('activeSessionUser');
    localStorage.removeItem('activeSessionFullName');
    localStorage.removeItem('activeSessionEmail');
    localStorage.removeItem('activeSessionPhone');
    localStorage.removeItem('activeSessionAddress');
    localStorage.removeItem('activeSessionUserId');
    localStorage.removeItem('sembako_cart');
    
    // console.log("✅ User logout");
    window.location.href = "index.html";
}

// ==========================================
// 6. CEK STATUS LOGIN
// ==========================================
function checkLoginStatus() {
    const user = localStorage.getItem('activeSessionUser');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user && (currentPage === 'login.html' || currentPage === 'register.html')) {
        window.location.href = "index.html";
        return false;
    }
    
    const protectedPages = ['profile.html', 'cart.html', 'checkout.html'];
    if (!user && protectedPages.includes(currentPage)) {
        showAlert('error', '⚠️ Silakan login terlebih dahulu!');
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
        return false;
    }
    
    return true;
}

// ==========================================
// 7. INISIALISASI
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Aplikasi dimulai...");
    
    // Sembunyikan alert saat halaman dimuat
    const alertError = document.getElementById('alert-error');
    const alertSuccess = document.getElementById('alert-success');
    if (alertError) alertError.style.display = 'none';
    if (alertSuccess) alertSuccess.style.display = 'none';
    
    // 1. Cek status login
    checkLoginStatus();
    
    // 2. Update UI
    displayActiveUser();
    
    // 3. Logout listener
    document.querySelectorAll('.btn-logout-action, .logout-link').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout(e);
        });
    });

    document.querySelectorAll('a[onclick*="logout"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout(e);
        });
    });
    
    // console.log("✅ Aplikasi siap, menunggu interaksi user...");
});

// ==========================================
// 8. RESET DATA (Debugging)
// ==========================================
function resetAllData() {
    if (confirm("⚠️ Hapus semua data?")) {
        localStorage.clear();
        alert("Semua data telah direset!");
        window.location.reload();
    }
}