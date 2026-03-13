window.WYCO_WORKBENCH_DATA = {
  repairs: [
    {
      title: 'Repair Project 01',
      src: '/images/workbench/repair-project-01.jpg',
      alt: 'Repair Project 01',
      caption: 'Repair Project 01'
    },
    {
      title: 'Repair Project 02',
      src: '/images/workbench/repair-project-02.jpg',
      alt: 'Repair Project 02',
      caption: 'Repair Project 02'
    }
  ],
  furniture: [
    {
      title: 'Furniture Project 01',
      src: '/images/workbench/furniture-project-01.jpg',
      alt: 'Furniture Project 01',
      caption: 'Furniture Project 01'
    }
  ],
  builds: [
    {
      title: 'Build Project 01',
      src: '/images/workbench/build-project-01.jpg',
      alt: 'Build Project 01',
      caption: 'Build Project 01'
    }
  ]
};

(function () {
  const pageKey = document.body?.dataset?.page;
  if (pageKey !== 'workbench') return;

  const galleryOrder = ['repairs', 'furniture', 'builds'];
  const allImages = [];
  let currentIndex = 0;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createFigure(item, absoluteIndex) {
    const figure = document.createElement('figure');
    figure.className = 'glass panel';
    figure.style.margin = '0';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'workbench-lightbox-trigger';
    button.setAttribute('aria-label', `Open ${item.title || item.alt || 'gallery image'}`);
    button.style.display = 'block';
    button.style.width = '100%';
    button.style.padding = '0';
    button.style.border = '0';
    button.style.background = 'transparent';
    button.style.cursor = 'pointer';

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
    button.addEventListener('click', () => openLightbox(absoluteIndex));

    figure.appendChild(button);
    figure.appendChild(caption);

    return figure;
  }

  function renderGalleries() {
    galleryOrder.forEach((key) => {
      const target = document.querySelector(`[data-workbench-gallery="${key}"]`);
      if (!target) return;

      const items = Array.isArray(window.WYCO_WORKBENCH_DATA?.[key])
        ? window.WYCO_WORKBENCH_DATA[key]
        : [];

      target.innerHTML = '';

      if (!items.length) {
        target.innerHTML = `
          <article class="glass panel" style="margin: 0; min-width: min(320px, 100%);">
            <p class="muted" style="margin: 0;">No ${escapeHtml(key)} projects added yet.</p>
          </article>
        `;
        return;
      }

      items.forEach((item) => {
        const absoluteIndex = allImages.push(item) - 1;
        target.appendChild(createFigure(item, absoluteIndex));
      });
    });
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

  function updateLightbox() {
    const { img, caption } = getLightboxElements();
    const item = allImages[currentIndex];
    if (!img || !caption || !item) return;

    img.src = item.src;
    img.alt = item.alt || item.title || 'Workbench image';
    caption.textContent = item.caption || item.title || '';
  }

  function openLightbox(index) {
    const { lightbox } = getLightboxElements();
    if (!lightbox || !allImages.length) return;

    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const { lightbox } = getLightboxElements();
    if (!lightbox) return;

    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showPrevious() {
    if (!allImages.length) return;
    currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    updateLightbox();
  }

  function showNext() {
    if (!allImages.length) return;
    currentIndex = (currentIndex + 1) % allImages.length;
    updateLightbox();
  }

  function bindLightbox() {
    const { lightbox, prev, next } = getLightboxElements();
    if (!lightbox) return;

    prev?.addEventListener('click', showPrevious);
    next?.addEventListener('click', showNext);

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      const isOpen = lightbox.classList.contains('active');
      if (!isOpen) return;

      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderGalleries();
      bindLightbox();
    });
  } else {
    renderGalleries();
    bindLightbox();
  }
})();
