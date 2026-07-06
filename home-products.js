/**
 * Logic Section Produk Terbaru - Halaman Beranda (Home)
 * File Pendukung: kategori.js & admin-produk.js
 * Mengambil data real dari inputan admin dan menampilkan 8 produk paling baru.
 */

// 1. Ambil data produk asli milik admin dari LocalStorage
function getAdminProducts() {
    let data = localStorage.getItem('sembako_products');
    return data ? JSON.parse(data) : [];
}

// 2. Ambil data kategori asli milik admin dari LocalStorage
function getAdminCategories() {
    let data = localStorage.getItem('sembako_categories') || localStorage.getItem('categories') || '[]';
    return JSON.parse(data);
}

// Helper Path Gambar Publik (Menyesuaikan dari luar folder admin)
function getPublicImagePath(imageName) {
    if (!imageName) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (imageName.startsWith('http') || imageName.startsWith('data:')) {
        return imageName;
    }
    // Ambil nama file saja, lalu arahkan ke folder assets publik
    const fileName = imageName.split('/').pop();
    return `assets/images/products/${fileName}`;
}

// 3a. RENDER KATEGORI GRID (Bento Grid & Glassmorphism Version)
function renderCategoryGrid() {
    const categories = getAdminCategories();
    const gridContainer = document.getElementById('categoryGridContainer');
    
    if (!gridContainer) return;
    gridContainer.innerHTML = "";
    
    if (categories.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p style="color: #999;">Belum ada kategori tersedia</p>
            </div>
        `;
        return;
    }
    
    // Icon Mapping & Background Premium
    const designMap = {
        "Bahan Pokok (Utama)": {
            icon: "fas fa-wheat-alt",
            bg: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600"
        },
        "Mie, Pasta & Makanan Instan": {
            icon: "fas fa-utensils",
            bg: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600"
        },
        "Produk Susu & Telur (Dairy & Eggs)": {
            icon: "fas fa-cheese",
            bg: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600"
        },
        "Bumbu Dapur & Penyedap": {
            icon: "fas fa-pepper-hot",
            bg: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600"
        },
        "Minuman & Pendamping (Beverages)": {
            icon: "fas fa-coffee",
            bg: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600"
        },
        "Perlengkapan Rumah Tangga (Home Care)": {
            icon: "fas fa-soap",
            bg: "https://images.unsplash.com/photo-1581781890100-38501fce4847?auto=format&fit=crop&w=600"
        }
    };

    const products = getAdminProducts();

    categories.forEach(cat => {
        const nameCat = cat.name_category || cat.name || cat.nama_kategori;
        const idCat = cat.id_category || cat.id || cat.id_kategori;
        if (!nameCat) return;

        const design = designMap[nameCat] || { 
            icon: "fas fa-box", 
            bg: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600" 
        };

        // PERBAIKAN: Hitung berdasarkan id_category ATAU category_product (sinkron dengan admin)
        const totalItems = products.filter(p => {
            const matchId = String(p.id_category) === String(idCat);
            const matchName = p.category_product === nameCat;
            return matchId || matchName;
        }).length;

        const card = document.createElement('a');
        card.href = `produk.html#${encodeURIComponent(nameCat)}`;
        card.className = "category-bento-card";
        card.setAttribute("style", `--bg-img: url('${design.bg}')`);

        card.innerHTML = `
            <div class="category-card-overlay"></div>
            <div class="category-card-content">
                <div class="category-icon-wrapper">
                    <i class="${design.icon}"></i>
                </div>
                <div class="category-info">
                    <h3>${escapeHTML(nameCat)}</h3>
                    <span>${totalItems} Produk</span>
                </div>
                <div class="category-arrow">
                    <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        `;
        
        gridContainer.appendChild(card);
    });
}

// 3b. Fungsi utama merender 8 produk terbaru
function renderLatestProducts() {
    const products = getAdminProducts();
    const categories = getAdminCategories();
    const gridContainer = document.getElementById('latestProductGrid');

    if (!gridContainer) return;
    gridContainer.innerHTML = ""; 

    if (products.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <i class="fas fa-box-open" style="font-size: 40px; color: #ccc; margin-bottom: 15px; display: block;"></i>
                <h3 style="color: var(--navy, #0A192F); margin: 0; font-weight: 600;">Belum Ada Produk Tersedia</h3>
            </div>
        `;
        return;
    }

    const categoryMap = {};
    categories.forEach(cat => {
        const idCat = cat.id_category || cat.id;
        const nameCat = cat.name_category || cat.name;
        if (idCat && nameCat) categoryMap[idCat] = nameCat;
    });

    // Urutkan dari yang paling baru diinput lalu ambil maksimal 8 item
    const latestProducts = [...products].reverse().slice(0, 8);

    latestProducts.forEach(product => {
        const id = product.id_product;
        const name = product.name_product || "Produk Sembako";
        const price = product.price || 0;
        const image = product.image_product;
        const catId = product.id_category;

        // PERBAIKAN: Prioritaskan category_product bawaan dari admin-produk.js
        const categoryName = product.category_product || categoryMap[catId] || "Sembako";
        
        // PERBAIKAN: Gunakan helper path gambar publik agar seragam
        const imgPath = getPublicImagePath(image);

        const card = document.createElement('div');
        card.className = "product-card";
        
        card.innerHTML = `
            <div style="position: relative;">
                <span style="position: absolute; top: 10px; left: 10px; background: var(--navy, #0A192F); color: white; padding: 5px 12px; border-radius: 20px; font-size: 11px; z-index: 2; font-weight: 500;">
                    ${escapeHTML(categoryName)}
                </span>
                <img src="${imgPath}" class="product-img" alt="${escapeHTML(name)}" style="width: 100%; height: 190px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/300x200?text=Sembako+Bule'">
            </div>
            <div class="product-info" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <h3 class="product-title" style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: var(--navy, #0A192F);">${escapeHTML(name)}</h3>
                    <p class="product-price" style="margin: 0 0 18px 0; font-weight: 800; color: #e67e22; font-size: 14px;">${formatRupiah(price)}</p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <a href="detail.html?id=${id}" class="btn-outline" style="flex: 1; text-align: center; text-decoration: none; padding: 10px; border: 2px solid var(--navy, #0A192F); color: var(--navy, #0A192F); border-radius: 6px; font-weight: 600; font-size: 13px; transition: 0.2s;">Detail</a>
                    <button onclick="handleAddToCart('${id}')" class="btn-primary" style="padding: 11px 15px; border-radius: 6px; background: var(--gold, #D4AF37); border: none; cursor: pointer; color: var(--navy, #0A192F); transition: 0.2s;">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

// 4. Logika Tambah ke Keranjang Belanja Dinamis
function handleAddToCart(productId) {
    let cart = localStorage.getItem('sembako_cart') ? JSON.parse(localStorage.getItem('sembako_cart')) : [];
    
    let existingItem = cart.find(item => String(item.product_id) === String(productId));

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ product_id: productId, qty: 1 });
    }

    localStorage.setItem('sembako_cart', JSON.stringify(cart));
    alert("Produk berhasil dimasukkan ke keranjang belanja!");
    
    updateCartBadgeCounter();
}

// 5. Fungsi Sinkronisasi Hitung Jumlah Item di Badge Keranjang Navbar
function updateCartBadgeCounter() {
    const badgeCount = document.getElementById('cartCount');
    if (badgeCount) {
        const cart = localStorage.getItem('sembako_cart') ? JSON.parse(localStorage.getItem('sembako_cart')) : [];
        const totalItems = cart.reduce((sum, item) => sum + parseInt(item.qty || 1), 0);
        
        badgeCount.innerText = totalItems;
        badgeCount.style.display = totalItems > 0 ? 'inline-block' : 'none'; // Sembunyikan badge jika 0
    }
}

// HELPER: Format Angka ke Rupiah
function formatRupiah(angka) {
    return 'Rp ' + parseFloat(angka).toLocaleString('id-ID');
}

// HELPER: Pengaman Input untuk Mencegah XSS
function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// INIT: Jalankan saat DOM dimuat
document.addEventListener("DOMContentLoaded", function() {
    renderCategoryGrid();
    renderLatestProducts();
    updateCartBadgeCounter();
});