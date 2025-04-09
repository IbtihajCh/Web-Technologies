document.addEventListener('DOMContentLoaded', function() {
    // Handle all dropdown menus
    const navItems = document.querySelectorAll('.nav-item.dropdown');
    
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const menu = item.querySelector('.dropdown-menu, .mega-menu');
        
        if (link && menu) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Close all other menus
                document.querySelectorAll('.dropdown-menu, .mega-menu').forEach(otherMenu => {
                    if (otherMenu !== menu) {
                        otherMenu.style.display = 'none';
                    }
                });
                
                // Toggle current menu
                if (menu.style.display === 'block') {
                    menu.style.display = 'none';
                } else {
                    menu.style.display = 'block';
                }
            });
        }
    });

    // Close menus when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-item.dropdown')) {
            document.querySelectorAll('.dropdown-menu, .mega-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });

    // Handle mega menu links
    const megaMenuLinks = document.querySelectorAll('.mega-menu a[href]');
    megaMenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent the click from closing the menu
        });
    });

    const workIcon = document.querySelector('.header__icon--work');
    const workMegaMenu = document.querySelector('.work-mega-menu');
    let isWorkMenuOpen = false;

    // Handle work icon click
    workIcon.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        isWorkMenuOpen = !isWorkMenuOpen;
        workMegaMenu.style.display = isWorkMenuOpen ? 'block' : 'none';
    });

    // Close work menu when clicking outside
    document.addEventListener('click', function(e) {
        if (isWorkMenuOpen && !workMegaMenu.contains(e.target) && !workIcon.contains(e.target)) {
            workMegaMenu.style.display = 'none';
            isWorkMenuOpen = false;
        }
    });

    // Handle work menu links
    const workMenuLinks = document.querySelectorAll('.work-mega-menu a[href]');
    workMenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}); 