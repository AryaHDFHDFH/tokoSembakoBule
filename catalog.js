/**
 * catalog.js - Versi SEDERHANA & SINKRON DENGAN ADMIN (ANTI HILANG)
 */

let activeCategoryId = "";
let searchKeyword = "";

// ==========================================================================
// --- DATA INJECTION (SUNTIKAN DATA AGAR TIDAK KOSONG SAAT DEPLOY) ---
// ==========================================================================
const DATA_AWAL_PRODUK_CATALOG = [
    { "id_product": 7, "name_product": "Tepung Terigu Segitiga Biru 1kg", "category_product": "Bahan Pokok (Utama)", "price": 14500, "stock": 30, "image_product": "Segitiga Biru.jpg" },
    { "id_product": 6, "name_product": "Telur Ayam Negeri 1kg (Fresh)", "category_product": "Produk Susu & Telur (Dairy & Eggs)", "price": 27500, "stock": 50, "image_product": "telur.jpg" },
    { "id_product": 5, "name_product": "Beras Raja Ultima 5kg", "category_product": "Bahan Pokok (Utama)", "price": 74500, "stock": 5, "image_product": "berasRaja.jpg" },
    { "id_product": 4, "name_product": "Minyak Goreng Tropical 2L", "category_product": "Bumbu Dapur & Penyedap", "price": 45000, "stock": 14, "image_product": "minyakTropical.jpg" },
    { "id_product": 3, "name_product": "Gula Pasir Gulaku 1kg", "category_product": "Bumbu Dapur & Penyedap", "price": 17500, "stock": 10, "image_product": "gulaku.jpg" },
    { "id_product": 2, "name_product": "Le Minerale 600 ml", "category_product": "Minuman & Pendamping (Beverages)", "price": 4000, "stock": 19, "image_product": "leminerale.jpg" },
    { "id_product": 1, "name_product": "Mie Rendang", "category_product": "Mie, Pasta & Makanan Instan", "price": 5000, "stock": 5, "image_product": "MieRendang.jpg" }
];

const DATA_AWAL_KATEGORI = [
    { id_category: 1, name_category: "Bahan Pokok (Utama)" },
    { id_category: 2, name_category: "Mie, Pasta & Makanan Instan" },
    { id_category: 3, name_category: "Produk Susu & Telur (Dairy & Eggs)" },
    { id_category: 4, name_category: "Bumbu Dapur & Penyedap" },
    { id_category: 5, name_category: "Minuman & Pendamping (Beverages)" },
    { id_category: 6, name_category: "Perlengkapan Rumah Tangga (Home Care)" }
];

const PRODUK_VERSION_CATALOG = "v3_production";

// ==========================================
// 1. AMBIL DATA PRODUK (DENGAN INJECTOR)
// ==========================================
function getProductsFromAdmin() {
    let data = localStorage.getItem('sembako_products');
    let currentVersion = localStorage.getItem('sembako_products_version');
    
    // Inject data produk default jika kosong atau versi lama
    if (!data || currentVersion !== PRODUK_VERSION_CATALOG) {
        localStorage.setItem('sembako_products', JSON.stringify(DATA_AWAL_PRODUK_CATALOG));
        localStorage.setItem('sembako_products_version', PRODUK_VERSION_CATALOG);
        return DATA_AWAL_PRODUK_CATALOG;
    }
    return JSON.parse(data);
}

// ==========================================
// 2. AMBIL DATA KATEGORI (DENGAN INJECTOR)
// ==========================================
function getCategoriesFromAdmin() {
    let data = localStorage.getItem('sembako_categories');
    if (data && data !== "[]") {
        return JSON.parse(data);
    }
    // Inject kategori default agar filter sinkron dengan produk bawaan
    localStorage.setItem('sembako_categories', JSON.stringify(DATA_AWAL_KATEGORI));
    return DATA_AWAL_KATEGORI;
}

// ==========================================
// 3. FUNGSI BANTUAN
// ==========================================
function escapeHTML(str) { 
    if (!str) return ''; 
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m] || m)); 
}

function formatRupiah(angka) { 
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID'); 
}

// Helper Path Gambar Publik (Mendukung Base64 dari Admin)
function getPublicImagePath(imageName) {
    if (!imageName) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (imageName.startsWith('http') || imageName.startsWith('data:')) {
        return imageName;
    }
    const fileName = imageName.split('/').pop();
    return `assets/images/products/${fileName}`;
}

// ==========================================
// 4. UPDATE UI LOGIN
// ==========================================
function updateLoginUI() {
    //console.log("🔍 updateLoginUI() dipanggil...");
    
    const username = localStorage.getItem('activeSessionUser');
    const fullname = localStorage.getItem('activeSessionFullName');
    const isLoggedIn = !!username;
    
    const guestLinks = document.getElementById('auth-guest-links');
    const userDropdown = document.getElementById('auth-user-dropdown');
    const userNavName = document.getElementById('user-nav-name');
    const sidebarGuest = document.getElementById('sidebar-guest-buttons');
    const sidebarUser = document.getElementById('sidebar-user-logged');
    const userSidebarName = document.getElementById('user-sidebar-name');
    
    if (isLoggedIn) {
        const displayName = fullname || username || 'User';
        
        if (guestLinks) guestLinks.style.display = 'none';
        if (userDropdown) userDropdown.style.display = 'block';
        if (userNavName) userNavName.innerText = displayName;
        
        if (sidebarGuest) sidebarGuest.style.display = 'none';
        if (sidebarUser) sidebarUser.style.display = 'block';
        if (userSidebarName) userSidebarName.innerText = displayName;
    } else {
        if (guestLinks) guestLinks.style.display = 'flex';
        if (userDropdown) userDropdown.style.display = 'none';
        if (userNavName) userNavName.innerText = '';
        
        if (sidebarGuest) sidebarGuest.style.display = 'flex';
        if (sidebarUser) sidebarUser.style.display = 'none';
        if (userSidebarName) userSidebarName.innerText = '';
    }
}

// ==========================================
// 5. RENDER KATEGORI BADGES
// ==========================================
function renderCategoryBadges() {
    const container = document.getElementById('categoryBadgesContainer');
    if (!container) return;
    
    const categories = getCategoriesFromAdmin();
    let html = `<a href="#" onclick="filterByCategory(event, '')" class="cat-badge ${activeCategoryId === '' ? 'active' : ''}">Semua</a>`;
    
    categories.forEach(cat => {
        const catId = cat.id_category || cat.id;
        const catName = cat.name_category || cat.name || 'Kategori';
        const isActive = String(activeCategoryId) === String(catId);
        html += `<a href="#" onclick="filterByCategory(event, '${catId}')" class="cat-badge ${isActive ? 'active' : ''}">${escapeHTML(catName)}</a>`;
    });
    container.innerHTML = html;
}

// ==========================================
// 6. FILTER BY KATEGORI
// ==========================================
function filterByCategory(event, categoryId) {
    event.preventDefault();
    activeCategoryId = categoryId;
    const url = new URL(window.location.href);
    if (categoryId) url.searchParams.set('id', categoryId);
    else url.searchParams.delete('id');
    window.history.pushState({}, '', url);
    renderCategoryBadges();
    renderProductGrid();
}

// ==========================================
// 7. HANDLE SEARCH
// ==========================================
function handleSearchSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('searchInput');
    if (input) searchKeyword = input.value.trim();
    renderProductGrid();
}

// ==========================================
// 8. RENDER PRODUCT GRID
// ==========================================
function renderProductGrid() {
    const container = document.getElementById('productGridContainer');
    if (!container) return;
    
    let products = getProductsFromAdmin();
    let filtered = [...products];
    
    // Perbaikan Logika Filter: Sinkronisasi ID kategori baru dan nama kategori bawaan
    if (activeCategoryId) {
        const categories = getCategoriesFromAdmin();
        const activeCat = categories.find(c => String(c.id_category || c.id) === String(activeCategoryId));
        const activeCatName = activeCat ? (activeCat.name_category || activeCat.name) : "";

        filtered = filtered.filter(p => {
            const matchId = String(p.id_category || p.category_id) === String(activeCategoryId);
            const matchName = activeCatName && p.category_product === activeCatName;
            return matchId || matchName;
        });
    }

    if (searchKeyword) {
        filtered = filtered.filter(p => (p.name_product || p.name || "").toLowerCase().includes(searchKeyword.toLowerCase()));
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--text-muted);">
            <i class="fas fa-box-open" style="font-size:48px; color:#ccc; margin-bottom:15px;"></i>
            <p style="font-weight:600; color:#0A192F;">Tidak ada produk yang ditemukan.</p>
        </div>`;
        return;
    }

    container.innerHTML = filtered.map(product => {
        const id = product.id_product || product.id;
        const name = product.name_product || product.name;
        const price = product.price || 0;
        const image = product.image_product || "";
        
        // Gunakan helper gambar agar Base64 dan gambar lokal terbaca dengan benar
        const imgPath = getPublicImagePath(image);

        return `
            <div class="product-card">
                <img src="${imgPath}" alt="${escapeHTML(name)}" class="product-img" onerror="this.src='https://via.placeholder.com/300x200?text=Sembako+Bule'">
                <div class="product-info" style="padding: 15px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <h3 class="product-title" style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0A192F;">${escapeHTML(name)}</h3>
                        <div class="product-price" style="margin: 0 0 15px 0; font-weight: 800; color: #e67e22; font-size: 14px;">${formatRupiah(price)}</div>
                    </div>
                    <div class="product-actions" style="display: flex; gap: 10px;">
                        <a href="detail.html?id=${id}" class="btn-outline" style="flex: 1; text-align: center; text-decoration: none; padding: 8px; border: 2px solid #0A192F; color: #0A192F; border-radius: 6px; font-weight: 600; font-size: 12px; transition: 0.2s;">Detail</a>
                        <button onclick="addToCart('${id}')" class="btn-primary btn-sm" style="padding: 8px 12px; border-radius: 6px; background: #D4AF37; border: none; cursor: pointer; color: #0A192F; transition: 0.2s;">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// 9. ADD TO CART
// ==========================================
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('sembako_cart') || "[]");
    let existing = cart.find(i => String(i.product_id) === String(productId));
    if (existing) existing.qty += 1;
    else cart.push({ product_id: productId, qty: 1 });
    localStorage.setItem('sembako_cart', JSON.stringify(cart));
    updateCartCountBadge();
    alert("Produk berhasil ditambahkan ke keranjang!");
}

// ==========================================
// 10. UPDATE CART COUNT BADGE
// ==========================================
function updateCartCountBadge() {
    const cart = JSON.parse(localStorage.getItem('sembako_cart') || "[]");
    const total = cart.reduce((sum, item) => sum + parseInt(item.qty || 1), 0);
    
    const badge = document.getElementById('cartCount');
    if (badge) {
        badge.innerText = total;
        badge.style.display = total > 0 ? 'inline-block' : 'none';
    }
    
    const sidebarBadge = document.getElementById('sidebarCartCount');
    if (sidebarBadge) {
        sidebarBadge.innerText = total;
        sidebarBadge.style.display = total > 0 ? 'inline-block' : 'none';
    }
}

// ==========================================
// 11. INISIALISASI
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    //console.log("🚀 Catalog.js dimulai...");
    
    // Ambil parameter URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategoryId = urlParams.get('id');
    activeCategoryId = urlCategoryId || "";
    
    // Render komponen
    renderCategoryBadges();
    renderProductGrid();
    updateCartCountBadge();
    
    // Update UI Login
    updateLoginUI();
    
    //console.log("✅ Catalog.js selesai diinisialisasi");
});