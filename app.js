/**
 * BTP Adoption Initiative Hub — Application Logic v2
 * 
 * Architecture:
 * - Uses DataLoader to fetch CSV from SharePoint/OneDrive or local file
 * - Configuration via config.js (no code changes needed)
 * - Dynamically generates filters from data attributes
 * - Real-time search and filtering without page reload
 * - Category icons loaded from SVG files
 */

(function () {
    'use strict';

    // =========================================================
    // State
    // =========================================================
    let allInitiatives = [];
    let filteredInitiatives = [];
    let activeFilters = new Set();
    let searchQuery = '';

    // =========================================================
    // DOM References
    // =========================================================
    const dom = {
        searchInput: document.getElementById('searchInput'),
        clearSearch: document.getElementById('clearSearch'),
        filterBar: document.getElementById('filterBar'),
        activeFilters: document.getElementById('activeFilters'),
        filterTags: document.getElementById('filterTags'),
        clearAllFilters: document.getElementById('clearAllFilters'),
        cardsGrid: document.getElementById('cardsGrid'),
        emptyState: document.getElementById('emptyState'),
        loadingState: document.getElementById('loadingState'),
        initiativeCount: document.getElementById('initiativeCount'),
        modalOverlay: document.getElementById('modalOverlay'),
        modal: document.getElementById('modal'),
        modalClose: document.getElementById('modalClose'),
        modalContent: document.getElementById('modalContent'),
        dataSourceBadge: document.getElementById('dataSourceBadge')
    };

    // =========================================================
    // Data Loading (via DataLoader + config.js)
    // =========================================================
    async function loadData() {
        try {
            const result = await DataLoader.load(HUB_CONFIG);
            allInitiatives = result.data;

            // Show data source indicator (for debugging/transparency)
            if (dom.dataSourceBadge) {
                const labels = {
                    'sharepoint': 'Live from SharePoint',
                    'proxy': 'Live via proxy',
                    'local': 'Local file',
                    'local-fallback': 'Fallback (offline)',
                    'cache': 'Cached'
                };
                dom.dataSourceBadge.textContent = labels[result.source] || result.source;
                dom.dataSourceBadge.title = `Data loaded from: ${result.source}`;
            }

            initializeApp();

        } catch (err) {
            console.error('[Hub] Failed to load data:', err);
            dom.loadingState.innerHTML = `
                <p style="color:#c00; font-weight:500;">Unable to load initiatives</p>
                <p style="color:#666; font-size:0.85rem; margin-top:8px;">${escapeHtml(err.message)}</p>
                <button onclick="location.reload()" style="margin-top:16px; padding:8px 16px; border:1px solid #ccc; border-radius:6px; cursor:pointer; font-family:inherit;">Retry</button>
            `;
        }
    }

    // =========================================================
    // Initialization
    // =========================================================
    function initializeApp() {
        dom.loadingState.style.display = 'none';
        buildFilters();
        applyFilters();
        bindEvents();
    }

    // =========================================================
    // Filters (dynamically generated from data)
    // =========================================================
    function buildFilters() {
        const categories = {};
        allInitiatives.forEach(item => {
            if (item.category) {
                categories[item.category] = (categories[item.category] || 0) + 1;
            }
        });

        let html = `<button class="filter-btn active" data-filter="all">All<span class="count">${allInitiatives.length}</span></button>`;
        const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
        sorted.forEach(([cat, count]) => {
            html += `<button class="filter-btn" data-filter="${escapeHtml(cat)}">${escapeHtml(cat)}<span class="count">${count}</span></button>`;
        });

        dom.filterBar.innerHTML = html;
    }

    // =========================================================
    // Search & Filter Logic
    // =========================================================
    function applyFilters() {
        filteredInitiatives = allInitiatives.filter(item => {
            if (activeFilters.size > 0 && !activeFilters.has(item.category)) {
                return false;
            }
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const searchable = `${item.title} ${item.description} ${item.lead} ${item.category}`.toLowerCase();
                return searchable.includes(query);
            }
            return true;
        });

        renderCards();
        updateCount();
        updateActiveFiltersUI();
    }

    function updateCount() {
        const total = allInitiatives.length;
        const showing = filteredInitiatives.length;
        if (showing === total) {
            dom.initiativeCount.textContent = `${total} Initiatives`;
        } else {
            dom.initiativeCount.textContent = `${showing} of ${total} Initiatives`;
        }
    }

    function updateActiveFiltersUI() {
        if (activeFilters.size === 0 && !searchQuery) {
            dom.activeFilters.style.display = 'none';
            return;
        }

        dom.activeFilters.style.display = 'flex';
        let html = '';

        if (searchQuery) {
            html += `<span class="filter-tag" data-type="search">"${escapeHtml(searchQuery)}" <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"></path></svg></span>`;
        }

        activeFilters.forEach(cat => {
            html += `<span class="filter-tag" data-type="category" data-value="${escapeHtml(cat)}">${escapeHtml(cat)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"></path></svg></span>`;
        });

        dom.filterTags.innerHTML = html;
    }

    // =========================================================
    // Card Rendering
    // =========================================================
    function renderCards() {
        if (filteredInitiatives.length === 0) {
            dom.cardsGrid.style.display = 'none';
            dom.emptyState.style.display = 'block';
            return;
        }

        dom.emptyState.style.display = 'none';
        dom.cardsGrid.style.display = 'grid';

        const html = filteredInitiatives.map(item => {
            const colors = HUB_CONFIG.categoryColors[item.category] || HUB_CONFIG.defaultCategoryColor;
            return `
                <article class="initiative-card" data-id="${item.id}" style="--card-accent: ${colors.color}; --cat-bg: ${colors.bg}; --cat-color: ${colors.color};">
                    <div class="card-header">
                        <span class="card-category">${escapeHtml(item.category)}</span>
                    </div>
                    <h3 class="card-title">${escapeHtml(item.title)}</h3>
                    <p class="card-description">${escapeHtml(item.description)}</p>
                    <div class="card-footer">
                        <div class="card-footer-left">
                            <svg class="card-lead-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
                            <span class="card-lead">${escapeHtml(item.lead)}</span>
                        </div>
                        ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="card-btn" onclick="event.stopPropagation();">View Page</a>` : ''}
                    </div>
                </article>
            `;
        }).join('');

        dom.cardsGrid.innerHTML = html;
    }

    // =========================================================
    // Modal
    // =========================================================
    function openModal(id) {
        const item = allInitiatives.find(i => i.id === id);
        if (!item) return;

        const colors = HUB_CONFIG.categoryColors[item.category] || HUB_CONFIG.defaultCategoryColor;

        let linkHtml = '';
        if (item.link) {
            linkHtml = `
                <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="modal-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>
                    Open Initiative Page
                </a>
            `;
        }

        dom.modalContent.innerHTML = `
            <span class="modal-category" style="background: ${colors.bg}; color: ${colors.color};">${escapeHtml(item.category)}</span>
            <h2 class="modal-title">${escapeHtml(item.title)}</h2>
            <div class="modal-section">
                <p class="modal-section-label">Lead</p>
                <p class="modal-section-value">${escapeHtml(item.lead)}</p>
            </div>
            <div class="modal-section">
                <p class="modal-section-label">Description</p>
                <p class="modal-section-value">${escapeHtml(item.description)}</p>
            </div>
            ${linkHtml}
        `;

        dom.modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        dom.modal.focus();
    }

    function closeModal() {
        dom.modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    // =========================================================
    // Event Binding
    // =========================================================
    function bindEvents() {
        // Search
        let debounceTimer;
        dom.searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchQuery = this.value.trim();
                dom.clearSearch.style.display = searchQuery ? 'flex' : 'none';
                applyFilters();
            }, 200);
        });

        dom.clearSearch.addEventListener('click', function () {
            dom.searchInput.value = '';
            searchQuery = '';
            this.style.display = 'none';
            applyFilters();
            dom.searchInput.focus();
        });

        // Filter buttons
        dom.filterBar.addEventListener('click', function (e) {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            const filter = btn.dataset.filter;

            if (filter === 'all') {
                activeFilters.clear();
                dom.filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else {
                dom.filterBar.querySelector('[data-filter="all"]').classList.remove('active');

                if (activeFilters.has(filter)) {
                    activeFilters.delete(filter);
                    btn.classList.remove('active');
                    if (activeFilters.size === 0) {
                        dom.filterBar.querySelector('[data-filter="all"]').classList.add('active');
                    }
                } else {
                    activeFilters.add(filter);
                    btn.classList.add('active');
                }
            }

            applyFilters();
        });

        // Active filter tags (click to remove)
        dom.filterTags.addEventListener('click', function (e) {
            const tag = e.target.closest('.filter-tag');
            if (!tag) return;

            if (tag.dataset.type === 'search') {
                dom.searchInput.value = '';
                searchQuery = '';
                dom.clearSearch.style.display = 'none';
            } else if (tag.dataset.type === 'category') {
                const value = tag.dataset.value;
                activeFilters.delete(value);
                const btn = dom.filterBar.querySelector(`[data-filter="${value}"]`);
                if (btn) btn.classList.remove('active');
                if (activeFilters.size === 0) {
                    dom.filterBar.querySelector('[data-filter="all"]').classList.add('active');
                }
            }

            applyFilters();
        });

        // Clear all filters
        dom.clearAllFilters.addEventListener('click', function () {
            activeFilters.clear();
            searchQuery = '';
            dom.searchInput.value = '';
            dom.clearSearch.style.display = 'none';
            dom.filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            dom.filterBar.querySelector('[data-filter="all"]').classList.add('active');
            applyFilters();
        });

        // Card click → open modal
        dom.cardsGrid.addEventListener('click', function (e) {
            const card = e.target.closest('.initiative-card');
            if (!card) return;
            openModal(parseInt(card.dataset.id, 10));
        });

        // Modal close
        dom.modalClose.addEventListener('click', closeModal);
        dom.modalOverlay.addEventListener('click', function (e) {
            if (e.target === dom.modalOverlay) closeModal();
        });

        // Keyboard: Escape to close modal
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && dom.modalOverlay.style.display !== 'none') {
                closeModal();
            }
        });
    }

    // =========================================================
    // Utilities
    // =========================================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =========================================================
    // Check if embedded in iframe (for SharePoint)
    // =========================================================
    if (window.self !== window.top) {
        document.body.classList.add('embedded');
    }

    // =========================================================
    // Boot
    // =========================================================
    loadData();

})();
