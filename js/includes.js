async function loadIncludes() {
  const headerTarget = document.getElementById("site-header");
  const footerTarget = document.getElementById("site-footer");

  try {
    if (headerTarget) {
      const headerResponse = await fetch("/partials/header.html");
      if (!headerResponse.ok) {
        throw new Error(`Failed to load header: ${headerResponse.status}`);
      }
      headerTarget.innerHTML = await headerResponse.text();
    }

    if (footerTarget) {
      const footerResponse = await fetch("/partials/footer.html");
      if (!footerResponse.ok) {
        throw new Error(`Failed to load footer: ${footerResponse.status}`);
      }
      footerTarget.innerHTML = await footerResponse.text();
    }

    setActiveNav();
    setFooterContent();
    initMenuToggle();
  } catch (error) {
    console.error("Error loading shared partials:", error);
  }
}

function setActiveNav() {
  const currentPage = document.body.dataset.page;
  if (!currentPage) return;

  const navLink = document.querySelector(`.main-nav [data-nav="${currentPage}"]`);
  if (navLink) {
    navLink.classList.add("active");
  }
}

function setFooterContent() {
  const brand = document.body.dataset.footerBrand;
  const tagline = document.body.dataset.footerTagline;
  const description = document.body.dataset.footerDescription;

  const brandEl = document.getElementById("footerBrand");
  const taglineEl = document.getElementById("footerTagline");
  const descriptionEl = document.getElementById("footerDescription");

  if (brand && brandEl) {
    brandEl.textContent = brand;
  }

  if (tagline && taglineEl) {
    taglineEl.textContent = tagline;
  }

  if (description && descriptionEl) {
    descriptionEl.textContent = description;
  }
}

function initMenuToggle() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

document.addEventListener("DOMContentLoaded", loadIncludes);
