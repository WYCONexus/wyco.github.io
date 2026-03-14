window.WYCO_WORKBENCH_DATA = {
  repairs: [
    {
      title: 'Laundry Line Rebuild',
      src: '/assets/workbench/laundry-line-rebuild.jpg',
      alt: 'Laundry Line Rebuild',
      caption: 'Laundry Line Rebuild',
      subtitle: 'Corroded, leaking shutoff was removed and replaced with a fully rebuilt water supply line system.'
    },

    {
      title: 'Room Flooring Upgrade',
      src: '/assets/workbench/bedroom-revinyl.jpg',
      alt: 'Room Flooring Upgrade',
      caption: 'Room Flooring Upgrade',
      subtitle: 'Carpet and tack strips were removed, foundation cracks patched, and the space finished with new sheet vinyl flooring.'
    },

    {
      title: 'Bathroom Floor Restoration',
      src: '/assets/workbench/bathroom-revinyl.jpg',
      alt: 'Bathroom Floor Restoration',
      caption: 'Bathroom Floor Restoration',
      subtitle: 'Flooring was removed, the subfloor re-leveled with new gypcrete, and finished with vinyl flooring and cove base.'
    },

    {
      title: 'Custom Irrigation Box Lid Install',
      src: '/assets/workbench/box-cover.jpg',
      alt: 'Custom Irrigation Box Lid Install',
      caption: 'Custom Irrigation Box Lid Install',
      subtitle: 'A new lid was fabricated for a previously open utility box and finished in green for protection and a clean, finished appearance.'
    },

    {
      title: 'Commercial Sink Restoration',
      src: '/assets/workbench/commercial-sink-restoration.jpg',
      alt: 'Commercial Sink Restoration',
      caption: 'Commercial Sink Restoration',
      subtitle: 'Surface rust was polished from the underside of the commercial stainless sink, restoring the metal to a clean, corrosion-free finish.'
    },

    {
      title: 'Grease Dumpster Restoration',
      src: '/assets/workbench/grease-dumpster-restoration.jpg',
      alt: 'Grease Dumpster Restoration',
      caption: 'Grease Dumpster Restoration',
      subtitle: 'Built-up grease and debris were removed from the commercial grease dumpster, restoring proper drainage and sanitary condition.'
    },

    {
      title: 'Ventilation System Restoration',
      src: '/assets/workbench/ventilation-system-restoration.jpg',
      alt: 'Ventilation System Restoration',
      caption: 'Ventilation System Restoration',
      subtitle: 'The commercial ventilation system was disassembled, cleaned, and reassembled, restoring proper airflow and functionality.'
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
  let currentIndex = 0;
  let suppressNextPopstate = false;
  let lightboxSource = 'page';

  function getModalElements() {
    return {
      modal: document.getElementById('workbench-section-modal'),
      backdrop: document.querySelector('#workbench-section-modal .section-library-backdrop'),
      title: document.getElementById('workbench-dialog-title'),
      eyebrow: document.getElementById('workbench-dialog-eyebrow'),
      description: document.getElementById('workbench-dialog-description'),
      list: document.getElementById('workbench-dialog-list'),
      close: document.getElementById('workbench-dialog-close')
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

  function getData() {
    return window.WYCO_WORKBENCH_DATA || {
      repairs: [],
      furniture: [],
      builds: []
    };
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

  function renderPreviewFigure(item, sectionKey) {
    const figure = document.createElement('figure');
    figure.className = 'glass panel';
    figure.style.margin = '0';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'workbench-preview-trigger';
    button.setAttribute('aria-label', `Open ${item.title || item.alt || 'gallery image'}`);
    button.style.display = 'block';
    button.style.width = '100%';
    button.style.padding = '0';
    button.style.border = '0';
    button.style.background = 'transparent';
    button.style.cursor = 'pointer';
    button.style.textAlign = 'left';

    const img = document.createElement('img');
    img.className = 'workbench-img';
    img.src = item.src;
    img.alt = item.alt || item.title || 'Workbench image';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.width = '100%';
    img.style.aspectRatio = '4 / 3';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '16px';
    img.style.display = 'block';

    const caption = document.createElement('figcaption');
    caption.className = 'muted';
    caption.style.marginTop = '12px';
    caption.textContent = item.caption || item.title || '';

    button.appendChild(img);
    button.addEventListener('click', (event) => {
      event.stopPropagation();

      const data = getData();
      const items = Array.isArray(data[sectionKey]) ? data[sectionKey] : [];
      const clickedIndex = items.findIndex(
        (entry) => entry.src === item.src && entry.title === item.title
      );

      currentSectionKey = sectionKey;
      currentSectionImages = items;
      currentIndex = clickedIndex >= 0 ? clickedIndex : 0;
      lightboxSource = 'page';

      openLightbox(currentIndex, true);
    });

    figure.appendChild(button);
    figure.appendChild(caption);

    return figure;
  }

  function renderSectionPreviews() {
    const data = getData();

    Object.keys(sectionMeta).forEach((sectionKey) => {
      const target = document.querySelector(`[data-workbench-gallery="${sectionKey}"]`);
      if (!target) return;

      const items = Array.isArray(data[sectionKey]) ? data[sectionKey] : [];
      target.innerHTML = '';

      if (!items.length) {
        const empty = document.createElement('article');
        empty.className = 'glass panel';
        empty.style.margin = '0';
        empty.style.minWidth = 'min(320px, 100%)';
        empty.innerHTML = '<p class="muted" style="margin: 0;">No projects added yet.</p>';
        target.appendChild(empty);
        return;
      }

      items.forEach((item) => {
        target.appendChild(renderPreviewFigure(item, sectionKey));
      });
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

  function openSectionModal(sectionKey, pushHistory = true) {
    const { modal, title, eyebrow, description, list } = getModalElements();
    const data = getData();
    const items = Array.isArray(data[sectionKey]) ? data[sectionKey] : [];
    const meta = sectionMeta[sectionKey];

    if (!modal || !list || !meta) return;

    currentSectionKey = sectionKey;
    currentSectionImages = items;
    currentIndex = 0;

    eyebrow.textContent = meta.eyebrow;
    title.textContent = meta.title;
    description.textContent = meta.description;

    list.innerHTML = '';

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'section-library-empty';
      empty.textContent = 'No projects added yet in this section.';
      list.appendChild(empty);
    } else {
      items.forEach((item, index) => {
        list.appendChild(createSectionItem(item, index, meta));
      });
    }

    showModalVisualState();

    if (pushHistory) {
      history.pushState(
        { wycoWorkbench: 'modal', section: sectionKey },
        '',
        ''
      );
    }

    updateBodyScrollState();
  }

  function closeSectionModal(fromPopstate = false) {
    const { modal } = getModalElements();
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    clearModalVisualOverrides();
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

  function createSectionItem(item, index, meta) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'section-library-item';
    button.setAttribute('aria-label', `Open ${item.title || item.alt || 'gallery image'}`);
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
        <img src="${item.src}" alt="${item.alt || item.title || 'Workbench image'}" loading="lazy" decoding="async">
      </div>

      <div class="section-library-item-copy">
        <div class="section-library-item-badge">${meta.badge}</div>
        <h4 class="section-library-item-title">${item.title || item.caption || 'Untitled Project'}</h4>
        <p class="section-library-item-subtitle">${subtitle}</p>
      </div>

      <div class="section-library-item-arrow" aria-hidden="true">&#10095;</div>
    `;

    button.addEventListener('click', () => {
      lightboxSource = 'modal';
      openLightbox(index, true);
    });

    return button;
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
    const { modal, backdrop, close } = getModalElements();
    if (!modal) return;

    close?.addEventListener('click', () => closeSectionModal(false));
    backdrop?.addEventListener('click', () => closeSectionModal(false));
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
      const data = getData();
      const items = Array.isArray(data[state.section]) ? data[state.section] : [];

      currentSectionKey = state.section;
      currentSectionImages = items;
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