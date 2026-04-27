let currentLang = 'ru';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    document.getElementById('lang-switch').value = lang;
    localStorage.setItem('lang', lang);

    updateTranslations();

    // Sync to server if logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        user.language = lang;
        localStorage.setItem('user', JSON.stringify(user));
        syncUserDataToServer(user.email, JSON.parse(localStorage.getItem('wishlist') || '[]'), JSON.parse(localStorage.getItem('cart') || '[]'), lang);
    }
}

function updateTranslations() {
    const dict = translations[currentLang];

    // Text contents
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerHTML = dict[key];
        }
    });

    // Placeholders
    const i18nPlaceholders = document.querySelectorAll('[data-i18n-placeholder]');
    i18nPlaceholders.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.setAttribute('placeholder', dict[key]);
        }
    });

    // Optionals
    document.title = dict['site_title'] || document.title;
}

document.getElementById('lang-switch')?.addEventListener('change', (e) => {
    setLanguage(e.target.value);
});

// Brands Spotlight Tracker
function initBrandSpotlight() {
    const marquee = document.querySelector('.marquee-content');
    const pills = document.querySelectorAll('.brand-pill');
    if (!marquee || pills.length === 0) return;

    function checkPositions() {
        const viewportWidth = window.innerWidth;
        const centerX = viewportWidth / 2;
        const radius = 180; // Distance from center where light is strongest

        pills.forEach(pill => {
            const rect = pill.getBoundingClientRect();
            const pillCenter = rect.left + rect.width / 2;
            const distance = Math.abs(pillCenter - centerX);

            if (distance < radius) {
                pill.classList.add('in-light');
            } else {
                pill.classList.remove('in-light');
            }
        });

        requestAnimationFrame(checkPositions);
    }

    requestAnimationFrame(checkPositions);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Attempt to keep language if saved in localStorage or user account
    let savedLang = localStorage.getItem('lang') || 'ru';
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        if (user.language) {
            savedLang = user.language;
            localStorage.setItem('lang', savedLang);
        }
    }
    setLanguage(savedLang);

    // Spotlight Reveal Support
    initBrandSpotlight();

    // Auto-scroll active nav link into view on mobile
    const activeNav = () => {
        const path = window.location.pathname.toLowerCase();
        const navLinks = document.querySelectorAll('.nav-link');
        const navContainer = document.querySelector('.nav-container');
        
        let foundActive = null;
        navLinks.forEach(link => {
            const href = link.getAttribute('href').toLowerCase();
            const filename = link.getAttribute('data-filename')?.toLowerCase();
            
            // Match logic: /wholesale matches /wholesale, wholesale.html matches wholesale.html
            if (path.endsWith(href) || (filename && path.endsWith(filename)) || (path === '/' && href === '/index')) {
                link.classList.add('active');
                foundActive = link;
            } else {
                link.classList.remove('active');
            }
        });

        if (foundActive && navContainer && window.innerWidth <= 768) {
            // Use a slightly longer timeout to ensure layout is ready
            setTimeout(() => {
                const scrollPos = foundActive.offsetLeft - (navContainer.offsetWidth / 2) + (foundActive.offsetWidth / 2);
                navContainer.scrollLeft = scrollPos;
                // Also try smooth if supported, but immediate first
                navContainer.scrollTo({
                    left: scrollPos,
                    behavior: 'smooth'
                });
            }, 300);
        }
    };
    activeNav();

    // Dynamic Projects Loading
    if (document.getElementById('dynamic-projects')) {
        loadHomeProjects();
    }

    // Dynamic Product Loading
    const pageTitleEl = document.querySelector('.category-hero h1') || document.querySelector('.page-title');
    if (pageTitleEl && document.querySelector('.product-grid')) {
        const i18nKey = pageTitleEl.getAttribute('data-i18n');
        let category = '';
        let categoryId = null;
        if (i18nKey === 'nav_all_products') category = 'All Products';
        else if (i18nKey === 'shop_header' || i18nKey === 'nav_ac') { category = 'Air Conditioners'; categoryId = 1; }
        else if (i18nKey === 'nav_cctv') { category = 'CCTV Systems'; categoryId = 2; }
        else if (i18nKey === 'nav_gates') { category = 'Automatic Gates'; categoryId = 3; }
        else if (i18nKey === 'nav_intercom') { category = 'Intercom Systems'; categoryId = 4; }
        else if (i18nKey === 'nav_spare_parts') { category = 'Spare Parts'; categoryId = 5; }

        if (category) {
            loadProducts(category);
            if (category === 'All Products') loadBrandsForCategory();
            else if (categoryId) loadBrandsForCategory(categoryId);
        }
    }

    // Filter Logic Initialization
    initFilters();

    // Global Search Logic
    initGlobalSearch();

    // Global counts
    updateHeaderCounts();
    initViewToggles();
    highlightActiveNav();
});

function highlightActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        // Normalize paths for comparison
        let normalizedPath = currentPath === '/' ? '/' : currentPath.replace('.html', '');
        let normalizedHref = href === '/index' ? '/' : href.replace('.html', '');
        
        // Handle cases like /admin_s_66_66 -> /admin mapping
        const mappings = {
            '/admin_s_66_66': '/admin',
            '/contact': '/contacts',
            '/all-products': '/products',
            '/installation-services': '/installation',
            '/air-conditioners': '/air-conditioning',
            '/automatic-gates': '/gates',
            '/intercom-systems': '/intercom',
            '/cctv-systems': '/cctv',
            '/spare-parts': '/spare-parts'
        };

        if (mappings[normalizedPath]) normalizedPath = mappings[normalizedPath];
        if (mappings[normalizedHref]) normalizedHref = mappings[normalizedHref];

        if (normalizedPath === normalizedHref) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

async function loadHomeProjects() {
    const grid = document.getElementById('dynamic-projects');
    if (!grid) return;

    try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error("Server error: " + res.status);
        const data = await res.json();
        let projects = data.data || [];
        
        // Randomize and pick 3
        projects = projects.sort(() => 0.5 - Math.random()).slice(0, 3);

        if (projects.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Проекты скоро будут добавлены.</p>';
            return;
        }

        grid.innerHTML = projects.map(p => `
            <div class="project-card" data-id="${p.id}">
                <div class="project-img-wrapper">
                    <div class="project-img" onclick="toggleProjectVideo(this.parentElement.parentElement)">
                        ${p.video_url ? 
                            `<video src="${p.video_url}" muted loop playsinline></video>` : 
                            '<i class="fa-solid fa-play" style="font-size: 40px; color: var(--primary);"></i>'
                        }
                        <div class="video-overlay-actions">
                            <button onclick="handleInteraction(${p.id}, 'likes', event)" class="v-action-btn"><i class="fa-regular fa-heart"></i> <span>${p.likes || 0}</span></button>
                            <button onclick="handleInteraction(${p.id}, 'saves', event)" class="v-action-btn"><i class="fa-regular fa-bookmark"></i> <span>${p.saves || 0}</span></button>
                            <button onclick="openVideoShareMenu(${p.id}, event)" class="v-action-btn"><i class="fa-regular fa-paper-plane"></i> <span>${p.shares || 0}</span></button>
                            <button onclick="openCommentSheet(${p.id}, event)" class="v-action-btn comment-btn"><i class="fa-regular fa-comment"></i> <span>${p.comments_count || 0}</span></button>
                        </div>
                    </div>
                </div>
                <div class="project-info">
                    <div class="proj-badge">PREMIUM CASE</div>
                    <h5>${p.title}</h5>
                    <p>${p.description}</p>
                    
                    <div class="project-footer-meta">
                         <div class="comments-preview" onclick="openComments(${p.id})">
                             <i class="fa-regular fa-comment"></i> ${p.comments_count || 0} comments
                         </div>
                         <button class="download-proj-btn" onclick="downloadProject('${p.video_url}', event)"><i class="fa-solid fa-download"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // After rendering, apply user activity status (liked/saved/etc)
        applyUserActivityStatus();

        // Play video on hover
        document.querySelectorAll('.project-card').forEach(card => {
            const video = card.querySelector('video');
            if (video) {
                card.addEventListener('mouseenter', () => video.play());
                card.addEventListener('mouseleave', () => {
                    if (!video.classList.contains('is-fullscreen')) video.pause();
                });
            }
        });
    } catch (err) {
        console.error("Failed to load projects", err);
    }
}

function toggleProjectVideo(card) {
    const video = card.querySelector('video');
    if (!video) return;

    // Remove existing lightboxes
    const existing = document.getElementById('video-lightbox');
    if (existing) existing.remove();

    const lightbox = document.createElement('div');
    lightbox.id = 'video-lightbox';
    lightbox.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); backdrop-filter: blur(15px);
        display: flex; align-items: center; justify-content: center;
        z-index: 10000; cursor: zoom-out;
    `;

    const videoClone = video.cloneNode(true);
    videoClone.style.cssText = `
        max-width: 90vw; max-height: 85vh; border-radius: 20px;
        box-shadow: 0 30px 100px rgba(0,0,0,0.8), 0 0 50px rgba(16, 185, 129, 0.2);
        cursor: default; object-fit: contain;
    `;
    videoClone.controls = true;
    videoClone.muted = false;
    videoClone.play();

    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        position: absolute; top: 40px; right: 40px; color: white;
        font-size: 50px; cursor: pointer; line-height: 1;
    `;

    lightbox.appendChild(videoClone);
    lightbox.appendChild(closeBtn);
    document.body.appendChild(lightbox);

    lightbox.onclick = (e) => { if(e.target !== videoClone) lightbox.remove(); };
    closeBtn.onclick = () => lightbox.remove();
}

function initGlobalSearch() {
    const searchInput = document.getElementById('global-search');
    let suggestions = document.getElementById('search-suggestions');
    const searchBar = document.querySelector('.search-bar');

    if (!searchInput) return;

    // Create suggestions element if it doesn't exist
    if (!suggestions) {
        suggestions = document.createElement('div');
        suggestions.id = 'search-suggestions';
        suggestions.className = 'search-suggestions-box';
        // Add styling via JS to ensure it works on all pages
        Object.assign(suggestions.style, {
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: '0',
            width: '100%',
            background: '#0D1421',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: '1000',
            display: 'none',
            padding: '10px 0',
            opacity: '0',
            transform: 'translateY(-10px)',
            transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
        });
        searchInput.closest('.search-wrap').appendChild(suggestions);
    }

    let allHints = [];

    const loadHints = async () => {
        try {
            // Fetch ALL hints to enable client-side filtering while typing
            const res = await fetch('/api/search-hints-all');
            const data = await res.json();
            allHints = data.data || [];
            updateSuggestionsUI(searchInput.value);
        } catch (e) {
            console.error('Failed to load search hints', e);
        }
    };

    const updateSuggestionsUI = (filterText = '') => {
        let filtered;
        let title = "Популярные запросы";

        if (!filterText.trim()) {
            // Show random 10 if input is empty
            filtered = [...allHints].sort(() => 0.5 - Math.random()).slice(0, 10);
        } else {
            // Filter by input text
            filtered = allHints.filter(h => h.text.toLowerCase().includes(filterText.toLowerCase()));
            title = filtered.length > 0 ? "Результаты поиска" : "Ничего не найдено";
        }

        if (filtered.length > 0) {
            suggestions.innerHTML = `
                <div style="padding: 10px 20px; font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 1px;">${title}</div>
                <div class="hints-list">
                    ${filtered.map(h => `
                        <div class="suggestion-item" style="padding: 10px 20px; color: white; cursor: pointer; font-size: 13.5px; transition: 0.2s;" onclick="applySearchHint('${h.text.replace(/'/g, "\\'")}', '${h.category || ''}')">
                            <i class="fa-solid fa-magnifying-glass" style="font-size: 12px; margin-right: 12px; color: var(--text-muted);"></i>
                            ${h.text} ${h.category ? `<span style="font-size: 11px; opacity: 0.6; margin-left: 5px;">(${h.category})</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            suggestions.innerHTML = `
                <div style="padding: 10px 20px; font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 1px;">${title}</div>
                <div style="padding: 20px; color: var(--text-muted); text-align: center; font-size: 13px;">По вашему запросу ничего не найдено</div>
            `;
        }
    };

    window.applySearchHint = (text, category = '') => {
        searchInput.value = text;
        suggestions.style.display = 'none';
        // Redirect with both search and category if present
        let url = `all-products.html?search=${encodeURIComponent(text)}`;
        if (category && category !== 'undefined') url += `&category=${encodeURIComponent(category)}`;
        window.location.href = url;
    };

    // We removed the nested performSearch here so that it uses the global one which handles shouldRedirect properly

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateSuggestionsUI(val);
            // Ensure it stays visible during typing
            suggestions.style.display = 'block';
            suggestions.style.opacity = '1';
            suggestions.style.transform = 'translateY(0)';
        }, 200); // 200ms delay to prevent lagging
    });

    // Handle Enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    // Handle Search Button Click (delegated)
    document.addEventListener('click', (e) => {
        if (e.target.closest('#search-submit-btn')) {
            performSearch(searchInput.value);
        }
    });

    searchInput.addEventListener('focus', async () => {
        if (allHints.length === 0) await loadHints();
        else updateSuggestionsUI(searchInput.value);
        
        suggestions.style.display = 'block';
        setTimeout(() => {
            suggestions.style.opacity = '1';
            suggestions.style.transform = 'translateY(0)';
        }, 10);
    });

    // Handle blur more carefully - don't close if clicking inside suggestions
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            // Check if focus is still within suggestions or search input
            if (!document.activeElement?.closest('.search-wrap')) {
                suggestions.style.opacity = '0';
                suggestions.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    if (suggestions.style.opacity === '0') suggestions.style.display = 'none';
                }, 300);
            }
        }, 300); // More time to catch clicks
    });

    // Add CSS for hover effect
    if (!document.getElementById('suggestion-hover-css')) {
        const style = document.createElement('style');
        style.id = 'suggestion-hover-css';
        style.innerHTML = `
            .suggestion-item:hover {
                background: rgba(16, 185, 129, 0.1);
                color: var(--primary) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Note: Enter key is already handled by the 'keydown' listener above

    // Ctrl + / Shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // Check for search param on arrival
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        searchInput.value = searchQuery;
        performSearch(searchQuery, false); // Don't redirect if already there
    }
}

function quickSearch(query) {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.value = query;
        performSearch(query);
    }
}

function performSearch(query, shouldRedirect = true) {
    if (shouldRedirect && !window.location.pathname.includes('all-products.html')) {
        window.location.href = `all-products.html?search=${encodeURIComponent(query)}`;
        return;
    }

    // If already on all-products.html, filter locally
    const filterEvent = new CustomEvent('performLocalSearch', { detail: query });
    window.dispatchEvent(filterEvent);
}

// ✅ Single global listener for local search — registered ONCE, not inside loadProducts()
window.addEventListener('performLocalSearch', (e) => {
    const localQuery = e.detail.toLowerCase();
    const allData = window._loadedProductsData || [];
    const filtered = allData.filter(p =>
        (p.title && p.title.toLowerCase().includes(localQuery)) ||
        (p.category && p.category.toLowerCase().includes(localQuery)) ||
        (p.description && p.description.toLowerCase().includes(localQuery))
    );
    const titleEl = document.querySelector('.category-hero h1') || document.querySelector('.page-title');
    if (titleEl) titleEl.innerText = `${currentLang === 'ru' ? 'Результаты поиска' : 'Search Results'}: "${e.detail}"`;
    renderProducts(filtered);
});

function updateHeaderCounts() {
    const isLoggedIn = !!localStorage.getItem('user');
    const wishlist = isLoggedIn ? JSON.parse(localStorage.getItem('wishlist') || '[]') : [];
    const cart = isLoggedIn ? JSON.parse(localStorage.getItem('cart') || '[]') : [];

    // Header heart icon count
    const heartBtn = document.querySelector('.fa-regular.fa-heart, .fa-solid.fa-heart');
    const heartAction = heartBtn?.parentElement;
    if (heartAction) {
        let badge = heartAction.querySelector('.count-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'count-badge';
            badge.style.cssText = 'position: absolute; top: -6px; right: -6px; background: var(--primary); color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; border: 2px solid var(--bg-light);';
            heartAction.style.position = 'relative';
            heartAction.appendChild(badge);
        }
        badge.innerText = wishlist.length;
        badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
        heartAction.onclick = () => {
            if (!isLoggedIn) {
                window.location.href = 'auth.html';
            } else {
                window.location.href = 'wishlist.html';
            }
        };
    }

    // Header cart icon count
    const cartBtn = document.querySelector('.fa-cart-shopping');
    const cartAction = cartBtn?.parentElement;
    if (cartAction) {
        let badge = cartAction.querySelector('span:not(.count-badge)');
        if (!badge) {
            badge = document.createElement('span');
            badge.style.cssText = 'position: absolute; top: -6px; right: -6px; background: var(--primary); color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; border: 2px solid var(--bg-light);';
            cartAction.appendChild(badge);
        }
        const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
        cartAction.onclick = () => {
            if (!isLoggedIn) {
                window.location.href = 'auth.html';
            } else {
                window.location.href = 'cart.html';
            }
        };
    }

    // User Session Update in Header (Premium Avatar Logic)
    const userStr = localStorage.getItem('user');
    const userAction = document.querySelector('.action-btn i.fa-user, .action-btn i.fa-regular.fa-user')?.parentElement;

    if (userAction && userStr) {
        const user = JSON.parse(userStr);

        // Extract Initials
        const nameParts = user.full_name.trim().split(/\s+/);
        let initials = "";
        if (nameParts.length >= 2) {
            initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        } else {
            initials = (nameParts[0][0] + (nameParts[0][1] || "")).toUpperCase();
        }

        // Generate consistent color
        const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];
        let hash = 0;
        for (let i = 0; i < user.email.length; i++) hash = user.email.charCodeAt(i) + ((hash << 5) - hash);
        const randomColor = colors[Math.abs(hash % colors.length)];

        // Update UI
        const cabinetText = currentLang === 'ru' ? 'Личный кабинет' : (currentLang === 'kz' ? 'Жеке кабинет' : 'Personal Cabinet');
        userAction.innerHTML = `
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${randomColor}; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; color:white; margin-right:8px; box-shadow: 0 0 15px ${randomColor}44;">${initials}</div>
            <div style="text-align: left; line-height:1.2;">
                <div style="font-size:13px; font-weight:700; color:white;">${(user.display_name || user.full_name).toUpperCase()}</div>
                <div style="font-size:11px; color:var(--text-muted); font-weight: 500;">${cabinetText}</div>
            </div>
        `;
        userAction.style.border = "none";
        userAction.style.background = "rgba(255,255,255,0.02)";
        userAction.onclick = () => window.location.href = 'profile.html';
    } else if (userAction) {
        userAction.onclick = () => window.location.href = 'auth.html';
    }
}

function toggleWishlist(product) {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        const msg = currentLang === 'ru' ? "Пожалуйста, войдите в аккаунт, чтобы добавить в избранное!" : (currentLang === 'kz' ? "Таңдаулыларға қосу үшін жүйеге кіріңіз!" : "Please login to add to wishlist!");
        alert(msg);
        window.location.href = 'auth.html';
        return;
    }
    const user = JSON.parse(userStr);
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlist.findIndex(p => p.id === product.id);
    if (index === -1) {
        wishlist.push(product);
    } else {
        wishlist.splice(index, 1);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateHeaderCounts();
    syncUserDataToServer(user.email, wishlist, JSON.parse(localStorage.getItem('cart') || '[]'));
}

function addToCart(product) {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        alert(currentLang === 'ru' ? "Пожалуйста, войдите в аккаунт, чтобы добавить в корзину!" : "Iltimos, savatchaga qo'shish uchun tizimga kiring!");
        window.location.href = 'auth.html';
        return;
    }
    const user = JSON.parse(userStr);
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(p => p.id === product.id);
    if (index === -1) {
        cart.push({ ...product, quantity: 1 });
    } else {
        cart[index].quantity += 1;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateHeaderCounts();
    syncUserDataToServer(user.email, JSON.parse(localStorage.getItem('wishlist') || '[]'), cart);
    alert(currentLang === 'ru' ? "Товар добавлен в корзину!" : "Mahsulot savatchaga qo'shildi!");
}

async function syncUserDataToServer(email, wishlist, cart, language = null) {
    try {
        const payload = { email, wishlist, cart };
        if (language) payload.language = language;
        
        await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Sync failed", e);
    }
}

async function loadBrandsForCategory(catId = null) {
    try {
        const res = await fetch('/api/brands');
        const data = await res.json();
        let brands = data.data;
        if (catId) {
            brands = brands.filter(b => b.category_id == catId);
        }
        const brandList = document.querySelector('.brand-filter-list');
        if (brandList) {
            if (brands.length > 0) {
                brandList.innerHTML = brands.map(b => `
                    <label class="checkbox-item" style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" class="brand-check" value="${b.name}">
                        ${b.name}
                    </label>
                `).join('');
            } else {
                brandList.innerHTML = '<p style="font-size:12px; color:var(--text-muted);">No brands available</p>';
            }
        }
    } catch (err) {
        console.error("Failed to load brands", err);
    }
}


function initFilters() {
    const applyBtn = document.getElementById('apply-filters-btn');
    const resetBtn = document.getElementById('reset-filters-btn');
    const priceRange = document.getElementById('price-range');
    const minPriceInput = document.getElementById('min-price-input');
    const maxPriceInput = document.getElementById('max-price-input');

    if (priceRange && maxPriceInput) {
        // Sync range to max input
        priceRange.addEventListener('input', () => {
            maxPriceInput.value = priceRange.value;
        });
        // Sync input to range
        maxPriceInput.addEventListener('input', () => {
            priceRange.value = maxPriceInput.value;
        });
        minPriceInput?.addEventListener('input', () => {
            // Optional: ensuring min < max logic
            if (parseInt(minPriceInput.value) > parseInt(maxPriceInput.value)) {
                maxPriceInput.value = minPriceInput.value;
                priceRange.value = maxPriceInput.value;
            }
        });
    }

    applyBtn?.addEventListener('click', () => {
        const selectedCategories = Array.from(document.querySelectorAll('.category-check:checked')).map(cb => cb.value);
        const selectedBrands = Array.from(document.querySelectorAll('.brand-check:checked')).map(cb => cb.value);
        const minPrice = parseInt(minPriceInput?.value || 0);
        const maxPrice = parseInt(maxPriceInput?.value || 2000000);

        // Validation: Must select at least one brand (or category if on All Products)
        if (selectedCategories.length === 0 && selectedBrands.length === 0) {
            alert(currentLang === 'ru' ? "Пожалуйста, выберите хотя бы один бренд или категорию!" : "Iltimos, kamida bitta brend yoki kategoriyani tanlang!");
            return;
        }

        // Get current page category to keep filtering within context
        const pageTitleEl = document.querySelector('.category-hero h1') || document.querySelector('.page-title');
        const i18nKey = pageTitleEl?.getAttribute('data-i18n');
        let currentCategory = '';
        if (i18nKey === 'nav_ac') currentCategory = 'Air Conditioners';
        else if (i18nKey === 'nav_cctv') currentCategory = 'CCTV Systems';
        else if (i18nKey === 'nav_gates') currentCategory = 'Automatic Gates';
        else if (i18nKey === 'nav_intercom') currentCategory = 'Intercom Systems';
        else if (i18nKey === 'nav_spare_parts') currentCategory = 'Spare Parts';

        filterProducts({
            categories: selectedCategories.length > 0 ? selectedCategories : (currentCategory ? [currentCategory] : []),
            brands: selectedBrands,
            minPrice,
            maxPrice
        });
    });

    resetBtn?.addEventListener('click', () => {
        document.querySelectorAll('.category-check, .brand-check').forEach(cb => cb.checked = false);
        if (minPriceInput) minPriceInput.value = 0;
        if (maxPriceInput) maxPriceInput.value = 2000000;
        if (priceRange) priceRange.value = 2000000;

        const pageTitleEl = document.querySelector('.category-hero h1') || document.querySelector('.page-title');
        const i18nKey = pageTitleEl?.getAttribute('data-i18n');
        let initialCategory = (i18nKey === 'nav_all_products') ? 'All Products' : '';
        // If we're on a specific category page, keep that category
        if (!initialCategory) {
            if (i18nKey === 'nav_ac') initialCategory = 'Air Conditioners';
            else if (i18nKey === 'nav_cctv') initialCategory = 'CCTV Systems';
            else if (i18nKey === 'nav_gates') initialCategory = 'Automatic Gates';
            else if (i18nKey === 'nav_intercom') initialCategory = 'Intercom Systems';
        }
        loadProducts(initialCategory);
    });
}

async function filterProducts(filters) {
    try {
        const res = await fetch('/api/products');
        const data = await res.json();
        let products = data.data;

        // Apply filters locally for speed and flexibility
        if (filters.categories && filters.categories.length > 0) {
            products = products.filter(p => filters.categories.includes(p.category));
        }
        if (filters.brands && filters.brands.length > 0) {
            products = products.filter(p => filters.brands.some(brand =>
                (p.title && p.title.toLowerCase().includes(brand.toLowerCase())) ||
                (p.brand && p.brand.toLowerCase().includes(brand.toLowerCase()))
            ));
        }
        products = products.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

        renderProducts(products);
    } catch (err) {
        console.error("Filtering failed", err);
    }
}

async function loadProducts(category) {
    try {
        let url = '/api/products';
        if (category && category !== 'All Products') {
            url += '?category=' + encodeURIComponent(category);
        }

        const res = await fetch(url);
        let data = await res.json();
        let products = data.data;

        // Handle Global Search filtering
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
            products = products.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            // Update page title if searching
            const titleEl = document.querySelector('.category-hero h1') || document.querySelector('.page-title');
            if (titleEl) titleEl.innerText = `Результаты поиска: "${searchQuery}"`;
        }

        if (category === 'All Products' && !searchQuery) {
            products = products.sort(() => Math.random() - 0.5);
        }

        renderProducts(products);

        // Store loaded data globally so the local search listener can access it
        window._loadedProductsData = data.data;

    } catch (err) {
        console.error("Failed to load products", err);
    }
}

let currentViewMode = 'grid'; // 'grid' or 'list'
let currentProducts = [];

function initViewToggles() {
    const gridBtn = document.querySelector('.view-btn:first-child');
    const listBtn = document.querySelector('.view-btn:nth-child(2)');
    const sortSelect = document.querySelector('.sort-dropdown');

    gridBtn?.addEventListener('click', () => {
        currentViewMode = 'grid';
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
        renderProducts(currentProducts);
    });

    listBtn?.addEventListener('click', () => {
        currentViewMode = 'list';
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
        renderProducts(currentProducts);
    });

    sortSelect?.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'low') {
            currentProducts.sort((a, b) => a.price - b.price);
        } else if (val === 'high') {
            currentProducts.sort((a, b) => b.price - a.price);
        } else if (val === 'popular') {
            currentProducts.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        }
        renderProducts(currentProducts);
    });
}

function renderProducts(products) {
    currentProducts = products;
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    grid.innerHTML = '';
    if (currentViewMode === 'list') grid.classList.add('list-view');
    else grid.classList.remove('list-view');

    if (products.length === 0) {
        const notFoundText = currentLang === 'ru' ? 'Товары не найдены.' : (currentLang === 'kz' ? 'Тауарлар табылмады.' : 'No products found.');
        grid.innerHTML = `<p style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 40px;">${notFoundText}</p>`;
        return;
    }

    products.forEach(p => {
        let imageSrc = p.image_url;
        if (!imageSrc || imageSrc === 'AC') {
            imageSrc = 'uploads/placeholder.png';
        } else if (!imageSrc.startsWith('http')) {
            imageSrc = '/' + imageSrc;
        }

        const isLoggedIn = !!localStorage.getItem('user');
        const wishlist = isLoggedIn ? JSON.parse(localStorage.getItem('wishlist') || '[]') : [];
        const isLiked = wishlist.some(wp => wp.id === p.id);
        const oldPriceHtml = p.oldPrice ? `<span class="p-price-old" style="color:var(--text-muted); text-decoration:line-through; font-size:14px; margin-left:8px;">₸${p.oldPrice.toLocaleString()}</span>` : '';

        const card = document.createElement('div');
        card.className = `product-card ${currentViewMode === 'list' ? 'list-mode' : ''}`;
        card.onclick = (e) => {
            if (e.target.closest('button') || e.target.closest('.fa-heart')) return;
            window.location.href = `product.html?id=${p.id}`;
        };

        if (currentViewMode === 'grid') {
            card.style.cssText = 'background: #0D1421; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 22px; position: relative; display: flex; flex-direction: column; justify-content: space-between; overflow: visible; cursor: pointer;';
            card.innerHTML = `
                <span class="badge-top" style="background: var(--primary); color: white; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; position: absolute; top: 15px; left: 15px; z-index: 2;">${p.badge || translations[currentLang]['badge_new']}</span>
                <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart" style="position:absolute; top:20px; right:20px; color: ${isLiked ? 'var(--primary)' : 'white'}; cursor:pointer; z-index: 10; font-size: 18px; transition: 0.2s;" onclick="event.stopPropagation(); toggleWishlist(${JSON.stringify(p).replace(/"/g, '&quot;')}); this.classList.toggle('fa-regular'); this.classList.toggle('fa-solid'); this.style.color = this.classList.contains('fa-solid') ? 'var(--primary)' : 'white';"></i>
                <div class="p-image" style="height: 180px; display:flex; align-items:center; justify-content:center; margin-bottom: 25px; padding-top: 25px;">
                    <img src="${imageSrc}" style="max-height: 100%; max-width: 100%; object-fit: contain;" onerror="this.src='uploads/placeholder.png'">
                </div>
                <h3 class="p-title" style="color: white; font-size: 16px; font-weight: 700; margin-bottom: 6px;">${p.title}</h3>
                <div class="p-rating" style="font-size: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-star" style="color:var(--primary);"></i><span style="color:var(--primary); font-weight:600; font-size:13px;">${p.rating || 4.8}</span> <span style="color: white;">(${p.reviews || 0} ${translations[currentLang]['reviews']})</span>
                </div>
                <div class="p-price" style="font-size: 24px; font-weight: 800; color: var(--primary); margin-bottom: 20px;">₸${p.price.toLocaleString()} ${oldPriceHtml}</div>
                <button class="btn-add" onclick="event.stopPropagation(); addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})" style="background: var(--primary); color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 700; width: 100%; cursor: pointer;">
                    <i class="fa-solid fa-cart-shopping"></i> ${translations[currentLang]['add_to_cart']}
                </button>
            `;
        } else {
            card.style.cssText = 'background: #0D1421; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; display: flex; overflow: hidden; cursor: pointer; transition: 0.2s;';
            card.innerHTML = `
                <div class="p-image">
                    <img src="${imageSrc}" style="max-height: 100%; max-width: 100%; object-fit: contain;" onerror="this.src='uploads/placeholder.png'">
                </div>
                <div class="p-info-right" style="padding: 15px 0; display:flex; flex-direction:column; gap:10px;">
                    <h3 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">${p.title}</h3>
                    <span style="background: var(--primary); color: white; font-size: 10px; padding: 4px 12px; border-radius: 10px; width: fit-content; font-weight: 700;">${p.badge || translations[currentLang]['badge_premium']}</span>
                    <div style="font-size: 13px; color: var(--text-muted); display:flex; gap:15px; align-items:center; margin-top:5px;">
                        <span style="display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-star" style="color:var(--primary);"></i> <b style="color:white;">${p.rating || 4.8}</b> (${p.reviews || 0} ${translations[currentLang]['reviews']})</span>
                        <span style="color: var(--primary); font-weight: 700; display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-check"></i> ${translations[currentLang]['in_stock']}</span>
                    </div>
                </div>
                <div class="p-actions-right" style="display:flex; flex-direction:column; justify-content:center; gap:40px; align-items:flex-end; margin-left: auto;">
                    <div style="text-align: right;">
                        <div style="font-size: 32px; font-weight: 800; color: white;">₸${p.price.toLocaleString()}</div>
                        ${oldPriceHtml}
                    </div>
                    <div style="display:flex; gap:15px; align-items:center;">
                        <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart" style="color:${isLiked ? 'var(--primary)' : 'white'}; font-size:22px; cursor:pointer;" onclick="event.stopPropagation(); toggleWishlist(${JSON.stringify(p).replace(/"/g, '&quot;')}); this.classList.toggle('fa-regular'); this.classList.toggle('fa-solid'); this.style.color = this.classList.contains('fa-solid') ? 'var(--primary)' : 'white';"></i>
                        <button class="btn-add" onclick="event.stopPropagation(); addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})" style="background: var(--primary); color: white; border: none; padding: 12px 35px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size:15px; transition:0.2s;">
                            <i class="fa-solid fa-cart-shopping"></i> ${translations[currentLang]['add_to_cart']}
                        </button>
                    </div>
                </div>
            `;
        }
        grid.appendChild(card);
    });

    const countSpan = document.querySelector('.cat-hero-text div span:first-child');
    if (countSpan) countSpan.innerText = products.length;
    updateTranslations();
}

function upgradeProductFilters() {
    // Hide 'Showing X products' span
    const topBars = document.querySelectorAll('.top-bar, .shop-controls');
    topBars.forEach(bar => {
        const spans = bar.querySelectorAll('span');
        spans.forEach(span => {
            if (span.innerText.includes('Showing') || span.id === 'showing-product-count') {
                span.style.display = 'none';
            }
        });
    });

    const sortDropdowns = document.querySelectorAll('.sort-dropdown');
    sortDropdowns.forEach((dropdown, idx) => {
        if (dropdown.dataset.upgraded === 'true') return;
        dropdown.dataset.upgraded = 'true';
        dropdown.style.display = 'none'; 

        const controlsContainer = document.createElement('div');
        controlsContainer.style.cssText = 'display: flex; gap: 10px; align-items: center; margin-left: auto;';
        dropdown.parentNode.insertBefore(controlsContainer, dropdown);
        controlsContainer.appendChild(dropdown);

        // --- 1. SORT BUTTON ---
        const sortWrapper = document.createElement('div');
        sortWrapper.style.position = 'relative';
        
        const sortBtn = document.createElement('button');
        sortBtn.innerHTML = `<i class="fa-solid fa-arrow-down-a-z"></i> <span data-i18n="sort_btn">Sort</span>`;
        sortBtn.className = 'custom-sort-btn';
        sortBtn.style.cssText = 'background: rgba(255,255,255,0.02); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 10px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; transition: 0.3s;';
        
        const sortPopup = document.createElement('div');
        sortPopup.className = 'custom-action-popup';
        sortPopup.style.cssText = 'display: none; position: absolute; right: 0; top: calc(100% + 10px); background: rgba(13, 20, 33, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 18px; width: 220px; z-index: 9999; box-shadow: 0 10px 40px rgba(0,0,0,0.6); text-align: left;';
        
        sortPopup.innerHTML = `
            <h4 style="margin-top: 0; margin-bottom: 15px; font-size: 14px; font-weight: 700; color: white; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; display:flex; justify-content:space-between; align-items:center;">
                Sort by <i class="fa-solid fa-xmark" style="color:var(--text-muted); cursor:pointer; font-size:14px;" onclick="this.closest('.custom-action-popup').style.display='none';"></i>
            </h4>
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <label style="font-size: 13px; color: white; display: flex; align-items: center; gap: 12px; cursor: pointer; font-weight: 500; transition:0.2s;">
                    <input type="radio" name="custom-sort-${idx}" value="new" style="accent-color: var(--primary); width:16px; height:16px; cursor:pointer;" checked> <span>Сначала новые</span>
                </label>
                <label style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 12px; cursor: pointer; font-weight: 500; transition:0.2s;">
                    <input type="radio" name="custom-sort-${idx}" value="high" style="accent-color: var(--primary); width:16px; height:16px; cursor:pointer;"> <span>Сначала дорогие</span>
                </label>
                <label style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 12px; cursor: pointer; font-weight: 500; transition:0.2s;">
                    <input type="radio" name="custom-sort-${idx}" value="low" style="accent-color: var(--primary); width:16px; height:16px; cursor:pointer;"> <span>Сначала дешевые</span>
                </label>
                <label style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 12px; cursor: pointer; font-weight: 500; transition:0.2s;">
                    <input type="radio" name="custom-sort-${idx}" value="rating" style="accent-color: var(--primary); width:16px; height:16px; cursor:pointer;"> <span>По рейтингу</span>
                </label>
            </div>
        `;

        sortWrapper.appendChild(sortBtn);
        sortWrapper.appendChild(sortPopup);
        controlsContainer.appendChild(sortWrapper);

        sortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = sortPopup.style.display === 'block';
            document.querySelectorAll('.custom-action-popup').forEach(p => p.style.display = 'none');
            sortPopup.style.display = isOpen ? 'none' : 'block';
        });

        const sortLabels = sortPopup.querySelectorAll('label');
        const sortRadios = sortPopup.querySelectorAll('input');
        
        sortRadios.forEach((radio, i) => {
            radio.addEventListener('change', (e) => {
                dropdown.value = e.target.value;
                dropdown.dispatchEvent(new Event('change'));
                
                sortLabels.forEach(l => l.style.color = 'var(--text-muted)');
                sortLabels[i].style.color = 'white';

                setTimeout(() => { sortPopup.style.display = 'none'; }, 200);
                
                sortBtn.style.background = 'rgba(16, 185, 129, 0.1)';
                sortBtn.style.borderColor = 'var(--primary)';
                sortBtn.style.color = 'var(--primary)';
            });
        });

        // --- 2. FILTER BUTTON (Extract Sidebar) ---
        const sidebar = document.querySelector('.shop-sidebar');
        if (sidebar) {
            const filterWrapper = document.createElement('div');
            filterWrapper.style.position = 'relative';
            
            const filterBtn = document.createElement('button');
            filterBtn.innerHTML = `<i class="fa-solid fa-sliders"></i> <span>Filter</span>`;
            filterBtn.className = 'custom-filter-btn';
            filterBtn.style.cssText = 'background: rgba(16, 185, 129, 0.1); color: var(--primary); border: 1px solid var(--primary); padding: 8px 16px; border-radius: 10px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; transition: 0.3s;';
            
            const filterPopup = document.createElement('div');
            filterPopup.className = 'custom-action-popup';
            // Setting a fixed width with scroll properties so large filters don't bleed off screen and can be fully used
            filterPopup.style.cssText = 'display: none; position: absolute; right: 0; top: calc(100% + 10px); background: rgba(13, 20, 33, 0.98); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; width: 320px; max-height: 70vh; overflow-y: auto; z-index: 9999; box-shadow: 0 10px 40px rgba(0,0,0,0.6); text-align: left;';
            
            // Extract .filter-box logic from sidebar
            const originalFilterBox = sidebar.querySelector('.filter-box');
            if (originalFilterBox) {
                // Remove native borders & backgrounds so it flows nicely in the popup
                originalFilterBox.style.border = 'none';
                originalFilterBox.style.background = 'transparent';
                originalFilterBox.style.padding = '0';
                
                filterPopup.appendChild(originalFilterBox);
            }

            // Important: close button inside the filter popup header
            const fHeader = filterPopup.querySelector('.filter-header');
            if(fHeader) {
                const closeIco = document.createElement('i');
                closeIco.className = 'fa-solid fa-xmark';
                closeIco.style.cssText = 'color:var(--text-muted); cursor:pointer; font-size:16px; margin-left: 15px;';
                closeIco.onclick = () => filterPopup.style.display = 'none';
                fHeader.appendChild(closeIco);
            }

            filterWrapper.appendChild(filterBtn);
            filterWrapper.appendChild(filterPopup);
            controlsContainer.appendChild(filterWrapper);

            // Removing original Sidebar so the grid spans beautifully!
            sidebar.remove();

            filterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = filterPopup.style.display === 'block';
                document.querySelectorAll('.custom-action-popup').forEach(p => p.style.display = 'none');
                filterPopup.style.display = isOpen ? 'none' : 'block';
            });
            
            // Prevent close when clicking inside the filter box
            filterPopup.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Global click handler to close any custom popups
        document.addEventListener('click', (e) => {
            if(!controlsContainer.contains(e.target)) {
                document.querySelectorAll('.custom-action-popup').forEach(p => p.style.display = 'none');
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', upgradeProductFilters);
if(document.readyState !== 'loading') upgradeProductFilters();

function upgradeLangSelector() {
    const langSelects = document.querySelectorAll('.lang-select');
    if (!langSelects.length) return;

    langSelects.forEach(langSwitch => {
        const topLangContainer = langSwitch.closest('.top-lang');
        if (!topLangContainer) return;
        
        // Hide native select
        langSwitch.style.display = 'none';
        
        // Upgrade container
        topLangContainer.style.position = 'relative';
        topLangContainer.style.cursor = 'pointer';
        
        // Remove existing custom UI if script runs twice
        topLangContainer.querySelector('.custom-lang-current')?.remove();
        topLangContainer.querySelector('.custom-lang-menu')?.remove();

        const currentText = langSwitch.options[langSwitch.selectedIndex]?.text || 'Русский';
        
        const currentDisplay = document.createElement('div');
        currentDisplay.className = 'custom-lang-current';
        currentDisplay.style.cssText = 'display:flex; align-items:center; height: 100%;';
        currentDisplay.innerHTML = `<span class="custom-lang-label" style="font-size: 11px; color:#fff;">${currentText}</span> <i class="fa-solid fa-chevron-down" style="font-size: 10px; margin-left: 6px; transition: 0.3s; color:#fff;"></i>`;
        
        const menu = document.createElement('div');
        menu.className = 'custom-lang-menu';
        
        Array.from(langSwitch.options).forEach(opt => {
            const item = document.createElement('div');
            item.className = `custom-lang-item ${opt.selected ? 'active' : ''}`;
            item.innerHTML = opt.selected ? `<i class="fa-solid fa-check" style="margin-right:8px; color:var(--primary); font-size:12px;"></i> ${opt.text}` : opt.text;
            
            item.onclick = (e) => {
                e.stopPropagation();
                langSwitch.value = opt.value;
                
                // Fire native onchange programmatically since we're hijacking user input
                const event = new Event('change');
                langSwitch.dispatchEvent(event);
                
                currentDisplay.querySelector('.custom-lang-label').innerText = opt.text;
                
                menu.querySelectorAll('.custom-lang-item').forEach(el => {
                    el.classList.remove('active');
                    el.innerHTML = el.innerText.trim(); // strip icon
                });
                item.classList.add('active');
                item.innerHTML = `<i class="fa-solid fa-check" style="margin-right:8px; color:var(--primary); font-size:12px;"></i> ${opt.text}`;
                
                menu.classList.remove('show');
                currentDisplay.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
            };
            menu.appendChild(item);
        });
        
        topLangContainer.appendChild(currentDisplay);
        topLangContainer.appendChild(menu);
        
        topLangContainer.onclick = (e) => {
            e.stopPropagation();
            const isShowing = menu.classList.contains('show');
            document.querySelectorAll('.custom-lang-menu.show').forEach(m => {
                m.classList.remove('show');
                m.parentElement.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
            });
            if (!isShowing) {
                menu.classList.add('show');
                currentDisplay.querySelector('.fa-chevron-down').style.transform = 'rotate(180deg)';
            }
        };
    });
    
    // Close all when clicking outside
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.custom-lang-menu.show').forEach(menu => {
            const container = menu.closest('.top-lang');
            if (container && !container.contains(e.target)) {
                menu.classList.remove('show');
                container.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
            }
        });
    });
}
// --- PROJECT INTERACTIONS ---
window.applyUserActivityStatus = async function() {
    const userJson = localStorage.getItem('user');
    if (!userJson || userJson === 'undefined') return;
    
    try {
        const user = JSON.parse(userJson);
        if (!user || !user.email) return;

        const res = await fetch(`/api/user/${user.email}/activity`);
        if (!res.ok) return; // Silent skip
        const data = await res.json();
        const activity = data.data || [];
        
        activity.forEach(act => {
            const projectCard = document.querySelector(`.project-card[data-id="${act.project_id}"]`);
            if (projectCard) {
                const iconClass = act.activity_type === 'like' ? 'heart' : (act.activity_type === 'save' ? 'bookmark' : 'paper-plane');
                const btn = projectCard.querySelector(`.v-action-btn i.fa-${iconClass}`)?.parentElement;
                if (btn) {
                    btn.classList.add('active');
                    if (act.activity_type === 'like') {
                        btn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
                    }
                }
            }
        });
    } catch(e) { console.error("Failed to apply activity status", e); }
};

window.handleInteraction = async function(id, type, event) {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Sharing is public
    if (type !== 'shares' && !user) {
        alert("Для продолжения необходимо войти в систему");
        window.location.href = 'auth.html';
        return;
    }

    if (event) {
        event.stopPropagation();
        const btn = event.currentTarget;
        const span = btn.querySelector('span');
        const icon = btn.querySelector('i');
        const currentCount = parseInt(span.innerText);
        const isAlreadyActive = btn.classList.contains('active');

        // Optimistic UI update
        if (isAlreadyActive) {
            btn.classList.remove('active');
            span.innerText = Math.max(0, currentCount - 1);
            if (type === 'likes') icon.classList.replace('fa-solid', 'fa-regular');
        } else {
            btn.classList.add('active');
            span.innerText = currentCount + 1;
            if (type === 'likes') icon.classList.replace('fa-regular', 'fa-solid');
            
            // Bounce animation
            btn.style.transform = 'scale(1.3)';
            setTimeout(() => btn.style.transform = 'scale(1)', 200);
        }
    } else {
        // Try to find the button by querying DOM
        const buttons = document.querySelectorAll(`.project-card[data-id="${id}"] .v-action-btn`);
        let shareBtn = null;
        buttons.forEach(b => { if(b.innerHTML.includes('fa-paper-plane')) shareBtn = b; });
        if(shareBtn) {
            const span = shareBtn.querySelector('span');
            span.innerText = parseInt(span.innerText) + 1;
            shareBtn.classList.add('active');
        }
    }
    
    try {
        const payload = { type };
        if (user && user.email) payload.email = user.email;
        else payload.email = 'guest@saycom.kz';

        const res = await fetch(`/api/projects/${id}/interaction`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            // Revert on error
            if (event) {
                const btn = event.currentTarget;
                const span = btn.querySelector('span');
                const isAlreadyActive = !btn.classList.contains('active'); // It was flipped
                const currentCount = parseInt(span.innerText);
                if (isAlreadyActive) {
                    btn.classList.add('active');
                    span.innerText = currentCount;
                } else {
                    btn.classList.remove('active');
                    span.innerText = currentCount;
                }
            }
            const data = await res.json();
            if (res.status === 401) {
                window.location.href = 'auth.html';
            } else {
                alert(data.error || "Ошибка при взаимодействии");
            }
        }
    } catch(err) { 
        console.error(err);
        // Revert on network error
        if (event) {
            const btn = event.currentTarget;
            const span = btn.querySelector('span');
            const isAlreadyActive = !btn.classList.contains('active');
            const currentCount = parseInt(span.innerText);
            if (isAlreadyActive) {
                btn.classList.add('active');
                span.innerText = currentCount;
            } else {
                btn.classList.remove('active');
                span.innerText = currentCount;
            }
        }
    }
};

window.downloadProject = (url, event) => {
    if (event) event.stopPropagation();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert("Для скачивания проектов необходимо войти в систему");
        window.location.href = 'auth.html';
        return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- TIKTOK STYLE COMMENT SHEET ---
let currentProjectId = null;
let currentReplyId = null;

window.openCommentSheet = async function(projectId, event) {
    if (event) event.stopPropagation();
    
    currentProjectId = projectId;
    
    const overlay = document.getElementById('sheetOverlay');
    const sheet = document.getElementById('commentSheet');
    
    if (overlay && sheet) {
        overlay.style.display = 'block';
        setTimeout(() => sheet.classList.add('open'), 10);
        loadSheetComments(projectId);
    } else {
        alert("Элементы комментариев не найдены на странице.");
    }
};

window.closeCommentSheet = function() {
    const sheet = document.getElementById('commentSheet');
    const overlay = document.getElementById('sheetOverlay');
    if (sheet) {
        sheet.classList.remove('open');
        setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 400);
    }
    currentReplyId = null;
    const input = document.getElementById('sheetCommentInput');
    if (input) input.placeholder = 'Add a comment...';
};

async function loadSheetComments(projectId) {
    try {
        const res = await fetch(`/api/projects/${projectId}/comments`);
        if (!res.ok) throw new Error("Comments fetch failed: " + res.status);
        const result = await res.json();
        const comments = result.data || [];
        const list = document.getElementById('sheetCommentList');
        
        const topLevel = comments.filter(c => !c.parent_id);
        const replies = comments.filter(c => c.parent_id);
        
        list.innerHTML = topLevel.map(c => {
            const initials = c.user_name ? c.user_name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
            
            const commentReplies = replies.filter(r => r.parent_id === c.id);
            const repliesHtml = commentReplies.map(r => {
                const rInitials = r.user_name ? r.user_name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
                return `
                    <div class="comment-item" style="margin-left: 40px; margin-top: 10px; border-left: 2px solid rgba(255,255,255,0.1); padding-left: 10px;">
                        <div class="c-avatar" style="width: 24px; height: 24px; font-size: 10px;">${rInitials}</div>
                        <div class="c-body">
                            <div class="c-name" style="font-size: 11px;">${r.user_name}</div>
                            <div class="c-text" style="font-size: 12px;">${r.comment}</div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="comment-item">
                    <div class="c-avatar">${initials}</div>
                    <div class="c-body">
                        <div class="c-name">${c.user_name}</div>
                        <div class="c-text">${c.comment}</div>
                        <div class="c-actions">
                            <span onclick="replyTo('${c.user_name}', ${c.id})" style="cursor:pointer; color:#94A3B8; font-size:11px; font-weight:600;"><i class="fa-solid fa-reply"></i> Reply</span>
                        </div>
                    </div>
                </div>
                ${repliesHtml}
            `;
        }).join('');
        
        if (comments.length === 0) {
            list.innerHTML = '<div style="text-align:center; color:#64748B; padding:40px;">No comments yet. Be the first!</div>';
        }
    } catch(e) { console.error(e); }
}

window.replyTo = function(userName, commentId) {
    currentReplyId = commentId;
    document.getElementById('sheetCommentInput').placeholder = `Replying to ${userName}...`;
    document.getElementById('sheetCommentInput').focus();
};

window.sendSheetComment = async function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert("Пожалуйста, войдите в систему, чтобы оставить комментарий");
        window.location.href = 'auth.html';
        return;
    }
    
    const input = document.getElementById('sheetCommentInput');
    const text = input.value.trim();
    if (!text) return;
    
    try {
        const res = await fetch(`/api/projects/${currentProjectId}/comments`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                user_name: user.full_name, 
                comment: text,
                parent_id: currentReplyId 
            })
        });
        
        if (res.ok) {
            input.value = '';
            currentReplyId = null;
            input.placeholder = 'Add a comment...';
            loadSheetComments(currentProjectId);
            // Function to refresh project counts on whatever page we are
            if (typeof loadHomeProjects === 'function' && document.getElementById('dynamic-projects')) {
                loadHomeProjects();
            }
            if (document.getElementById('archive-grid')) {
                // We are on projects.html, trigger its refresh if possible or just update the count manually
                const countBadge = document.querySelector(`.project-card[data-id="${currentProjectId}"] .comment-btn span`);
                if (countBadge) countBadge.innerText = parseInt(countBadge.innerText) + 1;
                const previewCount = document.querySelector(`.project-card[data-id="${currentProjectId}"] .comments-preview`);
                if (previewCount) {
                    const current = parseInt(previewCount.innerText) || 0;
                    previewCount.innerHTML = `<i class="fa-regular fa-comment"></i> ${current + 1} comments`;
                }
            }
        }
    } catch(e) { console.error(e); }
};

window.openComments = (id) => openCommentSheet(id);

// --- VIDEO SHARE MENU ---
window.openVideoShareMenu = function(projectId, event) {
    if (event) event.stopPropagation();
    
    let shareOverlay = document.getElementById('videoShareOverlay');
    if (!shareOverlay) {
        shareOverlay = document.createElement('div');
        shareOverlay.id = 'videoShareOverlay';
        shareOverlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center; opacity:0; transition:0.3s; backdrop-filter:blur(5px);';
        
        shareOverlay.innerHTML = `
            <div style="background:#020812; padding:30px; border-radius:24px; border:1px solid rgba(255,255,255,0.1); width:90%; max-width:400px; transform:translateY(50px); transition:0.4s; position:relative; display:flex; flex-direction:column; gap:20px;">
                <i class="fa-solid fa-xmark" onclick="closeVideoShareMenu()" style="position:absolute; top:20px; right:20px; font-size:20px; color:var(--text-muted); cursor:pointer;"></i>
                <h3 style="color:white; font-size:20px; font-weight:800; margin:0; text-align:center;">Share Video</h3>
                <div style="display:flex; justify-content:center; gap:20px; margin-top:10px;">
                    <a href="#" onclick="triggerShareOption(${projectId}, 'whatsapp', event)" style="display:flex; flex-direction:column; align-items:center; gap:8px; text-decoration:none; color:white;">
                        <div style="width:50px; height:50px; background:#25D366; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="fa-brands fa-whatsapp"></i></div>
                        <span style="font-size:11px;">WhatsApp</span>
                    </a>
                    <a href="#" onclick="triggerShareOption(${projectId}, 'telegram', event)" style="display:flex; flex-direction:column; align-items:center; gap:8px; text-decoration:none; color:white;">
                        <div style="width:50px; height:50px; background:#0088cc; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="fa-brands fa-telegram"></i></div>
                        <span style="font-size:11px;">Telegram</span>
                    </a>
                    <a href="#" onclick="triggerShareOption(${projectId}, 'instagram', event)" style="display:flex; flex-direction:column; align-items:center; gap:8px; text-decoration:none; color:white;">
                        <div style="width:50px; height:50px; background:linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="fa-brands fa-instagram"></i></div>
                        <span style="font-size:11px;">Instagram</span>
                    </a>
                    <a href="#" onclick="triggerShareOption(${projectId}, 'facebook', event)" style="display:flex; flex-direction:column; align-items:center; gap:8px; text-decoration:none; color:white;">
                        <div style="width:50px; height:50px; background:#1877F2; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="fa-brands fa-facebook"></i></div>
                        <span style="font-size:11px;">Facebook</span>
                    </a>
                </div>
                <div style="display:flex; justify-content:center; gap:20px; margin-top:10px;">
                    <a href="#" onclick="triggerShareOption(${projectId}, 'tiktok', event)" style="display:flex; flex-direction:column; align-items:center; gap:8px; text-decoration:none; color:white;">
                        <div style="width:50px; height:50px; background:#000000; border:1px solid rgba(255,255,255,0.2); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="fa-brands fa-tiktok"></i></div>
                        <span style="font-size:11px;">TikTok</span>
                    </a>
                    <div onclick="copyVideoLink(${projectId})" style="display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; color:white;">
                        <div style="width:50px; height:50px; background:rgba(255,255,255,0.1); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px;"><i class="fa-solid fa-link"></i></div>
                        <span style="font-size:11px;">Copy Link</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(shareOverlay);
    }
    
    shareOverlay.style.display = 'flex';
    setTimeout(() => {
        shareOverlay.style.opacity = '1';
        shareOverlay.children[0].style.transform = 'translateY(0)';
    }, 10);
};

window.closeVideoShareMenu = function() {
    const overlay = document.getElementById('videoShareOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.children[0].style.transform = 'translateY(50px)';
        setTimeout(() => overlay.style.display = 'none', 300);
    }
};

window.triggerShareOption = function(projectId, platform, event) {
    if (event) event.preventDefault();
    
    // Increment the share counter on backend
    handleInteraction(projectId, 'shares', null);
    
    // Close the menu
    closeVideoShareMenu();
    
    // Dummy URLs for platforms
    const shareUrl = window.location.href; // In real life, it would be the project link
    const text = "Check out this amazing project by SAYCOM!";
    let finalUrl = "";
    
    if (platform === 'whatsapp') finalUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
    else if (platform === 'telegram') finalUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    else if (platform === 'facebook') finalUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    else if (platform === 'tiktok' || platform === 'instagram') {
        alert("Platform doesn't support direct URL sharing. Link copied to clipboard!");
        copyVideoLink(projectId);
        return;
    }
    
    if (finalUrl) window.open(finalUrl, '_blank');
};

window.copyVideoLink = function(projectId) {
    handleInteraction(projectId, 'shares', null);
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert("Link copied to clipboard!");
        closeVideoShareMenu();
    });
};
