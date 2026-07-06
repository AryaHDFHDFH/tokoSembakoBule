// ==========================================================================
// --- CENTRAL DATA STORAGE (DATA UTAMA UTUH & PERMANEN) ---
// ==========================================================================
const DATA_AWAL_PRODUK = [
    {
        "id_product": 7,
        "name_product": "Tepung Terigu Segitiga Biru 1kg",
        "category_product": "Bahan Pokok (Utama)",
        "price": 14500,
        "stock": 30,    
        "description": "Tepung terigu serbaguna berkualitas tinggi, cocok untuk membuat kue, roti, gorengan, dan berbagai masakan sehari-hari.",
        "image_product": "Segitiga Biru.jpg"
    },
    {
        "id_product": 6,
        "name_product": "Telur Ayam Negeri 1kg (Fresh)",
        "category_product": "Produk Susu & Telur (Dairy & Eggs)",
        "price": 27500,
        "stock": 50,
        "description": "Telur ayam negeri segar dengan kualitas pilihan, cocok untuk kebutuhan memasak dan konsumsi harian keluarga.",
        "image_product": "telur.jpg"
    },
    {
        "id_product": 5,
        "name_product": "Beras Raja Ultima 5kg",
        "category_product": "Bahan Pokok (Utama)",
        "price": 74500,
        "stock": 5,
        "description": "Beras premium dengan tekstur pulen, aroma harum, dan kualitas terbaik untuk kebutuhan sehari-hari.",
        "image_product": "berasRaja.jpg"
    },
    {
        "id_product": 4,
        "name_product": "Minyak Goreng Tropical 2L",
        "category_product": "Bumbu Dapur & Penyedap",
        "price": 45000,
        "stock": 14,
        "description": "Minyak goreng berkualitas dengan kandungan vitamin, cocok untuk menggoreng dan memasak berbagai hidangan.",
        "image_product": "minyakTropical.jpg"
    },
    {
        "id_product": 3,
        "name_product": "Gula Pasir Gulaku 1kg",
        "category_product": "Bumbu Dapur & Penyedap",
        "price": 17500,
        "stock": 10,
        "description": "Gula pasir putih berkualitas tinggi dengan rasa manis alami, cocok untuk minuman dan berbagai masakan.",
        "image_product": "gulaku.jpg"
    },
    {
        "id_product": 2,
        "name_product": "Le Minerale 600 ml",
        "category_product": "Minuman & Pendamping (Beverages)",
        "price": 4000,
        "stock": 19,
        "description": "Air mineral kemasan dengan kandungan mineral alami, segar dan praktis untuk dikonsumsi sehari-hari.",
        "image_product": "leminerale.jpg"
    },
    {
        "id_product": 1,
        "name_product": "Mie Rendang",
        "category_product": "Mie, Pasta & Makanan Instan",
        "price": 5000,
        "stock": 5,
        "description": "Mie instan dengan cita rasa rendang khas Indonesia yang gurih, pedas, dan lezat.",
        "image_product": "MieRendang.jpg"
    }
];


// JAMINAN DEPLOY: Naikkan versi ke v3 untuk memaksa browser dosen memuat data ini secara instan
const PRODUK_VERSION = "v3_production"; 

function getProducts() {
    let data = localStorage.getItem('sembako_products');
    let currentVersion = localStorage.getItem('sembako_products_version');
    
    // Jika data kosong ATAU versi lama terdeteksi, timpa paksa dengan data produksi di atas
    if (!data || currentVersion !== PRODUK_VERSION) {
        localStorage.setItem('sembako_products', JSON.stringify(DATA_AWAL_PRODUK));
        localStorage.setItem('sembako_products_version', PRODUK_VERSION);
        return DATA_AWAL_PRODUK;
    }
    return JSON.parse(data);
}

function formatRupiah(angka) {
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// ==========================================================================
// --- PATH GAMBAR OTOMATIS (MENCEGAH GAMBAR PECAH) ---
// ==========================================================================
function getImagePath(imageName) {
    if (!imageName) return 'https://via.placeholder.com/50';
    
    if (imageName.startsWith('http') || imageName.startsWith('data:')) {
        return imageName;
    }
    
    const fileName = imageName.split('/').pop();
    const currentPath = window.location.pathname;
    const isInAdmin = currentPath.includes('/admin/');
    
    return (isInAdmin ? '../' : '') + 'assets/images/products/' + fileName;
}

// ==========================================================================
// --- RENDER TABLE DATA (PASTI URUT & SIMETRIS) ---
// ==========================================================================
function renderProductTable() {
    const products = getProducts();
    const tbody = document.getElementById('productTableBody') || document.getElementById('tbody-produk');
    if (!tbody) return;

    tbody.innerHTML = "";

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: #888;">Belum ada produk.</td></tr>`;
        return;
    }

    products.forEach((p) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #f4f7f6';
        
        tr.onmouseover = function() { this.style.backgroundColor = '#f8fafc'; };
        tr.onmouseout = function() { this.style.backgroundColor = 'transparent'; };

        const imagePath = getImagePath(p.image_product);
        
        const imgHtml = `
            <img src="${imagePath}" 
                 alt="${escapeHTML(p.name_product)}" 
                 width="50" 
                 height="50" 
                 style="object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0;"
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/50';">
        `;

        // DIKUNCI PAS 6 KOLOM AGAR STRUKTUR TIDAK TERBALIK-BALIK
        tr.innerHTML = `
            <td style="padding: 15px 12px; text-align: center; vertical-align: middle;">${imgHtml}</td>
            <td style="padding: 15px 12px; vertical-align: middle; font-weight: 700; color: #051124;">${escapeHTML(p.name_product)}</td>
            <td style="padding: 15px 12px; vertical-align: middle; color: #64748b; font-size: 13px;">${escapeHTML(p.category_product)}</td>
            <td style="padding: 15px 12px; vertical-align: middle; font-weight: 500; color: #051124;">${formatRupiah(p.price)}</td>
            <td style="padding: 15px 12px; text-align: center; vertical-align: middle; color: #051124; font-weight: 500;">${p.stock}</td>
            <td style="padding: 15px 12px; text-align: center; vertical-align: middle;">
                <div style="display: inline-flex; gap: 8px; justify-content: center; align-items: center;">
                    <a href="admin-produk-edit.html?id=${p.id_product}" 
                       style="color: #d4af37; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); padding: 6px 10px; border-radius: 6px; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s;"
                       onmouseover="this.style.background='#d4af37'; this.style.color='white';"
                       onmouseout="this.style.background='rgba(212, 175, 55, 0.1)'; this.style.color='#d4af37';">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button onclick="deleteProduct(${p.id_product})" 
                            style="color: #d63031; background: rgba(214, 48, 49, 0.1); border: 1px solid rgba(214, 48, 49, 0.2); padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s;"
                            onmouseover="this.style.background='#d63031'; this.style.color='white';"
                            onmouseout="this.style.background='rgba(214, 48, 49, 0.1)'; this.style.color='#d63031';">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================================================
// --- FORM HANDLER ---
// ==========================================================================
let selectedImageFile = null;
let selectedFilename = '';

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('❌ Hanya file gambar yang diperbolehkan (JPG, PNG, GIF, WEBP)');
        event.target.value = '';
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        alert('❌ Ukuran gambar maksimal 2MB');
        event.target.value = '';
        return;
    }
    
    selectedImageFile = file;
    selectedFilename = file.name;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

async function handleFormSubmitAdmin(event) {
    event.preventDefault();

    const nama = document.getElementById('name_product').value.trim();
    const selectEl = document.getElementById('id_category');
    const kategoriId = selectEl.value;
    const namaKategori = selectEl.options[selectEl.selectedIndex].text;
    
    const harga = parseFloat(document.getElementById('price').value) || 0;
    const stok = parseInt(document.getElementById('stock').value) || 0;
    const deskripsi = document.getElementById('description').value.trim();

    if (!nama || !kategoriId || harga <= 0 || !selectedImageFile) {
        alert("❌ Lengkapi semua data dan pilih gambar!");
        return;
    }

    let products = JSON.parse(localStorage.getItem('sembako_products') || '[]');
    const idBaru = products.length > 0 ? Math.max(...products.map(p => Number(p.id_product) || 0)) + 1 : 1;

    const produkBaru = {
        id_product: idBaru,
        id_category: kategoriId,
        name_category: namaKategori,      
        category_product: namaKategori,   
        name_product: nama,
        price: harga,
        stock: stok,
        description: deskripsi,
        image_product: selectedFilename
    };

    products.push(produkBaru);
    localStorage.setItem('sembako_products', JSON.stringify(products));

    alert(`✅ Produk "${nama}" berhasil disimpan!`);
    window.location.href = "admin-produk.html";
}

// ==========================================================================
// --- DELETE & UTILS ---
// ==========================================================================
function deleteProduct(id) {
    if (confirm('Yakin hapus produk ini?')) {
        let products = getProducts().filter(p => parseInt(p.id_product) !== parseInt(id));
        localStorage.setItem('sembako_products', JSON.stringify(products));
        renderProductTable();
        showNotification("✅ Produk berhasil dihapus!");
    }
}

function showNotification(text) {
    const alertBox = document.getElementById('alert-msg');
    if (alertBox) {
        alertBox.innerText = text;
        alertBox.style.display = 'block';
        setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
    }
}

// ==========================================================================
// --- INITIALIZATION ---
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    renderProductTable();
    
    const imageInput = document.getElementById('image_product');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    const form = document.getElementById('form-tambah-produk') || document.getElementById('form-produk');
    if (form) {
        form.addEventListener('submit', handleFormSubmitAdmin);
    }
});