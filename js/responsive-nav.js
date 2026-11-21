// js/responsive-nav.js  (plain script, runs after DOM)
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.menu-toggle');
    if (!sidebar || !toggle) return;

    // Create overlay
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    const open = () => { sidebar.classList.add('open'); overlay.classList.add('show'); };
    const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.contains('open') ? close() : open();
    });
    overlay.addEventListener('click', close);

    // Close drawer when a nav link is tapped (mobile UX)
    sidebar.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) close();
        });
    });
});