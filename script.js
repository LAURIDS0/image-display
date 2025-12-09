// Get elements
const slideshow = document.getElementById('slideshow');
const slideshowImg = document.getElementById('slideshow-img');
const noImagesMsg = document.getElementById('no-images');

let images = [];
let currentImageIndex = 0;
let slideshowInterval = null;

// Generate QR code with current URL
function generateQRCode() {
    // Use current URL (works both locally and on GitHub Pages)
    const uploadUrl = window.location.origin + window.location.pathname.replace('index.html', '') + 'upload.html';
    
    const qr = new QRious({
        element: document.getElementById('qr-code'),
        value: uploadUrl,
        size: 150,
        level: 'H'
    });

    document.getElementById('qr-url').textContent = 'Scan for at uploade';
}

// Load images from localStorage
function loadImages() {
    const storedImages = localStorage.getItem('uploadedImages');
    if (storedImages) {
        images = JSON.parse(storedImages);
    }
    startSlideshow();
}

// Start slideshow
function startSlideshow() {
    if (images.length === 0) {
        noImagesMsg.style.display = 'block';
        slideshow.style.display = 'none';
        return;
    }
    
    noImagesMsg.style.display = 'none';
    slideshow.style.display = 'flex';
    
    // Show first image
    showRandomImage();
    
    // Clear existing interval
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
    }
    
    // Change to random image every 15 seconds
    slideshowInterval = setInterval(showRandomImage, 15000);
}

// Show random image
function showRandomImage() {
    if (images.length === 0) return;
    
    // Get random index (different from current if possible)
    let newIndex;
    if (images.length === 1) {
        newIndex = 0;
    } else {
        do {
            newIndex = Math.floor(Math.random() * images.length);
        } while (newIndex === currentImageIndex && images.length > 1);
    }
    
    currentImageIndex = newIndex;
    
    // Fade out
    slideshowImg.classList.remove('active');
    
    // Wait for fade out, then change image and fade in
    setTimeout(() => {
        slideshowImg.src = images[currentImageIndex].data;
        slideshowImg.classList.add('active');
    }, 500);
}

// Listen for storage changes (when images are uploaded)
window.addEventListener('storage', (e) => {
    if (e.key === 'uploadedImages') {
        loadImages();
    }
});

// Reload images periodically to catch updates
setInterval(loadImages, 2000);

// Initialize
generateQRCode();
loadImages();
