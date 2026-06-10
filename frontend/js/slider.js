const Slider = {
  current: 0,
  timer:   null,

  init() {
    const container = document.getElementById('heroSlider');
    const dotsEl    = document.getElementById('sliderDots');
    if (!container || !dotsEl) return;

    const slides = Data.sliderImages;

    // Build slide elements (inserted before .slider-controls)
    const controls = container.querySelector('.slider-controls');
    slides.forEach((s, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide' + (i === 0 ? ' active' : '');
      slide.innerHTML = `
        <img src="${s.image}" alt="${s.label}" loading="${i === 0 ? 'eager' : 'lazy'}" />
        <div class="slide-caption">
          <span class="slide-caption-label">${s.label}</span>
          <span class="slide-caption-sub">${s.sub}</span>
        </div>`;
      container.insertBefore(slide, controls);
    });

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => this.go(i));
      dotsEl.appendChild(dot);
    });

    this.timer = setInterval(() => this.next(), 4500);
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