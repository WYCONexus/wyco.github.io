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
        .map((line) => `<span class="live-meta-line">${escapeHtml(line)}</span>`)
        .join('');

      metaTarget.innerHTML = metaLines || `<span class="live-meta-line">No live data yet</span>`;
    });
  }

  function renderTimeline() {
    const timelineItems = document.getElementById('timelineItems');
    const timelineEmpty = document.getElementById('timelineEmpty');
    const timelineData = window.wycoData && Array.isArray(window.wycoData.timeline)
      ? window.wycoData.timeline
      : null;

    if (!timelineItems) return;

    if (!timelineData || timelineData.length === 0) {
      timelineItems.innerHTML = '';
      if (timelineEmpty) {
        timelineEmpty.hidden = false;
      }
      return;
    }

    if (timelineEmpty) {
      timelineEmpty.hidden = true;
    }

    timelineItems.innerHTML = timelineData.map((item) => {
      const branch = escapeHtml(item.branch || 'WYCO');
      const title = escapeHtml(item.title || 'Update');
      const description = escapeHtml(item.description || '');
      const displayDate = escapeHtml(formatDisplayDate(item.date || ''));
      const badgeClass = item.branchClass ? ` ${escapeHtml(item.branchClass)}` : '';

      return `
        <article class="timeline-item">
          <div class="timeline-marker" aria-hidden="true"></div>
          <div class="timeline-card">
            <div class="timeline-top">
              <div class="timeline-branch">
                <span class="timeline-branch-badge${badgeClass}">${branch}</span>
              </div>
              <span class="timeline-date">${displayDate}</span>
            </div>
            <h3 class="timeline-title">${title}</h3>
            <p class="timeline-description">${description}</p>
          </div>
        </article>
      `;
    }).join('');
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
      button.addEventListener('click', () => {
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
     Waves / Whimsy Text Modal
  --------------------------- */

  const lyricsCards = document.querySelectorAll('.lyrics-card');
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
    document.body.style.overflow = 'hidden';
  }

  function closeLyricsModal() {
    if (!lyricsModal) return;

    lyricsModal.classList.remove('active');
    lyricsModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (lyricsCards.length && lyricsModal) {
    lyricsCards.forEach((card) => {
      card.addEventListener('click', () => {
        openLyricsModal(
          card.dataset.title || 'Untitled',
          card.dataset.subtitle || 'Lyrics',
          card.dataset.lyrics || 'No lyrics added yet.'
        );
      });
    });

    if (lyricsClose) {
      lyricsClose.addEventListener('click', closeLyricsModal);
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
    const arrowButtons = document.querySelectorAll('.media-arrow');

    arrowButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const rowId = button.dataset.target;
        const row = document.getElementById(rowId);
        if (!row) return;

        const amount = getScrollAmount(row, '.media-card, .lyrics-card');
        const direction = button.classList.contains('media-arrow-left') ? -1 : 1;

        row.scrollBy({
          left: amount * direction,
          behavior: 'smooth'
        });
      });
    });

    const rows = document.querySelectorAll('.media-row');

    rows.forEach((row) => {
      row.addEventListener('scroll', () => updateMediaCarouselButtons(row.id));
    });

    window.addEventListener('resize', () => {
      rows.forEach((row) => updateMediaCarouselButtons(row.id));
    });

    rows.forEach((row) => updateMediaCarouselButtons(row.id));
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
     Initialize
  --------------------------- */

  async function initSite() {
    await loadIncludes();

    setupLegalLinks();
    setupLegalBackButton();
    renderLiveCardMeta();
    renderTimeline();
    setupNexusCarouselButtons();
    setupMediaCarouselButtons();
    setupCompletedCarousel();
    loadGitHubRepos();
  }

  initSite();

});
