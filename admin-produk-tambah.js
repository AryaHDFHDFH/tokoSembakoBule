/**
 * ADMIN PRODUK TAMBAH
 */

const DEFAULT_CATEGORIES = [
    { id: "1", nama: "Beras & Pokok" },
    { id: "2", nama: "Minyak & Lemak" },
    { id: "3", nama: "Bumbu & Gula" },
    { id: "4", nama: "Produk Susu & Telur" },
    { id: "5", nama: "Mie, Pasta & Makanan Instan" }
];

let selectedImageFile = null;
let selectedFilename = "";

// 1. DOM READY - Jalankan semua fungsi inisialisasi di sini
document.addEventListener("DOMContentLoaded", function() {
    initDropdownKategori();
    initImageUploadHandler();
});

// 2. INIT KATEGORI DROPDOWN
function initDropdownKategori() {
    const selectKategori = document.getElementById('id_category');
    if (!selectKategori) return;

    selectKategori.innerHTML = '<option value="">-- Pilih Kategori --</option>';
    
    let dataKategoriLokal = localStorage.getItem('sembako_categories');
    let daftarKategori = [];

    try {
        if (dataKategoriLokal) {
            daftarKategori = JSON.parse(dataKategoriLokal);
        }
    } catch (e) {
        console.error("Data kategori di LocalStorage korup!");
    }

    // Pakai data default jika tidak ada data di LocalStorage
    if (daftarKategori.length === 0) {
        daftarKategori = DEFAULT_CATEGORIES;
    }

    daftarKategori.forEach(cat => {
        const idCat = cat.id_category || cat.id;
        const namaCat = cat.name_category || cat.nama || cat.name;
        selectKategori.innerHTML += `<option value="${idCat}">${namaCat}</option>`;
    });
}
// Tambahkan variabel ini di bagian atas (di bawah selectedFilename)
let base64Image = "";

// 3. INIT IMAGE UPLOAD
function initImageUploadHandler() {
    const fileInput = document.getElementById('image_product');
    const statusText = document.getElementById('uploadStatusText');
    const imgPreview = document.getElementById('imagePreview');

    if (!fileInput) return;

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert("❌ File harus gambar!");
            event.target.value = '';
            return;
        }

        // Batasi ukuran file maksimal 2MB agar LocalStorage tidak jebol saat di-deploy
        if (file.size > 2 * 1024 * 1024) {
            alert("❌ Ukuran gambar maksimal 2MB!");
            event.target.value = '';
            return;
        }

        selectedImageFile = file;
        selectedFilename = file.name;

        if (statusText) statusText.innerText = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (imgPreview) {
                imgPreview.src = e.target.result;
                imgPreview.style.display = "block";
            }
            // SIMPAN DATA GAMBAR (BASE64) KE VARIABEL
            base64Image = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// 4. HANDLE FORM SUBMIT
async function handleFormSubmitAdmin(event) {
    event.preventDefault();

    const nama = document.getElementById('name_product').value.trim();
    const kategoriEl = document.getElementById('id_category');
    const harga = parseFloat(document.getElementById('price').value) || 0;
    const stok = parseInt(document.getElementById('stock').value) || 0;
    const deskripsi = document.getElementById('description').value.trim();

    // Validasi pengecekan gambar menggunakan base64Image
    if (!nama || !kategoriEl.value || !base64Image) {
        alert("❌ Lengkapi semua data dan pastikan gambar sudah dipilih!");
        return;
    }

    const namaKategori = kategoriEl.options[kategoriEl.selectedIndex].text;
    let products = JSON.parse(localStorage.getItem('sembako_products') || '[]');
    
    const produkBaru = {
        id_product: Date.now(), // ID unik otomatis
        id_category: kategoriEl.value,
        name_category: namaKategori,
        category_product: namaKategori, // Tambahan agar sinkron dengan home
        name_product: nama,
        price: harga,
        stock: stok,
        description: deskripsi,
        // SIMPAN BASE64 KE DALAM LOCALSTORAGE, BUKAN NAMA FILE
        image_product: base64Image 
    };

    products.push(produkBaru);
    localStorage.setItem('sembako_products', JSON.stringify(products));

    alert("✅ Produk berhasil ditambahkan!");
    window.location.href = "admin-produk.html";
}
// 5. LOGOUT
function handleLogout(event) {
    event.preventDefault();
    if (confirm("Keluar dari panel admin?")) {
        window.location.href = "login.html";
    }
}