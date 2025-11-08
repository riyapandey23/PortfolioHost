document.addEventListener('DOMContentLoaded', function () {
  const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();
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

  // project modal
  document.querySelectorAll('.project-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      const title = card.dataset.title || card.querySelector('h3')?.innerText || 'Project';
      const body = card.querySelector('p')?.innerText || '';
      const overlay = document.createElement('div');
      overlay.style.position='fixed'; overlay.style.inset=0; overlay.style.background='rgba(0,0,0,0.5)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.zIndex=9999; overlay.style.padding='20px';
      const box = document.createElement('div');
      box.style.background='#fff'; box.style.maxWidth='760px'; box.style.width='100%'; box.style.borderRadius='12px'; box.style.padding='22px';
      box.innerHTML = `<h2 style="margin-top:0">${title}</h2><p style="color:#5a5a5a;line-height:1.6">${body}</p><div style="margin-top:18px;display:flex;gap:12px;justify-content:flex-end"><a class="btn-outline" href="Riya_Pandey_Resume.pdf" download style="text-decoration:none;padding:8px 12px;border-radius:8px">Download Resume</a><button id="closeModal" style="background:#0f2b46;color:#fff;padding:8px 12px;border-radius:8px;border:none">Close</button></div>`;
      overlay.appendChild(box); document.body.appendChild(overlay);
      document.getElementById('closeModal').addEventListener('click', ()=> overlay.remove());
      overlay.addEventListener('click', (ev)=> { if (ev.target === overlay) overlay.remove(); });
    });
  });
});