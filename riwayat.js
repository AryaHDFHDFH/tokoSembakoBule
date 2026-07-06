document.addEventListener('DOMContentLoaded', () => {
    renderRiwayat();
});

function renderRiwayat() {
    const area = document.getElementById('riwayatContentArea');
    const activeUsername = localStorage.getItem('activeSessionUser');
    
    if (!area) return;

    if (!activeUsername) {
        area.innerHTML = `<div class="empty-state"><h3>Silakan login untuk melihat riwayat.</h3></div>`;
        return;
    }

    // Mengambil data dengan aman
    const allOrders = JSON.parse(localStorage.getItem('sembako_orders') || '[]');
    const userOrders = allOrders.filter(order => order.username === activeUsername);

    console.log("📦 Data orders:", allOrders); // Debug: lihat data di console

    if (userOrders.length === 0) {
        area.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>Belum Ada Pesanan</h3>
                <p>Anda belum melakukan transaksi apapun.</p>
                <a href="index.html#produk" class="btn-primary">Mulai Belanja</a>
            </div>`;
        return;
    }

    let html = `
        <div class="table-responsive">
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>ID Pesanan</th>
                        <th>Tanggal Checkout</th>
                        <th>Detail Produk</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>`;

    userOrders.forEach((o, index) => {
        //console.log(`📝 Order ke-${index + 1}:`, o); // Debug: lihat setiap order
        
        // ==========================================
        // 🔥 PERBAIKAN TOTAL - Ambil tanggal dengan cara yang lebih baik
        // ==========================================
        let dateStr = 'N/A';
        
        // Cek semua kemungkinan field tanggal
        const possibleDateFields = [
            'order_date',
            'checkout_date', 
            'created_at',
            'createdAt',
            'date',
            'tanggal',
            'timestamp',
            'time',
            'updated_at'
        ];
        
        for (const field of possibleDateFields) {
            if (o[field]) {
                try {
                    let dateValue = o[field];
                    
                    // Jika timestamp dalam milidetik
                    if (typeof dateValue === 'number') {
                        const dateObj = new Date(dateValue);
                        if (!isNaN(dateObj)) {
                            dateStr = dateObj.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                            break;
                        }
                    }
                    
                    // Jika string date
                    if (typeof dateValue === 'string') {
                        // Coba parse sebagai ISO string
                        let dateObj = new Date(dateValue);
                        if (!isNaN(dateObj)) {
                            dateStr = dateObj.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                            break;
                        }
                        
                        // Coba parse sebagai format lain (misal: "22/06/2026")
                        const parts = dateValue.split(/[/\-.]/);
                        if (parts.length === 3) {
                            let day = parseInt(parts[0]);
                            let month = parseInt(parts[1]) - 1;
                            let year = parseInt(parts[2]);
                            
                            // Coba format DD/MM/YYYY
                            if (day > 0 && day <= 31 && month >= 0 && month <= 11) {
                                const dateObj = new Date(year, month, day);
                                if (!isNaN(dateObj)) {
                                    dateStr = dateObj.toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    });
                                    break;
                                }
                            }
                            
                            // Coba format MM/DD/YYYY
                            day = parseInt(parts[1]);
                            month = parseInt(parts[0]) - 1;
                            year = parseInt(parts[2]);
                            if (day > 0 && day <= 31 && month >= 0 && month <= 11) {
                                const dateObj = new Date(year, month, day);
                                if (!isNaN(dateObj)) {
                                    dateStr = dateObj.toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    });
                                    break;
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`⚠️ Gagal parse tanggal untuk field ${field}:`, e);
                }
            }
        }
        
        // Jika masih N/A, gunakan tanggal sekarang sebagai fallback
        if (dateStr === 'N/A') {
            const now = new Date();
            dateStr = now.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            console.warn(`⚠️ Tidak ada tanggal valid, menggunakan tanggal sekarang: ${dateStr}`);
        }

        // Penanganan data items
        let items = [];
        try {
            items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
        } catch (e) { 
            items = []; 
        }

        const itemsList = items.map(item => 
            `• ${item.name || item.nama_produk || "Produk"} (${item.qty || item.quantity || 0}x)`
        ).join('<br>');

        // Ambil ID dengan aman
        const orderIdFull = o.id_order || o.id || "TRX-" + Date.now();
        const orderIdDisplay = orderIdFull.includes('-') ? orderIdFull.split('-')[1] : orderIdFull;

        // Status dengan warna
        let statusColor = '#e2e8f0';
        let statusText = o.status_order || o.status || 'pending';
        
        if (statusText.toLowerCase() === 'pending') {
            statusColor = '#fef3c7';
            statusText = '⏳ Pending';
        } else if (statusText.toLowerCase() === 'success' || statusText.toLowerCase() === 'completed' || statusText.toLowerCase() === 'selesai') {
            statusColor = '#dcfce7';
            statusText = '✅ Selesai';
        } else if (statusText.toLowerCase() === 'failed' || statusText.toLowerCase() === 'cancelled' || statusText.toLowerCase() === 'batal') {
            statusColor = '#fee2e2';
            statusText = '❌ Gagal';
        } else if (statusText.toLowerCase() === 'processing' || statusText.toLowerCase() === 'diproses') {
            statusColor = '#dbeafe';
            statusText = '🔄 Diproses';
        }

        const totalHarga = parseInt(o.total_price || o.total || o.total_harga || 0);

        html += `
            <tr>
                <td style="font-weight:600;">#${orderIdDisplay}</td>
                <td><strong>${dateStr}</strong></td>
                <td style="font-size: 12px; color: #4a5568; line-height: 1.8;">${itemsList || '-'}</td>
                <td style="font-weight:600; color: #667eea;">Rp ${totalHarga.toLocaleString('id-ID')}</td>
                <td>
                    <span style="padding: 4px 10px; border-radius: 4px; background: ${statusColor}; font-size: 12px; font-weight: 500;">
                        ${statusText}
                    </span>
                </td>
                <td>
                    <a href="cetak.html?id=${orderIdFull}" class="btn-outline" style="padding: 5px 12px; border: 1px solid #667eea; color: #667eea; border-radius: 6px; text-decoration: none; font-size: 12px; display: inline-block;">
                        🖨️ Cetak
                    </a>
                </td>
            </tr>`;
    });

    html += `</tbody></table></div>`;
    area.innerHTML = html;
}

// ==========================================
// FUNGSI TAMBAHAN: Format tanggal dengan jam
// ==========================================
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return 'N/A';
        
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'N/A';
    }
}

// ==========================================
// FUNGSI TAMBAHAN: Format tanggal saja
// ==========================================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return 'N/A';
        
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return 'N/A';
    }
}