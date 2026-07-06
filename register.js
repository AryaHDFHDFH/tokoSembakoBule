// assets/js/register.js

/**
 * Mengatur proses registrasi akun pembeli dan menyimpannya ke LocalStorage
 * @param {Event} event 
 */
function handleRegister(event) {
    event.preventDefault(); // Mencegah form reload halaman

    // Tangkap form element untuk mempermudah pembacaan FormData jika diperlukan
    const form = document.getElementById('registerForm');
    
    // Ambil data nilai input secara dinamis berdasarkan properti name/id
    const fullName = form.elements['full_name'].value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const email = form.elements['email'].value.trim();
    const phone = form.elements['phone'].value.trim();
    const address = form.elements['address'].value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm').value;

    const alertError = document.getElementById('alert-error');
    const alertSuccess = document.getElementById('alert-success');
    const btnRegister = document.getElementById('btn-register');

    // Reset status tampilan alert di awal validasi
    alertError.classList.remove('show');
    alertSuccess.classList.remove('show');

    // 1. Validasi kecocokan password & konfirmasi password
    if (password !== confirmPassword) {
        alertError.innerText = "Password dan konfirmasi password tidak cocok!";
        alertError.classList.add('show');
        return;
    }

    // 2. Ambil data array user yang sudah terdaftar sebelumnya di localStorage
    let registeredUsers = JSON.parse(localStorage.getItem('registered_users')) || [];

    // 3. Validasi keunikan username (Mencegah duplikasi data akun admin/user lain)
    const isUsernameTaken = registeredUsers.some(user => user.username.toLowerCase() === username.toLowerCase());
    if (isUsernameTaken) {
        alertError.innerText = "Username sudah digunakan, silakan pilih username lain.";
        alertError.classList.add('show');
        return;
    }

    // Ubah status tombol menjadi efek loading simulator
    btnRegister.innerText = "Menyimpan data...";
    btnRegister.disabled = true;

    setTimeout(() => {
        // 4. Bangun struktur objek user baru (Sinkron dengan kebutuhan admin-pelanggan.js)
        const userBaru = {
            id_user: "USR-" + Math.floor(1000 + Math.random() * 9000), // Generate ID Unik otomatis
            username: username,
            fullname: fullName,
            email: email,
            whatsapp: phone,
            address: address, // Disimpan cadangan jika dibutuhkan saat checkout pesanan
            password: password, // Digunakan untuk keperluan validasi di login.html
            join_date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        };

        // 5. Masukkan objek baru ke dalam array, lalu simpan ke localStorage
        registeredUsers.push(userBaru);
        localStorage.setItem('registered_users', JSON.stringify(registeredUsers));

        // Tampilkan feedback sukses pendaftaran
        alertSuccess.classList.add('show');

        // Otomatis arahkan (redirect) pengguna ke halaman login setelah 1.5 detik
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    }, 800);
}