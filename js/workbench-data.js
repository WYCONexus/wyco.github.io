window.WYCO_WORKBENCH_DATA = {
  repairs: [
    {
      title: 'Repair Project 01',
      src: '/images/waves/wyco_gradient_diagonal.jpg',
      alt: 'Repair Project 01',
      caption: 'Repair Project 01',
      subtitle: 'Before-and-after fixes, practical improvements, and functional restorations.'
    },
    {
      title: 'Repair Project 02',
      src: '/images/waves/wyco_gradient_diagonal.jpg',
      alt: 'Repair Project 02',
      caption: 'Repair Project 02',
      subtitle: 'A second repair example for the Workbench section.'
    }
  ],
  furniture: [
    {
      title: 'Furniture Project 01',
      src: '/images/waves/wyco_gradient_diagonal.jpg',
      alt: 'Furniture Project 01',
      caption: 'Furniture Project 01',
      subtitle: 'Restored, refreshed, reworked, or given a second life.'
    }
  ],
  builds: [
    {
      title: 'Build Project 01',
      src: '/images/waves/wyco_gradient_diagonal.jpg',
      alt: 'Build Project 01',
      caption: 'Build Project 01',
      subtitle: 'Custom pieces, practical builds, prototypes, and ideas in physical form.'
    }
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

  function updateBodyScrollState() {
    const modalOpen = getModalElements().modal?.classList.contains('active');
    const lightboxOpen = getLightboxElements().lightbox?.classList.contains('is-open');

    if (modalOpen || lightboxOpen) {
      document.body.classList.add('section-library-open');
    } else {
      document.body.classList.remove('section-library-open');
    }
  }

  function updateLightbox() {
    const { img, caption } = getLightboxElements();
    const item = currentSectionImages[currentIndex];
    if (!img || !caption || !item) return;

    img.src = item.src;
    img.alt = item.alt || item.title || 'Workbench image';
    caption.textContent = item.caption || item.title || '';
  }

  function openLightbox(index) {
    const { lightbox } = getLightboxElements();
    if (!lightbox || !currentSectionImages.length) return;

    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    updateBodyScrollState();
  }

  function closeLightbox() {
    const { lightbox } = getLightboxElements();
    if (!lightbox) return;

    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    updateBodyScrollState();
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

    button.addEventListener('click', () => openLightbox(index));
    return button;
  }

  function openSectionModal(sectionKey) {
    const { modal, title, eyebrow, description, list } = getModalElements();
    const data = window.WYCO_WORKBENCH_DATA || {};
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

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    updateBodyScrollState();
  }

  function closeSectionModal() {
    const { modal } = getModalElements();
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    updateBodyScrollState();
  }

  function bindSectionCards() {
    const cards = document.querySelectorAll('[data-workbench-section]');

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const key = card.dataset.workbenchSection;
        if (!key) return;
        openSectionModal(key);
      });

      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const key = card.dataset.workbenchSection;
          if (!key) return;
          openSectionModal(key);
        }
      });
    });
  }

  function bindModal() {
    const { modal, backdrop, close } = getModalElements();
    if (!modal) return;

    close?.addEventListener('click', closeSectionModal);
    backdrop?.addEventListener('click', closeSectionModal);
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
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      const modalOpen = getModalElements().modal?.classList.contains('active');
      const lightboxOpen = lightbox.classList.contains('is-open');

      if (event.key === 'Escape') {
        if (lightboxOpen) {
          closeLightbox();
          return;
        }

        if (modalOpen) {
          closeSectionModal();
        }
      }

      if (!lightboxOpen) return;

      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    });
  }

  function initWorkbench() {
    bindSectionCards();
    bindModal();
    bindLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkbench);
  } else {
    initWorkbench();
  }
})();