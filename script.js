let currentSlide = 1;
const totalSlides = 5;

function updateSlide() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const counter = document.getElementById('current-slide');
    
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

// Touch swipe support
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        nextSlide();
    }
    if (touchEndX > touchStartX + 50) {
        previousSlide();
    }
}

// Initialize
updateSlide();