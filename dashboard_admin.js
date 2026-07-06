document.addEventListener('DOMContentLoaded', () => {
    // 1. AMBIL DATA
    const users = JSON.parse(localStorage.getItem('registered_users') || "[]");
    const products = JSON.parse(localStorage.getItem('sembako_products') || "[]");
    const orders = JSON.parse(localStorage.getItem('checkouts') || "[]");
    const loginLogs = JSON.parse(localStorage.getItem('login_logs') || "[]");

    // HITUNG USER YANG PERNAH LOGIN (UNIK)
    const uniqueLoggedInUsers = new Set();
    const lastLoginMap = new Map(); // Untuk track terakhir login
    
    loginLogs.forEach(log => {
        if (log.username) {
            uniqueLoggedInUsers.add(log.username);
            // Simpan timestamp terakhir login
            if (!lastLoginMap.has(log.username) || new Date(log.timestamp) > new Date(lastLoginMap.get(log.username).timestamp)) {
                lastLoginMap.set(log.username, log);
            }
        }
    });
    
    const totalPernahLogin = uniqueLoggedInUsers.size;

    // 2. TAMPILKAN KE UI
    const userValEl = document.getElementById('total-user-val');
    const prodValEl = document.getElementById('total-produk-val');
    const orderValEl = document.getElementById('total-pesanan-val');
    const incomeValEl = document.getElementById('total-pendapatan-val');
    const loginStatsEl = document.getElementById('login-stats-val'); // Card tambahan

    // Tampilkan total user dengan detail
    if (userValEl) {
        userValEl.innerHTML = `${users.length} <span style="font-size: 11px; font-weight: normal;">(terdaftar)</span><br>
                               <small style="font-size: 11px; color: #4CAF50;">✅ ${totalPernahLogin} pernah login</small>`;
    }
    
    // Update stat login jika ada elemen terpisah
    if (loginStatsEl) {
        loginStatsEl.textContent = totalPernahLogin;
    }
    
    if (prodValEl) prodValEl.textContent = products.length;
    if (orderValEl) orderValEl.textContent = orders.length;

    // Hitung pendapatan
    const totalPendapatan = orders.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);
    if (incomeValEl) {
        incomeValEl.textContent = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(totalPendapatan);
    }

    // 3. RENDER TABEL PESANAN
    const tableBody = document.getElementById('dashboardTableBody');
    if (tableBody) {
        tableBody.innerHTML = ''; 

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Belum ada pesanan masuk.</td></tr>';
        } else {
            orders.forEach(order => {
                tableBody.innerHTML += `
                    <tr style="border-bottom: 1px solid #edf2f7;">
                        <td style="padding: 15px; font-size: 14px;">${order.id_order || '-'}</td>
                        <td style="padding: 15px; font-size: 14px;">${order.buyer_name || 'Guest'}</td>
                        <td style="padding: 15px; font-size: 14px;">Rp ${parseInt(order.total_price || 0).toLocaleString('id-ID')}</td>
                        <td style="padding: 15px;">
                            <span class="badge" style="padding: 5px 10px; border-radius: 4px; font-size: 12px; background: ${getStatusColor(order.status)}; color: white;">
                                ${order.status || 'Pending'}
                            </span>
                        </td>
                        <td style="padding: 15px; text-align: center;">
                            <button onclick="viewDetail('${order.id_order}')" style="background:none; border:none; color:var(--gold); cursor:pointer;">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    }

    // 4. RENDER TABEL USER LOGIN (opsional - untuk monitoring detail)
    renderUserLoginTable(loginLogs, lastLoginMap);
});

// Fungsi untuk menampilkan tabel user login
function renderUserLoginTable(loginLogs, lastLoginMap) {
    const userTableBody = document.getElementById('userLoginTableBody');
    if (!userTableBody) return; // Jika elemen tidak ada, skip
    
    userTableBody.innerHTML = '';
    
    if (loginLogs.length === 0) {
        userTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Belum ada user yang login.</td></tr>';
        return;
    }
    
    // Ambil data user terbaru dari loginLogs (unique per user)
    const uniqueUsers = Array.from(lastLoginMap.values());
    
    if (uniqueUsers.length === 0) {
        userTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Belum ada data login.</td></tr>';
        return;
    }
    
    uniqueUsers.forEach(user => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #edf2f7';
        row.innerHTML = `
            <td style="padding: 12px; font-size: 14px;">${user.username || '-'}</td>
            <td style="padding: 12px; font-size: 14px;">${user.fullname || '-'}</td>
            <td style="padding: 12px; font-size: 14px;">${formatDate(user.timestamp)}</td>
            <td style="padding: 12px; font-size: 14px;">${user.date || '-'}</td>
        `;
        userTableBody.appendChild(row);
    });
}

// Helper function format tanggal
function formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Pastikan fungsi ini tersedia di scope global
function getStatusColor(status) {
    if (!status) return '#6c757d';
    switch(status.toLowerCase()) {
        case 'selesai': return '#28a745';
        case 'pending': return '#ffc107';
        case 'proses': return '#007bff';
        case 'dikirim': return '#17a2b8';
        default: return '#6c757d';
    }
}

// Fungsi untuk melihat detail pesanan (tambahkan jika belum ada)
window.viewDetail = function(orderId) {
    if (orderId) {
        // Simpan ID pesanan ke session untuk ditampilkan di halaman detail
        localStorage.setItem('detail_order_id', orderId);
        window.location.href = 'order_detail.html';
    } else {
        alert('ID Pesanan tidak ditemukan');
    }
};

// Fungsi untuk reset data login log (opsional - untuk admin)
window.resetLoginLogs = function() {
    if (confirm('Yakin ingin mereset semua data login log? Data ini tidak bisa dikembalikan!')) {
        localStorage.removeItem('login_logs');
        alert('Data login log telah direset');
        location.reload();
    }
};