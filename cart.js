document.addEventListener('DOMContentLoaded', () => {
    renderCartView();
});

// ============================================================
//  RENDER KERANJANG - VERSION 3 (FIXED IMAGE PATH)
// ============================================================
window.renderCartView = function() {
    try {
        // Ambil data dari localStorage
        let cart = JSON.parse(localStorage.getItem('sembako_cart') || "[]");
        let products = JSON.parse(localStorage.getItem('sembako_products') || "[]");
        
        // 🔍 DEBUG: Tampilkan data di console
        // console.log('📦 CART DATA:', cart);
        // console.log('📦 PRODUCTS DATA:', products);
        
        const tableBody = document.getElementById('cartTableBody');
        const grandTotalEl = document.getElementById('cartGrandTotal');
        
        if (!tableBody) {
            console.error('❌ Elemen #cartTableBody tidak ditemukan!');
            return;
        }
        
        tableBody.innerHTML = "";
        let grandTotal = 0;

        if (cart.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:40px;">
                        <i class="fas fa-shopping-cart" style="font-size:48px; color:#ccc;"></i>
                        <p style="margin-top:10px;">Keranjang belanja kosong</p>
                        <a href="index.html" class="btn-primary" style="display:inline-block; margin-top:10px;">Belanja Sekarang</a>
                    </td>
                </tr>
            `;
            if (grandTotalEl) grandTotalEl.innerText = "Rp 0";
            return;
        }

        cart.forEach((item, index) => {
            // Cari produk
            let product = null;
            const itemId = String(item.product_id || item.id || '');
            
            for (let p of products) {
                const productId = String(p.id_product || p.id || '');
                if (productId === itemId) {
                    product = p;
                    break;
                }
            }
            
            // 🔍 DEBUG: Tampilkan hasil pencarian
            console.log(`🟢 Item ${index+1}: ID=${itemId}, Product ditemukan?`, product ? '✅' : '❌');
            
            // Ambil data
            const name = product ? (product.name_product || product.name || 'Produk') : (item.name || 'Produk');
            const price = parseFloat(product ? (product.price || 0) : (item.price || 0));
            const qty = parseInt(item.qty || item.quantity || 1);
            const subtotal = price * qty;
            const stock = product ? (product.stock || 0) : 0;
            
            // ========== 🖼️ PERBAIKAN GAMBAR ==========
            let imageSrc = getProductImage(product, item);
            
            // 🔍 DEBUG: Tampilkan path gambar
            console.log(`🖼️ Gambar item ${index+1}:`, imageSrc);
            
            // Generate HTML row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <img src="${imageSrc}" 
                             alt="${escapeHtml(name)}" 
                             class="cart-item-img" 
                             style="width:70px; height:70px; object-fit:cover; border-radius:8px; background:#e8ecf1; border:1px solid #ddd;"
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/70x70/FF6B6B/FFFFFF?text=Error';">
                        <div>
                            <div style="font-weight:600; color:#0A192F;">${escapeHtml(name)}</div>
                            <small style="color:#718096;">
                                <i class="fas fa-boxes"></i> Stok: ${stock}
                                ${!product ? ' <span style="color:#FF6B6B;">(Produk tidak ditemukan)</span>' : ''}
                            </small>
                        </div>
                    </div>
                </td>
                <td style="font-weight:500;">Rp ${price.toLocaleString('id-ID')}</td>
                <td>
                    <input type="number" class="cart-qty-input" value="${qty}" min="1" max="${stock || 999}" 
                           onchange="updateQty('${itemId}', this.value)"
                           style="width:70px; padding:6px; text-align:center; border:1px solid #ddd; border-radius:4px;">
                </td>
                <td style="font-weight:700; color:#0A192F;">Rp ${subtotal.toLocaleString('id-ID')}</td>
                <td>
                    <button onclick="removeItem('${itemId}')" class="btn-outline" 
                            style="color:#dc3545; border-color:#dc3545; padding:8px 12px; border-radius:4px; cursor:pointer; background:transparent;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
            grandTotal += subtotal;
        });

        if (grandTotalEl) grandTotalEl.innerText = "Rp " + grandTotal.toLocaleString('id-ID');
        
    } catch (error) {
        console.error('❌ ERROR renderCartView:', error);
    }
};

// ============================================================
//  🖼️ FUNGSI GET PRODUCT IMAGE (DIPERBAIKI)
// ============================================================
function getProductImage(product, item) {
    // 1️⃣ Ambil sumber gambar dari product atau item
    let imageFile = '';
    
    if (product) {
        imageFile = product.image_product || product.image || product.gambar || product.img || '';
    }
    if (!imageFile && item) {
        imageFile = item.image || item.gambar || item.img || item.image_product || '';
    }
    
    // 2️⃣ Bersihkan string
    imageFile = String(imageFile).trim();
    
    // 3️⃣ Daftar path yang mungkin (coba semua kemungkinan)
    const possiblePaths = [
        'assets/images/products/',
        '../assets/images/products/',
        'admin/assets/images/products/',
        '../admin/assets/images/products/',
        'images/products/',
        '../images/products/',
        ''
    ];
    
    // 4️⃣ Jika sudah URL lengkap (http/https/data:)
    if (imageFile.startsWith('http://') || imageFile.startsWith('https://') || imageFile.startsWith('data:')) {
        return imageFile;
    }
    
    // 5️⃣ Jika path sudah mengandung 'assets/' atau 'images/', langsung gunakan
    if (imageFile.includes('assets/') || imageFile.includes('images/')) {
        // Bersihkan dari '../' di awal
        let cleanPath = imageFile.replace(/^\.\.\//g, '');
        return cleanPath;
    }
    
    // 6️⃣ Coba semua kemungkinan path
    for (let path of possiblePaths) {
        const fullPath = path + imageFile;
        // Cek apakah file ada (dengan mencoba load gambar)
        const img = new Image();
        img.src = fullPath;
        if (img.complete && img.naturalWidth > 0) {
            return fullPath;
        }
    }
    
    // 7️⃣ Fallback: coba path standar
    const fallbackPaths = [
        `assets/images/products/${imageFile}`,
        `images/products/${imageFile}`,
        `admin/assets/images/products/${imageFile}`,
        `${imageFile}`
    ];
    
    // 8️⃣ Jika tidak ada gambar, return placeholder
    if (!imageFile) {
        return 'https://via.placeholder.com/70x70/0A192F/FFFFFF?text=No+Image';
    }
    
    // 9️⃣ Gunakan path pertama sebagai default
    return fallbackPaths[0];
}

// ============================================================
//  FUNGSI UPDATE, HAPUS, CLEAR
// ============================================================
window.updateQty = function(id, newQty) {
    try {
        let cart = JSON.parse(localStorage.getItem('sembako_cart') || "[]");
        let item = cart.find(i => String(i.product_id || i.id) === String(id));
        if(item) {
            item.qty = parseInt(newQty);
            item.quantity = parseInt(newQty);
            localStorage.setItem('sembako_cart', JSON.stringify(cart));
            renderCartView();
        }
    } catch (error) {
        console.error('❌ Error updateQty:', error);
    }
};

window.removeItem = function(id) {
    if(confirm('Hapus item ini dari keranjang?')) {
        try {
            let cart = JSON.parse(localStorage.getItem('sembako_cart') || "[]");
            cart = cart.filter(i => String(i.product_id || i.id) !== String(id));
            localStorage.setItem('sembako_cart', JSON.stringify(cart));
            renderCartView();
        } catch (error) {
            console.error('❌ Error removeItem:', error);
        }
    }
};

window.clearAllCart = function() {
    if(confirm('Kosongkan keranjang belanja?')) {
        localStorage.removeItem('sembako_cart');
        renderCartView();
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}