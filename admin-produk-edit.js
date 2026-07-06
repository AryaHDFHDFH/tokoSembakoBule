// ==========================================================================
// --- GLOBAL CORE ENGINE CONFIGURATION ---
// ==========================================================================
let products = JSON.parse(localStorage.getItem('sembako_products') || '[]');
let currentProduct = null;
let selectedImageFile = null;
let selectedFilename = '';

// Helper Path Gambar Lokal (Sinkron dengan halaman list produk)
function getImagePath(imageName) {
    if (!imageName) return 'https://via.placeholder.com/120';
    if (imageName.startsWith('http') || imageName.startsWith('data:')) {
        return imageName;
    }
    const fileName = imageName.split('/').pop();
    const currentPath = window.location.pathname;
    const isInAdmin = currentPath.includes('/admin/');
    
    return (isInAdmin ? '../' : '') + 'assets/images/products/' + fileName;
}

// ==========================================================================
// --- LOAD & AUTO-FILL DATA PRODUK LAMA ---
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Ambil Parameter ID dari URL (?id=X)
    const urlParams = new URLSearchParams(window.location.search);
    const idProduct = parseInt(urlParams.get('id'));

    if (!idProduct) {
        alert("❌ ID Produk tidak valid!");
        window.location.href = "admin-produk.html";
        return;
    }

    // 2. Cari data produk di localStorage berdasarkan ID
    currentProduct = products.find(p => parseInt(p.id_product) === idProduct);

    if (!currentProduct) {
        alert("❌ Produk tidak ditemukan atau telah dihapus!");
        window.location.href = "admin-produk.html";
        return;
    }

    // 3. Auto-fill isi form input dengan data produk lama
    document.getElementById('name_product').value = currentProduct.name_product || '';
    document.getElementById('price').value = currentProduct.price || '';
    document.getElementById('stock').value = currentProduct.stock || '';
    
    const descElement = document.getElementById('description');
    if (descElement) descElement.value = currentProduct.description || '';
    
    // --- PERBAIKAN LOGIKA KATEGORI ---
    // Handle perbedaan struktur antara produk default bawaan dan produk baru
    const categorySelect = document.getElementById('id_category');
    if (categorySelect) {
        if (currentProduct.id_category) {
            // Jika produk baru yang sudah punya id_category
            categorySelect.value = currentProduct.id_category;
        } else if (currentProduct.category_product) {
            // Fallback untuk produk bawaan: Cari berdasarkan teks nama kategori
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].text === currentProduct.category_product || 
                    categorySelect.options[i].value === currentProduct.category_product) {
                    categorySelect.selectedIndex = i;
                    break;
                }
            }
        }
    }

    // 4. PREVIEW GAMBAR UTAMA: Memunculkan gambar produk saat ini tanpa memecahkan path
    const previewElement = document.getElementById('imagePreview');
    if (previewElement) {
        previewElement.src = getImagePath(currentProduct.image_product);
        previewElement.style.display = 'block';
    }

    // Bind event upload gambar baru & form submit
    const imageInput = document.getElementById('image_product');
    if (imageInput) imageInput.addEventListener('change', handleImageUploadPreview);

    const formEdit = document.getElementById('form-edit-produk') || document.getElementById('form-produk');
    if (formEdit) formEdit.addEventListener('submit', handleFormEditSubmit);
});

// ==========================================================================
// --- PREVIEW KETIKA USER BERGANTI GAMBAR BARU ---
// ==========================================================================
function handleImageUploadPreview(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Menambahkan image/gif agar selaras dengan input dari admin-produk.js
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('❌ Hanya file gambar resmi yang diperbolehkan (JPG, PNG, GIF, WEBP)');
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

    // Ganti preview gambar lama ke file gambar baru yang dipilih
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

// ==========================================================================
// --- SIMPAN PROSES PERUBAHAN (EDIT SUBMIT) ---
// ==========================================================================
function handleFormEditSubmit(event) {
    event.preventDefault();

    const nama = document.getElementById('name_product').value.trim();
    const selectEl = document.getElementById('id_category');
    const kategoriId = selectEl.value;
    const namaKategori = selectEl.options[selectEl.selectedIndex].text;
    const harga = parseFloat(document.getElementById('price').value) || 0;
    const stok = parseInt(document.getElementById('stock').value) || 0;
    
    const descElement = document.getElementById('description');
    const deskripsi = descElement ? descElement.value.trim() : '';

    if (!nama || !kategoriId || harga <= 0) {
        alert("❌ Mohon lengkapi seluruh field data utama!");
        return;
    }

    // Gunakan parseInt untuk memastikan ID cocok meskipun tipe datanya berbeda (string vs number)
    const index = products.findIndex(p => parseInt(p.id_product) === parseInt(currentProduct.id_product));
    
    if (index !== -1) {
        products[index].name_product = nama;
        
        // --- SINKRONISASI STRUKTUR OBJEK ---
        // Menulis ulang semua properti kategori agar sama persis dengan fungsi penambahan produk baru
        products[index].id_category = kategoriId;
        products[index].name_category = namaKategori; 
        products[index].category_product = namaKategori;
        
        products[index].price = harga;
        products[index].stock = stok;
        products[index].description = deskripsi;

        // LOGIKA GAMBAR: 
        // Jika user upload gambar baru, pakai nama gambar baru. 
        // Jika input file dikosongkan, kondisi ini dilewati dan tetap menggunakan gambar lama.
        if (selectedFilename !== '') {
            products[index].image_product = selectedFilename;
        }

        // Simpan permanen kembali ke LocalStorage
        localStorage.setItem('sembako_products', JSON.stringify(products));
        
        alert(`✅ Perubahan produk "${nama}" berhasil diperbarui!`);
        window.location.href = "admin-produk.html";
    } else {
        alert("❌ Gagal memperbarui data produk.");
    }
}