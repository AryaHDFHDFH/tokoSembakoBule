/**
 * Logic Detail Produk - Toko Sembako Bule Sisi User
 * Sinkronisasi data real-time & perbaikan render gambar Base64 / Local Assets
 */

// 1. Ambil data produk real milik admin dari LocalStorage
function getProductsFromAdmin() {
    let data = localStorage.getItem('sembako_products') || localStorage.getItem('products');
    return data ? JSON.parse(data) : [];
}

// 2. Ambil parameter ID produk dari URL browser
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 3. Fungsi Utama: Render Konten Detail ke HTML
function renderProductDetail() {
    const targetContainer = document.getElementById('detailViewContainer');
    if (!targetContainer) return;

    const productId = getProductIdFromURL();
    if (!productId) {
        renderErrorPage("ID Produk tidak ditemukan dalam tautan.");
        return;
    }

    const products = getProductsFromAdmin();
    // Cari produk berdasarkan ID (konversi ke string agar kecocokan tipe data aman)
    const product = products.find(p => String(p.id_product || p.id) === String(productId));

    if (!product) {
        renderErrorPage("Maaf, produk sembako tidak ditemukan atau telah dihapus oleh admin.");
        return;
    }

    // --- LOGIKA PENGAMANAN & DETEKSI GAMBAR ---
    const image = product.image_product || product.image || "";
    let imgPath = 'https://via.placeholder.com/500x500?text=No+Image';
    
    if (image) {
        if (image.startsWith('data:image')) {
            imgPath = image; // Gambar Base64 hasil upload admin langsung dibaca
        } else {
            // Gambar default bawaan asset lokal
            imgPath = `assets/images/products/${image}`;
        }
    }

    // Ambil properti pendukung secara aman
    const name = product.name_product || product.name || "Produk Sembako";
    const price = product.price || 0;
    const stock = product.stock || 0;
    const category = product.category_product || product.name_category || "Sembako";
    const description = product.description || "Tidak ada deskripsi untuk produk ini.";

    // Render komponen grid ke dalam main container
    targetContainer.innerHTML = `
        <div class="detail-container">
            <div class="detail-img-box">
                <img src="${imgPath}" alt="${escapeHTML(name)}" id="detailProductImage" onerror="this.src='https://via.placeholder.com/500x500?text=No+Image'">
            </div>

            <div class="detail-info">
                <span class="detail-category">${escapeHTML(category)}</span>
                <h1 class="detail-title">${escapeHTML(name)}</h1>
                <div class="detail-price">${formatRupiah(price)}</div>
                
                <div class="detail-stock" style="${stock <= 0 ? 'background: #FADBD8; color: #E74C3C;' : ''}">
                    <i class="fas ${stock <= 0 ? 'fa-times-circle' : 'fa-check-circle'}"></i> 
                    Stok Tersedia: <strong>${stock} pcs</strong>
                </div>

                <p class="detail-desc">${escapeHTML(description)}</p>

                <div class="add-to-cart-form">
                    <input type="number" id="purchaseQty" class="qty-input" value="1" min="1" max="${stock}" ${stock <= 0 ? 'disabled' : ''}>
                    <button onclick="handleAddToCart('${product.id_product || product.id}')" class="btn-primary" ${stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> Masukkan Keranjang
                    </button>
                </div>

                <a href="produk.html" class="btn-outline" style="text-decoration: none;">
                    <i class="fas fa-arrow-left"></i> Kembali ke Katalog
                </a>
            </div>
        </div>
    `;
}

// 4. Handler Aksi Tambah ke Keranjang Belanja dengan Jumlah (Qty)
function handleAddToCart(productId) {
    const qtyInput = document.getElementById('purchaseQty');
    const qtyToAdd = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

    let cart = localStorage.getItem('sembako_cart') ? JSON.parse(localStorage.getItem('sembako_cart')) : [];
    let existingItem = cart.find(item => String(item.product_id) === String(productId));

    if (existingItem) {
        existingItem.qty += qtyToAdd;
    } else {
        cart.push({ product_id: productId, qty: qtyToAdd });
    }

    localStorage.setItem('sembako_cart', JSON.stringify(cart));
    updateCartCountBadge();
    alert(`Sukses menambahkan ${qtyToAdd} item ke keranjang belanja!`);
}

// 5. Fungsi Update Counter Angka Keranjang di Navbar
function updateCartCountBadge() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    let cart = localStorage.getItem('sembako_cart') ? JSON.parse(localStorage.getItem('sembako_cart')) : [];
    let total = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.innerText = total;
}

// 6. Tampilan Error jika data tidak ditemukan
function renderErrorPage(message) {
    const targetContainer = document.getElementById('detailViewContainer');
    if (!targetContainer) return;
    targetContainer.innerHTML = `
        <div style="max-width: 600px; margin: 80px auto; text-align: center; background: #ffffff; padding: 4px 40px; padding-bottom: 40px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <i class="fas fa-exclamation-triangle" style="font-size: 60px; color: var(--gold); margin-top: 30px; margin-bottom: 20px;"></i>
            <h2 style="color: var(--navy); margin: 0 0 10px 0;">Terjadi Kesalahan</h2>
            <p style="color: #4A5568; line-height: 1.6; margin-bottom: 30px;">${message}</p>
            <a href="produk.html" class="btn-primary" style="text-decoration: none; display: inline-block;">Kembali ke Katalog</a>
        </div>
    `;
}

// HELPER: Format Rupiah
function formatRupiah(angka) {
    return 'Rp ' + parseFloat(angka).toLocaleString('id-ID');
}

// HELPER: XSS Prevention
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

function checkAuthStatus() {
    const guestLinks = document.getElementById('auth-guest-links');
    const userDropdown = document.getElementById('auth-user-dropdown');
    const user = getLoggedInUser();

    if (user && user.isLoggedIn) {
        // Mode Login: Sembunyikan link tamu, tampilkan profil/nama
        if (guestLinks) guestLinks.style.display = 'none';
        if (userDropdown) {
            userDropdown.style.display = 'block';
            // Tambahkan nama user di elemen tersebut
            userDropdown.querySelector('.user-name-display').innerText = user.username;
        }
    } else {
        // Mode Guest
        if (guestLinks) guestLinks.style.display = 'flex';
        if (userDropdown) userDropdown.style.display = 'none';
    }
}

// Jalankan saat halaman siap
document.addEventListener("DOMContentLoaded", function() {
    renderProductDetail();
    updateCartCountBadge();
    checkAuthStatus();
});