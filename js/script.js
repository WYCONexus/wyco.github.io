document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------
     Shared Includes
  --------------------------- */

  async function loadIncludes() {
    const headerTarget = document.getElementById('site-header');
    const footerTarget = document.getElementById('site-footer');

    try {
      if (headerTarget) {
        const headerResponse = await fetch(`/partials/header.html?v=${Date.now()}`);

        if (!headerResponse.ok) {
          throw new Error(`Failed to load header: ${headerResponse.status}`);
        }

        headerTarget.innerHTML = await headerResponse.text();
      }

      if (footerTarget) {
        const footerResponse = await fetch(`/partials/footer.html?v=${Date.now()}`);

        if (!footerResponse.ok) {
          throw new Error(`Failed to load footer: ${footerResponse.status}`);
        }

        footerTarget.innerHTML = await footerResponse.text();
      }

      setActiveNav();
      setFooterContent();
      initMenuToggle();
    } catch (error) {
      console.error('Error loading shared partials:', error);
    }
  }


  /* ---------------------------
     Mobile Menu Toggle
  --------------------------- */

  function initMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');

    if (!menuToggle || !nav) return;

    if (menuToggle.dataset.menuBound === 'true') return;
    menuToggle.dataset.menuBound = 'true';

    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }


  /* ---------------------------
     Shared Header / Footer Helpers
  --------------------------- */

  function setActiveNav() {
    const currentPage = document.body.dataset.page;
    if (!currentPage) return;

    const navLink = document.querySelector(`.main-nav [data-nav="${currentPage}"]`);
    if (navLink) {
      navLink.classList.add('active');
    }
  }

  function setFooterContent() {
    const brand = document.body.dataset.footerBrand;
    const tagline = document.body.dataset.footerTagline;
    const description = document.body.dataset.footerDescription;

    const brandEl = document.getElementById('footerBrand');
    const taglineEl = document.getElementById('footerTagline');
    const descriptionEl = document.getElementById('footerDescription');

    if (brand && brandEl) brandEl.textContent = brand;
    if (tagline && taglineEl) taglineEl.textContent = tagline;
    if (description && descriptionEl) descriptionEl.textContent = description;
  }


  /* ---------------------------
     Shared Helpers
  --------------------------- */

  let timelineVisibleCount = 3;
  const timelineBatchSize = 2;

  const currentPageName = document.body?.dataset?.page || '';

  function getPageMediaData() {
    if (currentPageName === 'whimsy') {
      return window.whimsyData || {};
    }

    return window.wavesData || {};
  }

  function getDefaultMediaImage() {
    if (currentPageName === 'whimsy') {
      return '/images/waves/wyco_gradient_diagonal.jpg';
    }

    return '/images/waves/wyco_gradient_diagonal.jpg';
  }

  function getDefaultEmptyBadge() {
    return currentPageName === 'whimsy' ? 'Writing' : 'Media';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getScrollAmount(row, cardSelector) {
    const firstCard = row.querySelector(cardSelector);
    if (!firstCard) return 280;

    const styles = window.getComputedStyle(row);
    const gap = parseInt(styles.columnGap || styles.gap || 18, 10) || 18;

    return firstCard.offsetWidth + gap;
  }

  function formatDisplayDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function isInteractiveElement(target) {
    return !!target.closest(
      '.featured-music-arrow, .media-arrow, .nexus-arrow, button, a, input, textarea, select, audio, video'
    );
  }


  /* ---------------------------
     Overlay History + Scroll Lock
  --------------------------- */

  let closeSectionLibraryFromHistory = null;
  let closeLyricsFromHistory = null;
  let closePlayerFromHistory = null;
  let closeLightboxFromHistory = null;

  function isOverlayHistoryEntry() {
    return !!(history.state && history.state.overlayOpen);
  }

  function pushOverlayHistory(type, id = '') {
    if (isOverlayHistoryEntry()) return;

    history.pushState(
      {
        ...(history.state || {}),
        overlayOpen: true,
        overlayType: type,
        overlayId: id
      },
      '',
      window.location.href
    );
  }

  function clearOverlayHistory() {
    if (isOverlayHistoryEntry()) {
      history.back();
    }
  }

  function hasBlockingOverlayOpen() {
    return !!document.querySelector(
      '#sectionLibraryModal.active, #lyricsModal.active, #lightbox.is-open, #wavesPlayerModal:not([hidden])'
    );
  }

  function updateBodyScrollLock() {
    document.body.style.overflow = hasBlockingOverlayOpen() ? 'hidden' : '';
  }

  window.addEventListener('popstate', () => {
    const playerModal = document.getElementById('wavesPlayerModal');
    if (playerModal && !playerModal.hidden && typeof closePlayerFromHistory === 'function') {
      closePlayerFromHistory();
      return;
    }

    const lyricsModalEl = document.getElementById('lyricsModal');
    if (lyricsModalEl && lyricsModalEl.classList.contains('active') && typeof closeLyricsFromHistory === 'function') {
      closeLyricsFromHistory();
      return;
    }

    const sectionLibraryModalEl = document.getElementById('sectionLibraryModal');
    if (sectionLibraryModalEl && sectionLibraryModalEl.classList.contains('active') && typeof closeSectionLibraryFromHistory === 'function') {
      closeSectionLibraryFromHistory();
      return;
    }

    const lightboxEl = document.getElementById('lightbox');
    if (lightboxEl && lightboxEl.classList.contains('is-open') && typeof closeLightboxFromHistory === 'function') {
      closeLightboxFromHistory();
    }
  });


  /* ---------------------------
     Hub Live Data Rendering
  --------------------------- */

  function renderLiveCardMeta() {
    const liveCards = document.querySelectorAll('.live-card[data-card-key]');
    const dataSource = window.wycoData && window.wycoData.cards;

    if (!liveCards.length) return;

    liveCards.forEach((card) => {
      const key = card.dataset.cardKey;
      const metaTarget = card.querySelector('.card-live-meta');
      if (!metaTarget) return;

      if (!dataSource || !dataSource[key] || !Array.isArray(dataSource[key].meta)) {
        metaTarget.innerHTML = `<span class="live-meta-line">No live data yet</span>`;
        return;
      }

      const metaLines = dataSource[key].meta
        .filter(Boolean)
        .slice(0, 3)
        .map((line) => `<span class="live-meta-line">${line}</span>`)
        .join('');

      metaTarget.innerHTML = metaLines || `<span class="live-meta-line">No live data yet</span>`;
    });
  }

  function getTimelineData() {
    return window.wycoData && Array.isArray(window.wycoData.timeline)
      ? window.wycoData.timeline
      : [];
  }

  function buildTimelineItem(item) {
    const branch = escapeHtml(item.branch || 'WYCO');
    const title = escapeHtml(item.title || 'Update');
    const description = escapeHtml(item.description || '');
    const displayDate = escapeHtml(formatDisplayDate(item.date || ''));
    const branchClass = item.branchClass ? ` ${escapeHtml(item.branchClass)}` : '';

    return `
      <article class="timeline-item${branchClass}">
        <div class="timeline-marker" aria-hidden="true"></div>
        <div class="timeline-card">
          <div class="timeline-top">
            <div class="timeline-branch">
              <span class="timeline-branch-badge${branchClass}">${branch}</span>
            </div>
            <span class="timeline-date">${displayDate}</span>
          </div>
          <h3 class="timeline-title">${title}</h3>
          <p class="timeline-description">${description}</p>
        </div>
      </article>
    `;
  }

  function updateTimelineButton(totalItems) {
    const loadMoreButton = document.getElementById('timelineLoadMore');
    const timelineActions = document.getElementById('timelineActions');

    if (!loadMoreButton || !timelineActions) return;

    if (totalItems <= timelineVisibleCount) {
      timelineActions.hidden = true;
      loadMoreButton.hidden = true;
    } else {
      timelineActions.hidden = false;
      loadMoreButton.hidden = false;
    }
  }

  function renderTimeline() {
    const timelineItems = document.getElementById('timelineItems');
    const timelineEmpty = document.getElementById('timelineEmpty');
    const timelineData = getTimelineData();

    if (!timelineItems) return;

    if (!timelineData.length) {
      timelineItems.innerHTML = '';
      if (timelineEmpty) {
        timelineEmpty.hidden = false;
      }
      updateTimelineButton(0);
      return;
    }

    if (timelineEmpty) {
      timelineEmpty.hidden = true;
    }

    const visibleItems = timelineData.slice(0, timelineVisibleCount);

    timelineItems.innerHTML = visibleItems
      .map((item, index) => {
        const html = buildTimelineItem(item);
        return html.replace(
          'class="timeline-item',
          `class="timeline-item" style="animation-delay:${index * 0.05}s`
        );
      })
      .join('');

    updateTimelineButton(timelineData.length);
  }

  function setupTimelineLoadMore() {
    const loadMoreButton = document.getElementById('timelineLoadMore');
    if (!loadMoreButton) return;

    if (loadMoreButton.dataset.bound === 'true') return;
    loadMoreButton.dataset.bound = 'true';

    loadMoreButton.addEventListener('click', () => {
      const timelineData = getTimelineData();
      timelineVisibleCount += timelineBatchSize;

      if (timelineVisibleCount > timelineData.length) {
        timelineVisibleCount = timelineData.length;
      }

      renderTimeline();
    });
  }


  /* ---------------------------
     Shared Media Section Rendering
  --------------------------- */

  function normalizeMediaItem(item = {}) {
    const mediaType = item.mediaType || item.type || 'audio';

    return {
      title: item.title || 'Untitled',
      subtitle: item.subtitle || '',
      image: item.image || getDefaultMediaImage(),
      mediaSrc: item.mediaSrc || item.src || item.url || '',
      mediaType,
      badge: item.badge || (
        mediaType === 'video' ? 'Video' :
        mediaType === 'lyrics' ? 'Lyrics' :
        mediaType === 'text' ? 'Text' :
        mediaType === 'external' ? 'Open' :
        getDefaultEmptyBadge()
      ),
      lyrics: item.lyricsText || item.lyrics || item.text || '',
      album: item.album || ''
    };
  }

  function getMediaSectionItems(sectionKey) {
    const pageData = getPageMediaData();
    return Array.isArray(pageData?.[sectionKey]) ? pageData[sectionKey] : [];
  }

  function getMediaItemIcon(mediaType) {
    if (mediaType === 'video') return '▶';
    if (mediaType === 'lyrics' || mediaType === 'text') return '✎';
    if (mediaType === 'external') return '↗';
    return '✦';
  }

  function renderMediaSections() {
    const rows = document.querySelectorAll('[data-waves-section]');
    if (!rows.length) return;

    rows.forEach((target) => {
      const sectionKey = target.dataset.wavesSection;
      const rawData = getMediaSectionItems(sectionKey);
      const normalizedData = rawData.map(normalizeMediaItem);

      if (!normalizedData.length) {
        target.innerHTML = `
          <div class="waves-track-card" aria-hidden="true">
            <div class="waves-track-thumb">
              <img src="${escapeHtml(getDefaultMediaImage())}" alt="WYCO default artwork">
              <span class="waves-track-badge">Empty</span>
              <span class="waves-track-orb" aria-hidden="true">✦</span>
              <div class="waves-track-body">
                <h3>No items yet</h3>
                <p>Media will appear here when added.</p>
              </div>
            </div>
          </div>
        `;
        return;
      }

      target.innerHTML = normalizedData.map((item) => {
        const icon = getMediaItemIcon(item.mediaType);

        return `
          <article
            class="waves-track-card"
            data-track-title="${escapeHtml(item.title)}"
            data-track-subtitle="${escapeHtml(item.subtitle)}"
            data-track-image="${escapeHtml(item.image)}"
            data-track-mp3="${escapeHtml(item.mediaSrc)}"
            data-media-src="${escapeHtml(item.mediaSrc)}"
            data-media-type="${escapeHtml(item.mediaType)}"
            data-track-badge="${escapeHtml(item.badge)}"
            data-track-icon="${escapeHtml(icon)}"
            data-lyrics="${escapeHtml(item.lyrics)}"
            tabindex="0"
            aria-label="Open ${escapeHtml(item.title)}"
          >
            <div class="waves-track-thumb">
              <img
                src="${escapeHtml(item.image)}"
                alt="${escapeHtml(item.title)} cover art"
              >
              <span class="waves-track-badge">${escapeHtml(item.badge)}</span>
              <span class="waves-track-orb" aria-hidden="true">${icon}</span>

              <div class="waves-track-body">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.subtitle)}</p>
              </div>
            </div>
          </article>
        `;
      }).join('');
    });
  }


  /* ---------------------------
     Section Library Modal
  --------------------------- */

  const sectionLibraryModal = document.getElementById('sectionLibraryModal');
  const sectionLibraryTitle = document.getElementById('sectionLibraryTitle');
  const sectionLibrarySubtitle = document.getElementById('sectionLibrarySubtitle');
  const sectionLibraryList = document.getElementById('sectionLibraryList');
  const sectionLibraryClose = document.getElementById('sectionLibraryClose');
  const sectionLibrarySearch = document.getElementById('sectionLibrarySearch');

  let currentSectionLibraryItems = [];

  function getSectionLibraryIcon(item) {
    const mediaType = item.mediaType || item.type || 'audio';
    return getMediaItemIcon(mediaType);
  }

  function buildSectionLibraryItem(item) {
    const normalized = normalizeMediaItem(item);

    const title = escapeHtml(normalized.title);
    const subtitle = escapeHtml(normalized.subtitle);
    const image = escapeHtml(normalized.image);
    const badge = escapeHtml(normalized.badge);
    const mediaType = escapeHtml(normalized.mediaType);
    const mediaSrc = escapeHtml(normalized.mediaSrc);
    const lyrics = escapeHtml(normalized.lyrics);
    const icon = escapeHtml(getSectionLibraryIcon(normalized));

    return `
      <article
        class="section-library-item waves-track-card"
        data-track-title="${title}"
        data-track-subtitle="${subtitle}"
        data-track-image="${image}"
        data-track-mp3="${mediaSrc}"
        data-media-src="${mediaSrc}"
        data-media-type="${mediaType}"
        data-track-badge="${badge}"
        data-track-icon="${icon}"
        data-lyrics="${lyrics}"
        tabindex="0"
        aria-label="Open ${title}"
      >
        <div class="section-library-item-media">
          <img src="${image}" alt="${title} cover art">
        </div>

        <div class="section-library-item-copy">
          <span class="section-library-item-badge">${badge}</span>
          <h4 class="section-library-item-title">${title}</h4>
          <p class="section-library-item-subtitle">${subtitle}</p>
        </div>

        <span class="section-library-item-arrow" aria-hidden="true">${icon}</span>
      </article>
    `;
  }

  function renderSectionLibraryItems(items) {
    if (!sectionLibraryList) return;

    if (!items.length) {
      sectionLibraryList.innerHTML = `
        <div class="section-library-empty">
          No matching items found.
        </div>
      `;
      return;
    }

    sectionLibraryList.innerHTML = items.map(buildSectionLibraryItem).join('');
  }

  function openSectionLibraryModal(panel) {
    if (
      !sectionLibraryModal ||
      !sectionLibraryTitle ||
      !sectionLibrarySubtitle ||
      !sectionLibraryList ||
      !panel
    ) return;

    const title = panel.dataset.libraryTitle || 'Library';
    const subtitle = panel.dataset.librarySubtitle || 'Browse all items in this section.';
    const source = panel.dataset.librarySource || '';
    const items = getMediaSectionItems(source);

    currentSectionLibraryItems = items;

    sectionLibraryTitle.textContent = title;
    sectionLibrarySubtitle.textContent = subtitle;

    if (sectionLibrarySearch) {
      sectionLibrarySearch.value = '';
    }

    if (!items.length) {
      sectionLibraryList.innerHTML = `
        <div class="section-library-empty">
          No items have been added to this section yet.
        </div>
      `;
    } else {
      renderSectionLibraryItems(items);
    }

    sectionLibraryModal.classList.add('active');
    sectionLibraryModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('section-library-open');
    updateBodyScrollLock();
    pushOverlayHistory('section-library', panel.dataset.librarySource || panel.id || '');

    if (sectionLibrarySearch) {
      setTimeout(() => sectionLibrarySearch.focus(), 0);
    }
  }

  function closeSectionLibraryModal(fromPopState = false, preserveHistory = false) {
    if (!sectionLibraryModal) return;

    sectionLibraryModal.classList.remove('active');
    sectionLibraryModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('section-library-open');
    currentSectionLibraryItems = [];

    if (sectionLibrarySearch) {
      sectionLibrarySearch.value = '';
    }

    updateBodyScrollLock();

    if (!fromPopState && !preserveHistory) {
      clearOverlayHistory();
    }
  }

  closeSectionLibraryFromHistory = () => closeSectionLibraryModal(true);

  function setupSectionLibrarySearch() {
    if (!sectionLibrarySearch) return;
    if (sectionLibrarySearch.dataset.bound === 'true') return;
    sectionLibrarySearch.dataset.bound = 'true';

    sectionLibrarySearch.addEventListener('input', () => {
      const query = sectionLibrarySearch.value.trim().toLowerCase();

      if (!query) {
        renderSectionLibraryItems(currentSectionLibraryItems);
        return;
      }

      const filtered = currentSectionLibraryItems.filter((item) => {
        const normalized = normalizeMediaItem(item);

        const title = String(normalized.title || '').toLowerCase();
        const subtitle = String(normalized.subtitle || '').toLowerCase();
        const badge = String(normalized.badge || '').toLowerCase();
        const album = String(normalized.album || '').toLowerCase();

        return (
          title.includes(query) ||
          subtitle.includes(query) ||
          badge.includes(query) ||
          album.includes(query)
        );
      });

      renderSectionLibraryItems(filtered);
    });
  }

  function setupSectionLibraryTriggers() {
    const triggers = document.querySelectorAll('.section-library-trigger');
    if (!triggers.length) return;

    triggers.forEach((panel) => {
      const headTrigger = panel.querySelector('.section-library-head-trigger');
      if (!headTrigger) return;

      if (headTrigger.dataset.libraryBound === 'true') return;
      headTrigger.dataset.libraryBound = 'true';

      let touchMoved = false;

      headTrigger.addEventListener('touchstart', () => {
        touchMoved = false;
      }, { passive: true });

      headTrigger.addEventListener('touchmove', () => {
        touchMoved = true;
      }, { passive: true });

      headTrigger.addEventListener('touchend', (event) => {
        if (touchMoved) return;
        if (isInteractiveElement(event.target)) return;

        event.preventDefault();
        event.stopPropagation();
        openSectionLibraryModal(panel);
      }, { passive: false });

      headTrigger.addEventListener('click', (event) => {
        if (isInteractiveElement(event.target)) return;

        event.preventDefault();
        event.stopPropagation();
        openSectionLibraryModal(panel);
      });

      headTrigger.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (isInteractiveElement(event.target)) return;

        event.preventDefault();
        event.stopPropagation();
        openSectionLibraryModal(panel);
      });
    });

    if (sectionLibraryClose && sectionLibraryClose.dataset.bound !== 'true') {
      sectionLibraryClose.dataset.bound = 'true';
      sectionLibraryClose.addEventListener('click', () => closeSectionLibraryModal());
      sectionLibraryClose.addEventListener('touchend', (event) => {
        event.preventDefault();
        closeSectionLibraryModal();
      }, { passive: false });
    }

    if (sectionLibraryModal && sectionLibraryModal.dataset.bound !== 'true') {
      sectionLibraryModal.dataset.bound = 'true';

      sectionLibraryModal.addEventListener('click', (event) => {
        if (event.target.matches('[data-close-library]')) {
          closeSectionLibraryModal();
        }
      });

      sectionLibraryModal.addEventListener('touchend', (event) => {
        if (event.target.matches('[data-close-library]')) {
          event.preventDefault();
          closeSectionLibraryModal();
        }
      }, { passive: false });
    }
  }


  /* ---------------------------
     Nexus Repo Rendering
  --------------------------- */

  function renderRepoCard(repo) {
    const repoName = escapeHtml(repo.name);
    const repoUrl = escapeHtml(repo.html_url);
    const language = escapeHtml(repo.language || 'Miscellaneous');
    const description = escapeHtml(repo.description || 'No description added yet.');

    return `
      <a
        class="nexus-card"
        href="${repoUrl}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open ${repoName} repository"
      >
        <div class="nexus-thumb">
          <span class="nexus-badge">Repository</span>
          <span class="nexus-icon">↗</span>
          <img src="/images/waves/wyco_gradient_diagonal.jpg" alt="WYCO Nexus default artwork">
          <div class="nexus-meta">
            <h3 class="nexus-title">${repoName}</h3>
            <p class="nexus-subtitle">${language}</p>
            <div class="nexus-lines">
              <span>${description}</span>
            </div>
          </div>
        </div>
      </a>
    `;
  }

  async function loadGitHubRepos() {
    const repoRow = document.getElementById('repoRow');
    const username = 'WYCONexus';
    const totalReposToShow = 5;

    if (!repoRow) return;

    repoRow.innerHTML = `
      <div class="nexus-card" style="display:grid;place-items:center;min-height:220px;">
        <div class="nexus-meta">
          <h3 class="nexus-title">Loading repositories...</h3>
        </div>
      </div>
    `;

    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
      );

      if (!response.ok) {
        throw new Error('Failed to load repositories.');
      }

      const repos = await response.json();

      const publicRepos = repos
        .filter(repo => !repo.fork)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, totalReposToShow);

      if (publicRepos.length === 0) {
        repoRow.innerHTML = `
          <div class="nexus-card" style="display:grid;place-items:center;min-height:220px;">
            <div class="nexus-meta">
              <h3 class="nexus-title">No public repositories found</h3>
              <p class="nexus-subtitle">Add public repos on GitHub and they’ll appear here.</p>
            </div>
          </div>
        `;
        updateNexusCarouselButtons('repoRow');
        return;
      }

      repoRow.innerHTML = publicRepos.map(renderRepoCard).join('');
      updateNexusCarouselButtons('repoRow');
    } catch (error) {
      repoRow.innerHTML = `
        <div class="nexus-card" style="display:grid;place-items:center;min-height:220px;">
          <div class="nexus-meta">
            <h3 class="nexus-title">Could not load repositories</h3>
            <p class="nexus-subtitle">Check your GitHub username or try again later.</p>
          </div>
        </div>
      `;
      updateNexusCarouselButtons('repoRow');
      console.error(error);
    }
  }


  /* ---------------------------
     Nexus Carousel Controls
  --------------------------- */

  function updateNexusCarouselButtons(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;

    const leftButton = document.querySelector(`.nexus-arrow-left[data-target="${rowId}"]`);
    const rightButton = document.querySelector(`.nexus-arrow-right[data-target="${rowId}"]`);
    if (!leftButton || !rightButton) return;

    const maxScrollLeft = Math.max(0, row.scrollWidth - row.clientWidth);
    const currentScroll = Math.round(row.scrollLeft);

    leftButton.disabled = currentScroll <= 2;
    rightButton.disabled = currentScroll >= maxScrollLeft - 2;
  }

  function setupNexusCarouselButtons() {
    const arrowButtons = document.querySelectorAll('.nexus-arrow');

    arrowButtons.forEach((button) => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const rowId = button.dataset.target;
        const row = document.getElementById(rowId);
        if (!row) return;

        const amount = getScrollAmount(row, '.nexus-card');
        const direction = button.classList.contains('nexus-arrow-left') ? -1 : 1;

        row.scrollBy({
          left: amount * direction,
          behavior: 'smooth'
        });
      });
    });

    const rows = document.querySelectorAll('.nexus-row');

    rows.forEach((row) => {
      row.addEventListener('scroll', () => updateNexusCarouselButtons(row.id));
    });

    window.addEventListener('resize', () => {
      rows.forEach((row) => updateNexusCarouselButtons(row.id));
    });

    rows.forEach((row) => updateNexusCarouselButtons(row.id));
  }


  /* ---------------------------
     Lyrics Modal
  --------------------------- */

  const lyricsModal = document.getElementById('lyricsModal');
  const lyricsModalTitle = document.getElementById('lyricsModalTitle');
  const lyricsModalSubtitle = document.getElementById('lyricsModalSubtitle');
  const lyricsModalText = document.getElementById('lyricsModalText');
  const lyricsClose = document.getElementById('lyricsClose');

  function openLyricsModal(title, subtitle, lyrics) {
    if (!lyricsModal || !lyricsModalTitle || !lyricsModalSubtitle || !lyricsModalText) return;

    lyricsModalTitle.textContent = title;
    lyricsModalSubtitle.textContent = subtitle;
    lyricsModalText.textContent = lyrics;
    lyricsModal.classList.add('active');
    lyricsModal.setAttribute('aria-hidden', 'false');
    updateBodyScrollLock();
    pushOverlayHistory('lyrics', title || '');
  }

  function closeLyricsModal(fromPopState = false, preserveHistory = false) {
    if (!lyricsModal) return;

    lyricsModal.classList.remove('active');
    lyricsModal.setAttribute('aria-hidden', 'true');
    updateBodyScrollLock();

    if (!fromPopState && !preserveHistory) {
      clearOverlayHistory();
    }
  }

  closeLyricsFromHistory = () => closeLyricsModal(true);

  if (lyricsModal) {
    if (lyricsClose) {
      lyricsClose.addEventListener('click', () => closeLyricsModal());
    }

    lyricsModal.addEventListener('click', (event) => {
      if (event.target === lyricsModal) {
        closeLyricsModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && lyricsModal.classList.contains('active')) {
        closeLyricsModal();
      }
    });
  }


  /* ---------------------------
     Waves / Whimsy Carousel Controls
  --------------------------- */

  function updateMediaCarouselButtons(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;

    const leftButton = document.querySelector(`.media-arrow-left[data-target="${rowId}"]`);
    const rightButton = document.querySelector(`.media-arrow-right[data-target="${rowId}"]`);
    if (!leftButton || !rightButton) return;

    const maxScrollLeft = Math.max(0, row.scrollWidth - row.clientWidth);
    const currentScroll = Math.round(row.scrollLeft);

    leftButton.disabled = currentScroll <= 2;
    rightButton.disabled = currentScroll >= maxScrollLeft - 2;
  }

  function setupMediaCarouselButtons() {
    const mediaArrowButtons = document.querySelectorAll('.media-arrow');

    mediaArrowButtons.forEach((button) => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const rowId = button.dataset.target;
        const row = document.getElementById(rowId);
        if (!row) return;

        const amount = getScrollAmount(row, '.media-card, .lyrics-card, .waves-track-card');
        const direction = button.classList.contains('media-arrow-left') ? -1 : 1;

        row.scrollLeft += amount * direction;
      });
    });

    const featuredArrowButtons = document.querySelectorAll('.featured-music-arrow');

    featuredArrowButtons.forEach((button) => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const panel = button.closest('.featured-music-panel');
        const row = panel ? panel.querySelector('.waves-track-grid') : null;
        if (!row) return;

        const amount = row.clientWidth * 0.9;
        const direction = button.classList.contains('arrow-left') ? -1 : 1;

        row.scrollBy({
          left: amount * direction,
          behavior: 'smooth'
        });
      });
    });

    const rows = document.querySelectorAll('.media-row, .waves-track-grid');

    rows.forEach((row) => {
      row.addEventListener('scroll', () => {
        if (row.id) updateMediaCarouselButtons(row.id);
      });
    });

    window.addEventListener('resize', () => {
      rows.forEach((row) => {
        if (row.id) updateMediaCarouselButtons(row.id);
      });
    });

    rows.forEach((row) => {
      if (row.id) updateMediaCarouselButtons(row.id);
    });
  }


  /* ---------------------------
     Completed Projects Carousel
  --------------------------- */

  function setupCompletedCarousel() {
    const track = document.querySelector('.completed-track');
    if (!track) return;

    if (track.dataset.carouselReady === 'true') return;

    const existingClones = track.querySelectorAll('[data-clone="true"]');
    existingClones.forEach((clone) => clone.remove());

    const originalCards = Array.from(track.children).filter(
      (card) => card.dataset.clone !== 'true'
    );

    if (originalCards.length <= 1) {
      track.dataset.carouselReady = 'true';
      return;
    }

    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.dataset.clone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    track.dataset.carouselReady = 'true';
  }


  /* ---------------------------
     Legal Links + Back Button
  --------------------------- */

  function setupLegalLinks() {
    const legalLinks = document.querySelectorAll('.js-legal-link');
    if (!legalLinks.length) return;

    legalLinks.forEach((link) => {
      const baseHref = link.getAttribute('href');
      if (!baseHref) return;

      const from = window.location.pathname;
      link.setAttribute('href', `${baseHref}?from=${encodeURIComponent(from)}`);
    });
  }

  function setupLegalBackButton() {
    const backButton = document.getElementById('backButton');
    if (!backButton) return;

    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');

    if (from) {
      backButton.setAttribute('href', from);
    } else {
      backButton.setAttribute('href', '/');
    }
  }


  /* ---------------------------
     Workbench Image Lightbox
  --------------------------- */

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const workbenchGalleries = Array.from(document.querySelectorAll(".workbench-gallery"));

  if (lightbox && lightboxImg && lightboxPrev && lightboxNext && lightboxCaption && workbenchGalleries.length) {
    let currentGalleryImages = [];
    let currentImageIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    function showImage(index) {
      currentImageIndex = index;
      const img = currentGalleryImages[currentImageIndex];

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "";
      lightboxCaption.textContent = img.alt || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      updateBodyScrollLock();
      pushOverlayHistory('lightbox', String(index));
    }

    function closeLightbox(fromPopState = false) {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImg.src = "";
      lightboxImg.alt = "";
      lightboxCaption.textContent = "";
      updateBodyScrollLock();

      if (!fromPopState) {
        clearOverlayHistory();
      }
    }

    closeLightboxFromHistory = () => closeLightbox(true);

    function showNextImage() {
      currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
      showImage(currentImageIndex);
    }

    function showPrevImage() {
      currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
      showImage(currentImageIndex);
    }

    workbenchGalleries.forEach(gallery => {
      const galleryImages = Array.from(gallery.querySelectorAll(".workbench-img"));

      galleryImages.forEach((img, index) => {
        img.addEventListener("click", () => {
          currentGalleryImages = galleryImages;
          showImage(index);
        });
      });
    });

    lightboxNext.addEventListener("click", (event) => {
      event.stopPropagation();
      if (currentGalleryImages.length) showNextImage();
    });

    lightboxPrev.addEventListener("click", (event) => {
      event.stopPropagation();
      if (currentGalleryImages.length) showPrevImage();
    });

    lightboxImg.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    lightbox.addEventListener("click", () => {
      closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowRight") {
        showNextImage();
      } else if (event.key === "ArrowLeft") {
        showPrevImage();
      }
    });

    lightbox.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener("touchend", (event) => {
      touchEndX = event.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) < 50 || !currentGalleryImages.length) return;

      if (swipeDistance < 0) {
        showNextImage();
      } else {
        showPrevImage();
      }
    }, { passive: true });
  }


  /* ---------------------------
     Waves / Whimsy Media Modal
  --------------------------- */

  const modal = document.getElementById("wavesPlayerModal");

  if (modal) {
    const backdrop = modal.querySelector(".waves-player-backdrop");
    const closeBtn = modal.querySelector(".waves-player-close");
    const artBlock = modal.querySelector(".waves-player-art");

    const modalImage = document.getElementById("wavesModalImage");
    const modalTitle = document.getElementById("wavesModalTitle");
    const modalSubtitle = document.getElementById("wavesModalSubtitle");

    const audioShell = document.getElementById("wavesAudioPlayerShell");
    const videoShell = document.getElementById("wavesVideoPlayerShell");

    const audio = document.getElementById("wavesModalAudio");
    const source = document.getElementById("wavesModalSource");

    const video = document.getElementById("wavesModalVideo");
    const videoSource = document.getElementById("wavesModalVideoSource");

    const playBtn = modal.querySelector(".wyco-modal-play");
    const playIcon = modal.querySelector(".wyco-modal-play-icon");
    const muteBtn = modal.querySelector(".wyco-modal-mute");
    const progress = modal.querySelector(".wyco-modal-progress");
    const volume = modal.querySelector(".wyco-modal-volume");
    const currentTimeEl = modal.querySelector(".wyco-modal-current");
    const durationEl = modal.querySelector(".wyco-modal-duration");

    function formatTime(time) {
      if (isNaN(time)) return "0:00";
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60).toString().padStart(2, "0");
      return `${minutes}:${seconds}`;
    }

    function showAudioMode() {
      if (artBlock) artBlock.hidden = false;
      if (audioShell) audioShell.hidden = false;
      if (videoShell) videoShell.hidden = true;
      if (video) video.pause();
    }

    function showVideoMode() {
      if (artBlock) artBlock.hidden = true;
      if (audioShell) audioShell.hidden = true;
      if (videoShell) videoShell.hidden = false;
      if (audio) audio.pause();
    }

    function resetAudioPlayer() {
      if (!audio || !source) return;
      audio.pause();
      audio.currentTime = 0;
      source.src = "";
      audio.load();

      if (currentTimeEl) currentTimeEl.textContent = "0:00";
      if (durationEl) durationEl.textContent = "0:00";
      if (progress) progress.value = 0;
    }

    function resetVideoPlayer() {
      if (!video || !videoSource) return;
      video.pause();
      video.currentTime = 0;
      videoSource.src = "";
      video.load();
    }

    function updatePlayState() {
      if (!audio || !playBtn || !playIcon) return;

      if (audio.paused) {
        playIcon.textContent = "▶";
        playBtn.setAttribute("aria-label", "Play");
      } else {
        playIcon.textContent = "❚❚";
        playBtn.setAttribute("aria-label", "Pause");
      }
    }

    function updateMuteState() {
      if (!audio || !muteBtn) return;

      const muted = audio.muted || audio.volume === 0;
      muteBtn.textContent = muted ? "🔇" : "🔊";
      muteBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    }

    function updateProgress() {
      if (!audio || !progress || !currentTimeEl || !audio.duration) return;

      progress.value = (audio.currentTime / audio.duration) * 100;
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }

    function openAudioPlayer(card) {
      if (
        !modalTitle || !modalSubtitle || !modalImage ||
        !audio || !source || !currentTimeEl || !durationEl || !progress
      ) return;

      const title = card.dataset.trackTitle || "Untitled Track";
      const subtitle = card.dataset.trackSubtitle || "";
      const image = card.dataset.trackImage || "";
      const mediaSrc = card.dataset.mediaSrc || card.dataset.trackMp3 || "";

      closeSectionLibraryModal(false, true);
      closeLyricsModal(false, true);

      showAudioMode();
      resetVideoPlayer();

      modalTitle.textContent = title;
      modalSubtitle.textContent = subtitle;
      modalImage.src = image;
      modalImage.alt = `${title} cover art`;

      audio.pause();
      source.src = mediaSrc;
      audio.load();

      currentTimeEl.textContent = "0:00";
      durationEl.textContent = "0:00";
      progress.value = 0;

      modal.hidden = false;
      updateBodyScrollLock();
      pushOverlayHistory('player', title);
    }

    function openVideoPlayer(card) {
      if (
        !modalTitle || !modalSubtitle || !video || !videoSource
      ) return;

      const title = card.dataset.trackTitle || "Untitled Video";
      const subtitle = card.dataset.trackSubtitle || "";
      const image = card.dataset.trackImage || "";
      const mediaSrc = card.dataset.mediaSrc || "";

      closeSectionLibraryModal(false, true);
      closeLyricsModal(false, true);

      showVideoMode();
      resetAudioPlayer();

      modalTitle.textContent = title;
      modalSubtitle.textContent = subtitle;

      if (modalImage) {
        modalImage.src = image;
        modalImage.alt = `${title} cover art`;
      }

      video.pause();
      videoSource.src = mediaSrc;
      video.load();

      modal.hidden = false;
      updateBodyScrollLock();
      pushOverlayHistory('player', title);
    }

    function closePlayer(fromPopState = false, preserveHistory = false) {
      if (audio) audio.pause();
      if (video) video.pause();
      modal.hidden = true;
      updateBodyScrollLock();

      if (!fromPopState && !preserveHistory) {
        clearOverlayHistory();
      }
    }

    closePlayerFromHistory = () => closePlayer(true);

    function handleMediaCardActivation(card) {
      if (!card) return;

      const mediaType = card.dataset.mediaType || "audio";
      const title = card.dataset.trackTitle || "Untitled";
      const subtitle = card.dataset.trackSubtitle || "";
      const lyrics = card.dataset.lyrics || "No text added yet.";
      const mediaSrc = card.dataset.mediaSrc || "";

      if (mediaType === "lyrics" || mediaType === "text") {
        closeSectionLibraryModal(false, true);
        openLyricsModal(title, subtitle || "Text", lyrics);
        return;
      }

      if (mediaType === "external") {
        if (mediaSrc) {
          window.open(mediaSrc, '_blank', 'noopener,noreferrer');
        }
        return;
      }

      if (mediaType === "video") {
        openVideoPlayer(card);
        return;
      }

      openAudioPlayer(card);
    }

    document.addEventListener("click", (event) => {
      if (isInteractiveElement(event.target)) return;

      const card = event.target.closest(".waves-track-card");
      if (!card) return;

      handleMediaCardActivation(card);
    });

    document.addEventListener("keydown", (event) => {
      const card = event.target.closest(".waves-track-card");
      if (!card) return;

      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      handleMediaCardActivation(card);
    });

    if (backdrop) {
      backdrop.addEventListener("click", () => closePlayer());
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => closePlayer());
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!modal.hidden) {
          closePlayer();
          return;
        }

        if (sectionLibraryModal && sectionLibraryModal.classList.contains('active')) {
          closeSectionLibraryModal();
          return;
        }
      }
    });

    if (playBtn && audio) {
      playBtn.addEventListener("click", async () => {
        if (audioShell && audioShell.hidden) return;

        if (audio.paused) {
          try {
            await audio.play();
          } catch (err) {
            console.error("Playback failed:", err);
          }
        } else {
          audio.pause();
        }
      });
    }

    if (muteBtn && audio) {
      muteBtn.addEventListener("click", () => {
        if (audioShell && audioShell.hidden) return;

        audio.muted = !audio.muted;
        updateMuteState();
      });
    }

    if (progress && audio) {
      progress.addEventListener("input", () => {
        if (audioShell && audioShell.hidden) return;
        if (!audio.duration) return;
        audio.currentTime = (progress.value / 100) * audio.duration;
      });
    }

    if (volume && audio) {
      volume.addEventListener("input", () => {
        if (audioShell && audioShell.hidden) return;

        audio.volume = parseFloat(volume.value);
        audio.muted = audio.volume === 0;
        updateMuteState();
      });
    }

    if (audio) {
      audio.addEventListener("loadedmetadata", () => {
        if (durationEl) durationEl.textContent = formatTime(audio.duration);
        if (volume) volume.value = audio.volume;
        updateProgress();
      });

      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("play", updatePlayState);
      audio.addEventListener("pause", updatePlayState);
      audio.addEventListener("volumechange", updateMuteState);

      audio.addEventListener("ended", () => {
        if (progress) progress.value = 0;
        if (currentTimeEl) currentTimeEl.textContent = "0:00";
        updatePlayState();
      });
    }

    showAudioMode();
    updatePlayState();
    updateMuteState();
  }


  /* ---------------------------
     Initialize
  --------------------------- */

  async function initSite() {
    await loadIncludes();

    setupLegalLinks();
    setupLegalBackButton();
    renderLiveCardMeta();
    setupTimelineLoadMore();
    renderTimeline();
    renderMediaSections();
    setupSectionLibraryTriggers();
    setupSectionLibrarySearch();
    setupNexusCarouselButtons();
    setupMediaCarouselButtons();
    setupCompletedCarousel();
    loadGitHubRepos();
  }

  initSite();

});