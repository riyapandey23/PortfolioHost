document.addEventListener('DOMContentLoaded', function () {
  const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();
  // Mobile menu toggle (hamburger)
  try {
    const menuBtn = document.querySelector('.menu-btn');
    const nav = document.querySelector('.nav');
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.toggle('active');
      });

      // Close when clicking outside
      document.addEventListener('click', (ev) => {
        if (!nav.contains(ev.target) && !menuBtn.contains(ev.target)) {
          nav.classList.remove('active');
        }
      });

      // Close when a link inside nav is clicked
      nav.addEventListener('click', (ev) => {
        if (ev.target.tagName === 'A') nav.classList.remove('active');
      });
    }
  } catch (e) {
    // ignore if DOM APIs not available
    console.warn('menu toggle error', e);
  }
  const elements = document.querySelectorAll('.fade-in, .slide-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = (idx * 0.08) + 's';
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  elements.forEach(el => observer.observe(el));

  // portrait parallax hover
  const portraitWrap = document.querySelector('.portrait-wrap');
  if (portraitWrap) {
    portraitWrap.addEventListener('mousemove', (e) => {
      const rect = portraitWrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      portraitWrap.style.transform = `rotateX(${ -y * 3 }deg) rotateY(${ x * 4 }deg)`;
    });
    portraitWrap.addEventListener('mouseleave', ()=> portraitWrap.style.transform = '');
  }

  // project image modal: gallery-capable modal with thumbnails, prev/next and keyboard navigation
  function openImageModal(images, title, startIndex = 0) {
    if (!Array.isArray(images)) images = [images];
    let idx = Math.max(0, Math.min(startIndex, images.length - 1));

    const overlay = document.createElement('div');
    overlay.className = 'image-modal-overlay';
    overlay.innerHTML = `
      <div class="image-modal" role="dialog" aria-modal="true" aria-label="${title}">
        <button class="image-modal-close" aria-label="Close image modal">×</button>
        <button class="image-modal-prev" aria-label="Previous image">‹</button>
        <button class="image-modal-next" aria-label="Next image">›</button>
        <div class="image-modal-body">
          <img src="${images[idx]}" alt="${title} (${idx+1} of ${images.length})" />
        </div>
        <div class="image-modal-footer"><small class="image-modal-caption">${title} — <span class="image-modal-counter">${idx+1}/${images.length}</span></small></div>
        <div class="image-modal-thumbs" aria-hidden="false"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const imgEl = overlay.querySelector('.image-modal-body img');
    const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
    const show = (i) => {
      idx = ((i % images.length) + images.length) % images.length; // wrap
      imgEl.src = images[idx];
      imgEl.alt = `${title} (${idx+1} of ${images.length})`;
      const counter = overlay.querySelector('.image-modal-counter');
      if (counter) counter.textContent = `${idx+1}/${images.length}`;
      // highlight thumbnail
      overlay.querySelectorAll('.image-modal-thumb').forEach((t, ti) => t.classList.toggle('active', ti === idx));
    };
    const next = () => show(idx + 1);
    const prev = () => show(idx - 1);

    const onKey = (ev) => {
      if (ev.key === 'Escape') close();
      if (ev.key === 'ArrowRight') next();
      if (ev.key === 'ArrowLeft') prev();
    };

    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) close(); });
    overlay.querySelector('.image-modal-close').addEventListener('click', close);
    overlay.querySelector('.image-modal-next').addEventListener('click', next);
    overlay.querySelector('.image-modal-prev').addEventListener('click', prev);
    document.addEventListener('keydown', onKey);

    // thumbnails
    const thumbs = overlay.querySelector('.image-modal-thumbs');
    images.forEach((src, i) => {
      const t = document.createElement('img');
      t.src = src;
      t.className = 'image-modal-thumb' + (i === idx ? ' active' : '');
      t.alt = `${title} thumbnail ${i+1}`;
      t.addEventListener('click', () => show(i));
      thumbs.appendChild(t);
    });

    // initial highlight
    show(idx);
  }

  document.querySelectorAll('.view-img-button').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const card = btn.closest('.project-card');
      const title = card?.dataset.title || card?.querySelector('h3')?.innerText || 'Project Images';

      // Priority order: data-gallery (comma-separated), img elements inside card, data-img
      let images = [];
      if (btn.dataset.gallery) {
        images = btn.dataset.gallery.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (!images.length && card) {
        // collect any img elements inside the card (use their src or data-src)
        const imgsInCard = card.querySelectorAll('img');
        images = Array.from(imgsInCard).map(i => i.dataset.src || i.getAttribute('src') || '').filter(Boolean);
      }
      if (!images.length && btn.dataset.img) images = [btn.dataset.img];

      if (images.length) openImageModal(images, title, 0);
    });
  });

  // Certification modal: open images if provided via data-images (comma-separated),
  // otherwise embed the PDF (data-pdf) inside a modal so it opens on the same page.
  document.querySelectorAll('.view-cert-btn').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const card = btn.closest('.cert-card');
      const title = card?.querySelector('h3')?.innerText || 'Certificate';

      const images = (btn.dataset.images || '').split(',').map(s => s.trim()).filter(Boolean);
      const pdf = btn.dataset.pdf || btn.getAttribute('href');

      if (images.length) {
        openImageModal(images, title, 0);
        return;
      }

      if (pdf) {
        // create a simple PDF modal (iframe fallback)
        const overlay = document.createElement('div');
        overlay.className = 'image-modal-overlay';
        overlay.innerHTML = `
          <div class="image-modal" role="dialog" aria-modal="true" aria-label="${title}">
            <button class="image-modal-close" aria-label="Close">×</button>
            <div class="image-modal-body pdf-viewer">
              <iframe src="${pdf}" frameborder="0" style="width:100%;height:80vh;"></iframe>
            </div>
            <div class="image-modal-footer"><small>${title} — <a href="${pdf}" target="_blank" rel="noopener">Open in new tab</a></small></div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
        const onKey = (ev) => { if (ev.key === 'Escape') close(); };

        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        overlay.querySelector('.image-modal-close').addEventListener('click', close);
        document.addEventListener('keydown', onKey);
      }
    });
  });
});