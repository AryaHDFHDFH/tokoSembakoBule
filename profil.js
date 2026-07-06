document.addEventListener('DOMContentLoaded', () => {
    // 1. Ambil data sesi (sesuai dengan login.html)
    const username = localStorage.getItem('activeSessionUser');
    const fullName = localStorage.getItem('activeSessionFullName');

    // 2. Jika tidak ada sesi, tendang ke login
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    // 3. Ambil data master untuk mengisi detail lainnya (email/alamat)
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users')) || [];
    const userData = registeredUsers.find(u => u.username === username);

    // 4. Update Navigasi (Tampilkan Logo User, sembunyikan Login/Daftar)
    const guestLinks = document.getElementById('auth-guest-links');
    const userDropdown = document.getElementById('auth-user-dropdown');
    if (guestLinks) guestLinks.style.display = 'none';
    if (userDropdown) userDropdown.style.display = 'block';

    // 5. Update Nama di Navbar & Sidebar
    const userNavName = document.getElementById('user-nav-name');
    const userSidebarName = document.getElementById('user-sidebar-name');
    if (userNavName) userNavName.textContent = fullName;
    if (userSidebarName) userSidebarName.textContent = fullName;

    // 6. Isi form profil
    if (userData) {
        document.getElementById('profileFullName').value = fullName || '';
        document.getElementById('profileEmail').value = userData.email || '';
        document.getElementById('profilePhone').value = userData.whatsapp || '';
        document.getElementById('profileAddress').value = userData.address || '';
    }

    // 7. Handle Submit Form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newName = document.getElementById('profileFullName').value;
            const newPhone = document.getElementById('profilePhone').value;
            const newAddress = document.getElementById('profileAddress').value;

            // Update Sesi
            localStorage.setItem('activeSessionFullName', newName);

            // Update Master Data
            const userIndex = registeredUsers.findIndex(u => u.username === username);
            if (userIndex !== -1) {
                registeredUsers[userIndex].fullname = newName;
                registeredUsers[userIndex].whatsapp = newPhone;
                registeredUsers[userIndex].address = newAddress;
                localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
            }

            alert('Profil berhasil diperbarui!');
            location.reload(); 
        });
    }
});