// Get elements
const slideshow = document.getElementById('slideshow');
const slideshowImg = document.getElementById('slideshow-img');
const noImagesMsg = document.getElementById('no-images');

let images = [];
let currentImageIndex = 0;
let slideshowInterval = null;

// Generate QR code with current URL
function generateQRCode() {
    try {
        // Use current URL (works both locally and on GitHub Pages)
        const uploadUrl = window.location.origin + window.location.pathname.replace('index.html', '') + 'upload.html';
        
        console.log('Generating QR code for:', uploadUrl);
        
        const canvas = document.getElementById('qr-code');
        if (!canvas) {
            console.error('QR code canvas not found!');
            return;
        }
        
        if (typeof QRious === 'undefined') {
            console.error('QRious library not loaded!');
            return;
        }
        
        const qr = new QRious({
            element: canvas,
            value: uploadUrl,
            size: 180,
            level: 'H'
        });
        
        console.log('QR code generated successfully');
        document.getElementById('qr-url').textContent = 'Scan for at uploade';
        
        // Force display
        document.getElementById('qr-container').style.display = 'block';
    } catch (error) {
        console.error('Error generating QR code:', error);
    }
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

// Initialize - wait for QRious library to load
window.addEventListener('load', () => {
    console.log('Page loaded, generating QR code...');
    setTimeout(() => {
        generateQRCode();
        loadImages();
    }, 100);
});
