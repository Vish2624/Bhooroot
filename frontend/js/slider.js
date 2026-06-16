const Slider = {
  current: 0,
  timer:   null,

  async init() {
    const container = document.getElementById('heroSlider');
    const dotsEl    = document.getElementById('sliderDots');
    if (!container || !dotsEl) return;

    // Render static slides immediately so the slider is never empty
    this._render(container, dotsEl, Data.sliderImages);
    this.timer = setInterval(() => this.next(), 4500);

    // Then try to load admin-managed banners from the API
    try {
      const res = await Api.getBanners('hero');
      if (res && res.data && res.data.length > 0) {
        const apiSlides = res.data.map(b => ({
          image: b.imageDesktop || b.imageMobile || Data.sliderImages[0].image,
          label: b.title    || '',
          sub:   b.subtitle || '',
          link:  b.buttonUrl || null,
        }));
        // Swap in the live banners
        clearInterval(this.timer);
        this.current = 0;
        container.querySelectorAll('.slide').forEach(el => el.remove());
        dotsEl.innerHTML = '';
        this._render(container, dotsEl, apiSlides);
        this.timer = setInterval(() => this.next(), 4500);
      }
    } catch (_) {
      // Network error or API unavailable — keep static fallback already rendered
    }
  },

  _render(container, dotsEl, slides) {
    const controls = container.querySelector('.slider-controls');
    slides.forEach((s, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide' + (i === 0 ? ' active' : '');
      const caption = (s.label || s.sub)
        ? `<div class="slide-caption">
             ${s.label ? `<span class="slide-caption-label">${s.label}</span>` : ''}
             ${s.sub   ? `<span class="slide-caption-sub">${s.sub}</span>`     : ''}
           </div>`
        : '';
      const inner = `<img src="${s.image}" alt="${s.label || 'Banner'}" loading="${i === 0 ? 'eager' : 'lazy'}" />${caption}`;
      slide.innerHTML = s.link
        ? `<a href="${s.link}" style="display:contents">${inner}</a>`
        : inner;
      container.insertBefore(slide, controls);
    });

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => this.go(i));
      dotsEl.appendChild(dot);
    });
  },

  go(index) {
    const slides = document.querySelectorAll('#heroSlider .slide');
    const dots   = document.querySelectorAll('#sliderDots .slider-dot');
    if (!slides.length) return;

    slides[this.current].classList.remove('active');
    dots[this.current].classList.remove('active');

    this.current = (index + slides.length) % slides.length;

    slides[this.current].classList.add('active');
    dots[this.current].classList.add('active');
  },

  next() { this.go(this.current + 1); },
  prev() { this.go(this.current - 1); },
};
