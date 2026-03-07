document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------
     Mobile Menu Toggle
  --------------------------- */

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }


  /* ---------------------------
     Nexus Repo Rendering
  --------------------------- */

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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
          <img src="images/waves/wyco_gradient_diagonal.jpg" alt="WYCO Nexus default artwork">
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


  /* ---------------------------
     Load GitHub Repositories
  --------------------------- */

  async function loadGitHubRepos() {

    const repoRow = document.getElementById('repoRow');

    if (!repoRow) return;

    const username = 'WYCONexus';
    const totalReposToShow = 5;

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

        updateCarouselButtons('repoRow');
        return;

      }

      repoRow.innerHTML = publicRepos.map(renderRepoCard).join('');

      updateCarouselButtons('repoRow');

    } catch (error) {

      repoRow.innerHTML = `
        <div class="nexus-card" style="display:grid;place-items:center;min-height:220px;">
          <div class="nexus-meta">
            <h3 class="nexus-title">Could not load repositories</h3>
            <p class="nexus-subtitle">Check your GitHub username or try again later.</p>
          </div>
        </div>
      `;

      updateCarouselButtons('repoRow');

      console.error(error);

    }

  }


  /* ---------------------------
     Carousel Controls
  --------------------------- */

  function getScrollAmount(row) {

    const firstCard = row.querySelector('.nexus-card');

    if (!firstCard) return 280;

    const styles = window.getComputedStyle(row);

    const gap = parseInt(styles.columnGap || styles.gap || 18, 10) || 18;

    return firstCard.offsetWidth + gap;

  }

  function updateCarouselButtons(rowId) {

    const row = document.getElementById(rowId);

    if (!row) return;

    const leftButton = document.querySelector(
      `.nexus-arrow-left[data-target="${rowId}"]`
    );

    const rightButton = document.querySelector(
      `.nexus-arrow-right[data-target="${rowId}"]`
    );

    if (!leftButton || !rightButton) return;

    const maxScrollLeft = Math.max(0, row.scrollWidth - row.clientWidth);

    const currentScroll = Math.round(row.scrollLeft);

    leftButton.disabled = currentScroll <= 2;

    rightButton.disabled = currentScroll >= maxScrollLeft - 2;

  }

  function setupCarouselButtons() {

    const arrowButtons = document.querySelectorAll('.nexus-arrow');

    arrowButtons.forEach(button => {

      button.addEventListener('click', () => {

        const rowId = button.dataset.target;

        const row = document.getElementById(rowId);

        if (!row) return;

        const amount = getScrollAmount(row);

        const direction = button.classList.contains('nexus-arrow-left')
          ? -1
          : 1;

        row.scrollBy({
          left: amount * direction,
          behavior: 'smooth'
        });

      });

    });

    const rows = document.querySelectorAll('.nexus-row');

    rows.forEach(row => {

      row.addEventListener('scroll', () => {
        updateCarouselButtons(row.id);
      });

    });

    window.addEventListener('resize', () => {

      rows.forEach(row => updateCarouselButtons(row.id));

    });

    rows.forEach(row => updateCarouselButtons(row.id));

  }


  /* ---------------------------
     Initialize
  --------------------------- */

  setupCarouselButtons();
  loadGitHubRepos();

});
