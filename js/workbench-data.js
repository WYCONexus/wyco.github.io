window.workbenchData = {
  repairs: [
    {
      title: 'Electrical Projects',
      subtitle: 'Electrical improvement work.',
      coverImage: '/assets/workbench/sectionCoverart/elec-coverart.jpg',
      images: [
        /*{
          src: '',
          alt: '',
          caption: ''
        }*/
      ]
    },

    {
      title: 'Flooring Projects',
      subtitle: 'Flooring replacement and restoration work across multiple residential spaces.',
      coverImage: '/assets/workbench/sectionCoverart/floor-coverart.jpg',
      images: [
        {
          src: '/assets/workbench/room-flooring-upgrade.jpg',
          alt: 'Room flooring upgrade',
          caption: 'Room Flooring Upgrade'
        },
        {
          src: '/assets/workbench/apartment-flooring-updates/bathroom-floor-restoration.jpg',
          alt: 'Bathroom floor restoration',
          caption: 'Bathroom Floor Restoration'
        }
      ]
    },

    {
      title: 'Painting/Drywall Projects',
      subtitle: 'Painting and drywall work across multiple residential spaces.',
      coverImage: '/assets/workbench/sectionCoverart/wall-coverart.jpg',
      images: [
        /*{
          src: '',
          alt: '',
          caption: ''
        }*/
      ]
    },

    {
      title: 'Plumbing Projects',
      subtitle: 'Plumbing improvement work.',
      coverImage: '/assets/workbench/sectionCoverart/plumb-coverart.jpg',
      images: [
        {
          src: '/assets/workbench/utility-and-plumbing-updates/laundry-line-rebuild.jpg',
          alt: 'Laundry line rebuild',
          caption: 'Laundry Line Rebuild'
        }
      ]
    },

    {
      title: 'Restoration Projects',
      subtitle: 'Restoration work across multiple projects.',
      coverImage: '/assets/workbench/sectionCoverart/resto-coverart.jpg',
      images: [
        {
          src: '/assets/workbench/commercial-sink-restoration.jpg',
          alt: 'Commercial sink restoration',
          caption: 'Commercial Sink Restoration'
        },
        {
          src: '/assets/workbench/grease-dumpster-restoration.jpg',
          alt: 'Grease dumpster restoration',
          caption: 'Grease Dumpster Restoration'
        },
        {
          src: '/assets/workbench/ventilation-system-restoration.jpg',
          alt: 'Ventilation system restoration',
          caption: 'Ventilation System Restoration'
        }
      ]
    },

    {
      title: 'Utility Projects',
      subtitle: 'Utility improvement work.',
      coverImage: '/assets/workbench/sectionCoverart/util-coverart.jpg',
      images: [
        {
          src: '/assets/workbench/utility-and-plumbing-updates/box-cover.jpg',
          alt: 'Custom irrigation box lid install',
          caption: 'Custom Irrigation Box Lid Install'
        }
      ]
    }

  ],




  furniture: [
    /*{
      title: 'Furniture Project 01',
      src: '/assets/icons/default-background.jpg',
      alt: 'Furniture Project 01',
      caption: 'Furniture Project 01',
      subtitle: 'Restored, refreshed, reworked, or given a second life.'
    }*/
  ],
  builds: [
    /*{
      title: 'Build Project 01',
      src: '/assets/icons/default-background.jpg',
      alt: 'Build Project 01',
      caption: 'Build Project 01',
      subtitle: 'Custom pieces, practical builds, prototypes, and ideas in physical form.'
    }*/
  ]
};





(function () {
  const pageKey = document.body?.dataset?.page;
  if (pageKey !== 'workbench') return;

  const sectionMeta = {
    repairs: {
      title: 'Repair Transformations',
      description: 'Before-and-after fixes, practical improvements, and functional restorations.',
      eyebrow: 'WYCO Workbench',
      badge: 'Repair'
    },
    furniture: {
      title: 'Furniture & Refurbishing',
      description: 'Pieces restored, refreshed, reworked, or given a second life.',
      eyebrow: 'WYCO Workbench',
      badge: 'Furniture'
    },
    builds: {
      title: 'Builds & Experiments',
      description: 'Custom pieces, practical builds, prototypes, and workbench ideas in physical form.',
      eyebrow: 'WYCO Workbench',
      badge: 'Build'
    }
  };

  let currentSectionKey = null;
  let currentSectionImages = [];
  let currentFilteredItems = [];
  let currentIndex = 0;
  let suppressNextPopstate = false;
  let lightboxSource = 'page';

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getModalElements() {
    return {
      modal: document.getElementById('workbench-section-modal'),
      backdrop: document.querySelector('#workbench-section-modal .section-library-backdrop'),
      title: document.getElementById('workbench-dialog-title'),
      eyebrow: document.getElementById('workbench-dialog-eyebrow'),
      description: document.getElementById('workbench-dialog-description'),
      list: document.getElementById('workbench-dialog-list'),
      close: document.getElementById('workbench-dialog-close'),
      search: document.getElementById('workbench-dialog-search')
    };
  }

  function getLightboxElements() {
    return {
      lightbox: document.getElementById('lightbox'),
      img: document.getElementById('lightbox-img'),
      caption: document.getElementById('lightbox-caption'),
      prev: document.getElementById('lightbox-prev'),
      next: document.getElementById('lightbox-next')
    };
  }

  /*get-WORKBENCH-DATA*/
  function getData() {
    return window.workbenchData || {
      repairs: [],
      furniture: [],
      builds: []
    };
  }

  function getSectionItems(sectionKey) {
    const data = getData();
    return Array.isArray(data[sectionKey]) ? data[sectionKey] : [];
  }

  function isModalOpen() {
    return !!getModalElements().modal?.classList.contains('active');
  }

  function isLightboxOpen() {
    return !!getLightboxElements().lightbox?.classList.contains('is-open');
  }

  function updateBodyScrollState() {
    if (isModalOpen() || isLightboxOpen()) {
      document.body.classList.add('section-library-open');
    } else {
      document.body.classList.remove('section-library-open');
    }
  }

  function renderSectionPreviews() {
    Object.keys(sectionMeta).forEach((sectionKey) => {
      const target = document.querySelector(`[data-workbench-gallery="${sectionKey}"]`);
      if (!target) return;

      const items = getSectionItems(sectionKey);
      target.innerHTML = '';

      if (!items.length) {
        target.innerHTML = `
          <div class="workbench-preview-card workbench-preview-card-empty">
            <p>No projects added yet.</p>
          </div>
        `;
        return;
      }

      const count = items.length;
      const label = count === 1 ? 'project' : 'projects';

      target.innerHTML = `
        <div class="workbench-preview-card">
          <div class="workbench-preview-copy">
            <span class="workbench-preview-pill">View Projects</span>
            <h3>${count} ${label} available</h3>
            <p>Open this section to browse the full list and search projects.</p>
          </div>
          <span class="workbench-preview-arrow" aria-hidden="true">&#10095;</span>
        </div>
      `;
    });
  }

  function updateLightbox() {
    const { img, caption } = getLightboxElements();
    const item = currentSectionImages[currentIndex];
    if (!img || !caption || !item) return;

    img.src = item.src;
    img.alt = item.alt || item.title || 'Workbench image';
    caption.textContent = item.caption || item.title || '';
  }

  function showModalVisualState() {
    const { modal } = getModalElements();
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    modal.style.visibility = '';
    modal.style.pointerEvents = '';
    modal.style.opacity = '';
  }

  function hideModalVisualState() {
    const { modal } = getModalElements();
    if (!modal) return;
    modal.style.visibility = 'hidden';
    modal.style.pointerEvents = 'none';
    modal.style.opacity = '0';
  }

  function clearModalVisualOverrides() {
    const { modal } = getModalElements();
    if (!modal) return;
    modal.style.visibility = '';
    modal.style.pointerEvents = '';
    modal.style.opacity = '';
  }

  function createSectionItem(item, meta) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'section-library-item';
    button.setAttribute('aria-label', `Open ${item.title || item.alt || 'gallery image'}`);
    button.dataset.workbenchSrc = item.src || '';
    button.style.width = '100%';
    button.style.textAlign = 'left';
    button.style.cursor = 'pointer';
    button.style.color = 'inherit';
    button.style.appearance = 'none';
    button.style.webkitAppearance = 'none';
    button.style.font = 'inherit';

    const subtitle = item.subtitle || item.caption || meta.description || '';

    button.innerHTML = `
      <div class="section-library-item-media">
        <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || item.title || 'Workbench image')}" loading="lazy" decoding="async">
      </div>

      <div class="section-library-item-copy">
        <div class="section-library-item-badge">${escapeHtml(meta.badge)}</div>
        <h4 class="section-library-item-title">${escapeHtml(item.title || item.caption || 'Untitled Project')}</h4>
        <p class="section-library-item-subtitle">${escapeHtml(subtitle)}</p>
      </div>

      <div class="section-library-item-arrow" aria-hidden="true">&#10095;</div>
    `;

    button.addEventListener('click', () => {
      const baseItems = getSectionItems(currentSectionKey);
      const clickedIndex = baseItems.findIndex((entry) => entry.src === item.src);
      currentSectionImages = baseItems;
      currentIndex = clickedIndex >= 0 ? clickedIndex : 0;
      lightboxSource = 'modal';
      openLightbox(currentIndex, true);
    });

    return button;
  }

  function renderModalList(items) {
    const { list } = getModalElements();
    const meta = sectionMeta[currentSectionKey];

    if (!list || !meta) return;

    list.innerHTML = '';
    currentFilteredItems = items;

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'section-library-empty';
      empty.textContent = 'No matching projects found.';
      list.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      list.appendChild(createSectionItem(item, meta));
    });
  }

  function filterSectionItems(query) {
    const items = getSectionItems(currentSectionKey);
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      renderModalList(items);
      return;
    }

    const filtered = items.filter((item) => {
      const title = String(item.title || '').toLowerCase();
      const subtitle = String(item.subtitle || '').toLowerCase();
      const caption = String(item.caption || '').toLowerCase();
      const alt = String(item.alt || '').toLowerCase();

      return (
        title.includes(normalizedQuery) ||
        subtitle.includes(normalizedQuery) ||
        caption.includes(normalizedQuery) ||
        alt.includes(normalizedQuery)
      );
    });

    renderModalList(filtered);
  }

  function openSectionModal(sectionKey, pushHistory = true) {
    const { modal, title, eyebrow, description, search } = getModalElements();
    const meta = sectionMeta[sectionKey];
    const items = getSectionItems(sectionKey);

    if (!modal || !meta) return;

    currentSectionKey = sectionKey;
    currentSectionImages = items;
    currentFilteredItems = items;
    currentIndex = 0;

    eyebrow.textContent = meta.eyebrow;
    title.textContent = meta.title;
    description.textContent = meta.description;

    if (search) {
      search.value = '';
    }

    renderModalList(items);
    showModalVisualState();

    if (pushHistory) {
      history.pushState(
        { wycoWorkbench: 'modal', section: sectionKey },
        '',
        ''
      );
    }

    updateBodyScrollState();

    if (search) {
      setTimeout(() => search.focus(), 0);
    }
  }

  function closeSectionModal(fromPopstate = false) {
    const { modal, search } = getModalElements();
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    clearModalVisualOverrides();

    if (search) {
      search.value = '';
    }

    updateBodyScrollState();

    if (!fromPopstate) {
      if (isLightboxOpen()) return;
      if (history.state?.wycoWorkbench === 'modal') {
        suppressNextPopstate = true;
        history.back();
      }
    }
  }

  function openLightbox(index, pushHistory = true) {
    const { lightbox } = getLightboxElements();
    if (!lightbox || !currentSectionImages.length) return;

    currentIndex = index;
    updateLightbox();

    if (lightboxSource === 'modal') {
      hideModalVisualState();
    } else {
      const { modal } = getModalElements();
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        clearModalVisualOverrides();
      }
    }

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');

    if (pushHistory) {
      history.pushState(
        {
          wycoWorkbench: 'lightbox',
          section: currentSectionKey,
          index: currentIndex,
          source: lightboxSource
        },
        '',
        ''
      );
    }

    updateBodyScrollState();
  }

  function closeLightbox(fromPopstate = false) {
    const { lightbox } = getLightboxElements();
    if (!lightbox) return;

    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');

    if (lightboxSource === 'modal') {
      showModalVisualState();
    } else {
      const { modal } = getModalElements();
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }
      clearModalVisualOverrides();
    }

    updateBodyScrollState();

    if (!fromPopstate && history.state?.wycoWorkbench === 'lightbox') {
      suppressNextPopstate = true;
      history.back();
    }
  }

  function showPrevious() {
    if (!currentSectionImages.length) return;
    currentIndex = (currentIndex - 1 + currentSectionImages.length) % currentSectionImages.length;
    updateLightbox();
  }

  function showNext() {
    if (!currentSectionImages.length) return;
    currentIndex = (currentIndex + 1) % currentSectionImages.length;
    updateLightbox();
  }

  function bindSectionCards() {
    const cards = document.querySelectorAll('[data-workbench-section]');

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const key = card.dataset.workbenchSection;
        if (!key) return;
        openSectionModal(key, true);
      });

      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const key = card.dataset.workbenchSection;
          if (!key) return;
          openSectionModal(key, true);
        }
      });
    });
  }

  function bindModal() {
    const { modal, backdrop, close, search } = getModalElements();
    if (!modal) return;

    close?.addEventListener('click', () => closeSectionModal(false));
    backdrop?.addEventListener('click', () => closeSectionModal(false));

    search?.addEventListener('input', (event) => {
      filterSectionItems(event.target.value || '');
    });
  }

  function bindLightbox() {
    const { lightbox, prev, next } = getLightboxElements();
    if (!lightbox) return;

    prev?.addEventListener('click', (event) => {
      event.stopPropagation();
      showPrevious();
    });

    next?.addEventListener('click', (event) => {
      event.stopPropagation();
      showNext();
    });

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      const modalOpen = isModalOpen();
      const lightboxOpen = isLightboxOpen();

      if (event.key === 'Escape') {
        if (lightboxOpen) {
          closeLightbox(false);
          return;
        }

        if (modalOpen) {
          closeSectionModal(false);
        }
      }

      if (!lightboxOpen) return;

      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    });
  }

  function syncUiToHistoryState(state) {
    const modal = getModalElements().modal;
    const lightbox = getLightboxElements().lightbox;

    lightbox?.classList.remove('is-open');
    lightbox?.setAttribute('aria-hidden', 'true');

    modal?.classList.remove('active');
    modal?.setAttribute('aria-hidden', 'true');
    clearModalVisualOverrides();

    if (!state || !state.wycoWorkbench) {
      currentSectionKey = null;
      currentSectionImages = [];
      currentFilteredItems = [];
      currentIndex = 0;
      lightboxSource = 'page';
      updateBodyScrollState();
      return;
    }

    if (state.wycoWorkbench === 'modal' && state.section) {
      lightboxSource = 'modal';
      openSectionModal(state.section, false);
      return;
    }

    if (state.wycoWorkbench === 'lightbox' && state.section) {
      const items = getSectionItems(state.section);

      currentSectionKey = state.section;
      currentSectionImages = items;
      currentFilteredItems = items;
      currentIndex = typeof state.index === 'number' ? state.index : 0;
      lightboxSource = state.source === 'modal' ? 'modal' : 'page';

      if (lightboxSource === 'modal') {
        openSectionModal(state.section, false);
      }

      openLightbox(currentIndex, false);
      return;
    }

    updateBodyScrollState();
  }

  function bindHistory() {
    window.addEventListener('popstate', (event) => {
      if (suppressNextPopstate) {
        suppressNextPopstate = false;
        return;
      }
      syncUiToHistoryState(event.state);
    });
  }

  function initWorkbench() {
    renderSectionPreviews();
    bindSectionCards();
    bindModal();
    bindLightbox();
    bindHistory();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkbench);
  } else {
    initWorkbench();
  }
})();