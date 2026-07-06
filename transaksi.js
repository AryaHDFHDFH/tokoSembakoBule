/**
 * transaksi.js
 * Untuk halaman checkout.html (form dengan id: shippingName, shippingPhone, shippingAddress, dll)
 * Terintegrasi dengan localStorage: sembako_cart, registered_users, activeSessionUser, checkouts
 */

document.addEventListener('DOMContentLoaded', () => {
    // =============================================
    // 1. VALIDASI USER & AMBIL DATA SESSION
    // =============================================
    const activeUser = localStorage.getItem('activeSessionUser');
    const activeFullName = localStorage.getItem('activeSessionFullName');
    
    // Ambil seluruh data user untuk mendapatkan alamat & telepon (jika ada)
    const allUsers = JSON.parse(localStorage.getItem('registered_users') || "[]");
    const currentUser = allUsers.find(u => u.username === activeUser);

    if (!activeUser) {
        alert("Anda harus login untuk melakukan checkout!");
        window.location.href = 'login.html';
        return;
    }

    // =============================================
    // 2. AMBIL DATA KERANJANG (sembako_cart) & PRODUK
    // =============================================
    const cart = JSON.parse(localStorage.getItem('sembako_cart') || "[]");
    const products = JSON.parse(localStorage.getItem('sembako_products') || "[]");
    
    const container = document.getElementById('checkoutItemsList');
    const totalEl = document.getElementById('checkoutTotalLabel');

    if (cart.length === 0) {
        if (container) container.innerHTML = "<p style='text-align:center; padding:20px;'>Keranjang Anda kosong.</p>";
        if (totalEl) totalEl.innerText = "Rp 0";
        // Nonaktifkan tombol submit jika perlu
        const submitBtn = document.querySelector('#checkoutForm button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        return;
    }

    // =============================================
    // 3. RENDER RINGKASAN PESANAN (NOTA BELANJA)
    // =============================================
    let total = 0;
    if (container) {
        container.innerHTML = cart.map(item => {
            const product = products.find(p => String(p.id_product || p.id) === String(item.product_id || item.id));
            const name = product ? (product.name_product || product.name) : (item.name || "Produk");
            const price = parseFloat(product ? (product.price || 0) : (item.price || 0));
            const qty = parseInt(item.qty || item.quantity || 1);
            const subtotal = price * qty;
            total += subtotal;

            return `
                <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #e2e8f0;">
                    <div style="font-weight: 600; color: #1a202c;">${escapeHtml(name)}</div>
                    <div style="font-size: 13px; color: #718096;">${qty} x Rp ${price.toLocaleString('id-ID')}</div>
                    <div style="font-weight: 600; color: #1a202c; text-align: right;">Rp ${subtotal.toLocaleString('id-ID')}</div>
                </div>
            `;
        }).join('');
    }
    if (totalEl) totalEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;

    // =============================================
    // 4. AUTO-FILL DATA PENGIRIMAN (sesuai elemen HTML)
    // =============================================
    const nameInput = document.getElementById('shippingName');
    const phoneInput = document.getElementById('shippingPhone');
    const addressInput = document.getElementById('shippingAddress');

    if (nameInput) nameInput.value = activeFullName || "";
    if (phoneInput && currentUser) {
        phoneInput.value = currentUser.phone || currentUser.whatsapp || "";
    }
    if (addressInput && currentUser) {
        addressInput.value = currentUser.address || "";
    }

    // =============================================
    // 5. HANDLE SUBMIT PESANAN (CHECKOUT)
    // =============================================
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Ambil data tambahan dari form
            const shippingAddress = addressInput ? addressInput.value.trim() : "";
            const shippingPhone = phoneInput ? phoneInput.value.trim() : "";
            const shippingName = nameInput ? nameInput.value.trim() : "";
            const bankName = document.getElementById('bankName') ? document.getElementById('bankName').value.trim() : "";
            const fileInput = document.getElementById('proofImage');

            // Validasi alamat & bukti bayar
            if (!shippingAddress) {
                alert("Alamat pengiriman wajib diisi!");
                return;
            }
            if (!fileInput || !fileInput.files[0]) {
                alert("Mohon unggah bukti pembayaran!");
                return;
            }

            // Konversi gambar bukti transfer ke base64
            const reader = new FileReader();
            reader.onload = function(event) {
                // Format items sesuai kebutuhan (untuk ditampilkan di riwayat & admin)
                const itemsFormatted = cart.map(item => {
                    const product = products.find(p => String(p.id_product || p.id) === String(item.product_id || item.id));
                    const name = product ? (product.name_product || product.name) : (item.name || "Produk");
                    const price = parseFloat(product ? (product.price || 0) : (item.price || 0));
                    const qty = parseInt(item.qty || item.quantity || 1);
                    return {
                        name: name,
                        qty: qty,
                        price: price
                    };
                });

                // Buat objek order dengan format yang sama seperti sebelumnya
                const newOrder = {
                    id_order: "TRX-" + Date.now(),
                    username: activeUser,
                    full_name: activeFullName,
                    date_order: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
                    total_price: total,
                    status_order: "pending",
                    items: itemsFormatted,
                    // Data tambahan pengiriman & pembayaran
                    user_info: {
                        name: shippingName,
                        phone: shippingPhone,
                        address: shippingAddress,
                        bank: bankName
                    },
                    proof_image: event.target.result, // base64 gambar
                    date_timestamp: new Date().toLocaleString('id-ID')
                };

                // Simpan ke array 'checkouts' (dibaca oleh admin di pesanan.html & dashboard)
                let orders = JSON.parse(localStorage.getItem('checkouts') || "[]");
                orders.push(newOrder);
                localStorage.setItem('checkouts', JSON.stringify(orders));

                // Juga simpan ke 'sembako_orders' untuk riwayat user (opsional, tapi baik untuk konsistensi)
                let userOrders = JSON.parse(localStorage.getItem('sembako_orders') || "[]");
                userOrders.push(newOrder);
                localStorage.setItem('sembako_orders', JSON.stringify(userOrders));

                // Update total pendapatan (untuk dashboard admin)
                let totalIncome = localStorage.getItem('sembako_total_income');
                if (totalIncome) {
                    totalIncome = parseFloat(totalIncome) + total;
                    localStorage.setItem('sembako_total_income', totalIncome.toString());
                } else {
                    localStorage.setItem('sembako_total_income', total.toString());
                }

                // Kosongkan keranjang
                localStorage.removeItem('sembako_cart');

                alert("Pesanan berhasil dikirim! Silakan cek menu Riwayat.");
                window.location.href = "riwayat.html";
            };
            reader.readAsDataURL(fileInput.files[0]);
        });
    }
});

// =============================================
// HELPER: escapeHtml (untuk keamanan)
// =============================================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}