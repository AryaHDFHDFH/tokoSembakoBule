// ==========================================================================
// --- DATA KATEGORI UTAMA SEMBAKO BULE (PERMANEN & AKURAT) ---
// ==========================================================================
const SEED_CATEGORIES = [
    { id_category: 1, name_category: "Bahan Pokok (Utama)" },
    { id_category: 2, name_category: "Mie, Pasta & Makanan Instan" },
    { id_category: 3, name_category: "Produk Susu & Telur (Dairy & Eggs)" },
    { id_category: 4, name_category: "Bumbu Dapur & Penyedap" },
    { id_category: 5, name_category: "Minuman & Pendamping (Beverages)" },
    { id_category: 6, name_category: "Perlengkapan Rumah Tangga (Home Care)" }
];

// Kunci Otomatisasi Deploy: Naikkan versi jika kamu mengubah SEED_CATEGORIES di masa depan
const KATEGORI_VERSION = "v2_production"; 

function getCategories() {
    let data = localStorage.getItem('sembako_categories');
    let currentVersion = localStorage.getItem('sembako_categories_version');
    
    // LOGIKA AUTOMATIC OVERWRITE: 
    // Jika data belum ada ATAU versi yang tersimpan berbeda dengan versi produksi,
    // maka sistem akan langsung menimpa data lama dengan data permanen secara paksa.
    if (!data || currentVersion !== KATEGORI_VERSION) {
        localStorage.setItem('sembako_categories', JSON.stringify(SEED_CATEGORIES));
        localStorage.setItem('sembako_categories_version', KATEGORI_VERSION);
        return SEED_CATEGORIES;
    }
    
    return JSON.parse(data);
}

// ==========================================================================
// --- RENDER TABLE DATA ---
// ==========================================================================
function renderCategoryTable() {
    const categories = getCategories();
    const tbody = document.getElementById('categoryTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = "";

    if (categories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:25px;">Belum ada data kategori.</td></tr>`;
        return;
    }

    categories.forEach(c => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #edf2f7";
        tr.innerHTML = `
            <td style="padding: 12px; color: var(--navy-deep); vertical-align: middle;"><strong>#${c.id_category}</strong></td>
            <td style="padding: 12px; color: #4a5568; vertical-align: middle;">${escapeHTML(c.name_category)}</td>
            <td style="padding: 12px; text-align: center; gap: 8px; justify-content: center; display: flex; vertical-align: middle;">
                <button onclick="openEditModal(${c.id_category}, '${escapeQuotes(c.name_category)}')" 
                        style="border: none; background: rgba(212, 175, 55, 0.1); color: #d4af37; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Ubah">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteCategory(${c.id_category})" 
                        style="border: none; background: rgba(214, 48, 49, 0.1); color: #d63031; padding: 6px 10px; border-radius: 6px; cursor: pointer;" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================================================
// --- MODAL OPERATIONS ---
// ==========================================================================
function openAddModal() {
    document.getElementById('modalTitle').innerText = "Tambah Kategori Baru";
    document.getElementById('category_id_hidden').value = "";
    document.getElementById('name_category').selectedIndex = 0;
    document.getElementById('modalKategori').style.display = 'flex';
}

function openEditModal(id, currentName) {
    document.getElementById('modalTitle').innerText = "Ubah Nama Kategori";
    document.getElementById('category_id_hidden').value = id;
    document.getElementById('name_category').value = currentName;
    document.getElementById('modalKategori').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalKategori').style.display = 'none';
    document.getElementById('category_id_hidden').value = "";
    document.getElementById('name_category').value = "";
}

// ==========================================================================
// --- FORM SUBMIT INTERACTION ---
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const formKategori = document.getElementById('formKategori');
    if (formKategori) {
        formKategori.addEventListener('submit', function(e) {
            e.preventDefault();
            const nameInput = document.getElementById('name_category').value.trim();
            const hiddenId = document.getElementById('category_id_hidden').value;

            if (!nameInput) return;
            let categories = getCategories();

            if (hiddenId === "") {
                const isExist = categories.some(item => item.name_category.toLowerCase() === nameInput.toLowerCase());
                if (isExist) {
                    alert("Kategori ini sudah terdaftar di sistem!");
                    return;
                }

                const nextId = categories.length > 0 ? Math.max(...categories.map(item => item.id_category)) + 1 : 1;
                categories.push({
                    id_category: nextId,
                    name_category: nameInput
                });
                showNotification("Kategori baru berhasil ditambahkan!");
            } else {
                const index = categories.findIndex(item => item.id_category === parseInt(hiddenId));
                if (index !== -1) {
                    categories[index].name_category = nameInput;
                    showNotification("Nama kategori berhasil diperbarui!");
                }
            }

            localStorage.setItem('sembako_categories', JSON.stringify(categories));
            closeModal();
            renderCategoryTable();
        });
    }
});

// ==========================================================================
// --- OPERATIONS & UTILS ---
// ==========================================================================
function deleteCategory(id) {
    if (confirm('Hapus kategori ini? Produk di dalamnya akan kehilangan referensi kategori.')) {
        let categories = getCategories();
        categories = categories.filter(item => item.id_category !== id);
        
        localStorage.setItem('sembako_categories', JSON.stringify(categories));
        renderCategoryTable();
        showNotification("Kategori berhasil dihapus!");
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

function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

function escapeQuotes(str) {
    if (!str) return "";
    return str.replace(/'/g, "\\'");
}

// ==========================================================================
// --- INITIALIZATION ON LOAD ---
// ==========================================================================
window.onload = function() {
    const savedAdminName = localStorage.getItem('admin_name') || "Administrator Utama";
    const adminDisplay = document.getElementById('admin-display-name');
    if (adminDisplay) adminDisplay.innerText = savedAdminName;
    renderCategoryTable();
};