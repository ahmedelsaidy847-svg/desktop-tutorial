let currentSlide = 1;
const totalSlides = 5;

// Cache DOM queries to avoid repeated layout thrashing
const slides = Array.from(document.querySelectorAll('.slide'));
const indicators = Array.from(document.querySelectorAll('.indicator'));
const counter = document.getElementById('current-slide');

function updateSlide() {
    slides.forEach((slide, index) => {
        slide.classList.remove('active', 'prev');
        if (index + 1 === currentSlide) {
            slide.classList.add('active');
        } else if (index + 1 < currentSlide) {
            slide.classList.add('prev');
        }
    });

    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index + 1 === currentSlide);
    });

    counter.textContent = currentSlide;
}

function nextSlide() {
    if (currentSlide < totalSlides) {
        currentSlide++;
        updateSlide();
    }
}

function previousSlide() {
    if (currentSlide > 1) {
        currentSlide--;
        updateSlide();
    }
}

function goToSlide(slideNumber) {
    currentSlide = slideNumber;
    updateSlide();
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        previousSlide();
    }
});

// Touch swipe support — passive listeners don't block scroll
let touchStartX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (delta < -50) nextSlide();
    else if (delta > 50) previousSlide();
}, { passive: true });

// Initialize
updateSlide();