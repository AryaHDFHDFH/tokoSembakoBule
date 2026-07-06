// ============================================================
//  SIDEBAR TOGGLE - FULLY FIXED
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('mobile-left-sidebar');
    const mainContent = document.querySelector('.main-content'); // Sesuaikan class ini
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('open-sidebar-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');
    const body = document.body;

    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        body.classList.add('sidebar-active');
        body.style.overflow = 'hidden';
    }

    function toggleSidebar() {
    sidebar.classList.toggle('active');
    mainContent.classList.toggle('pushed');
}
    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        body.classList.remove('sidebar-active');
        body.style.overflow = '';
    }

    if (openBtn) {
        openBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openSidebar();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Tutup sidebar dengan tombol ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });

    // Tutup sidebar saat resize ke desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 992 && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
});