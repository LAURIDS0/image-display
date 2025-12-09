// Get elements
const gallery = document.getElementById('gallery');
const noImagesMsg = document.getElementById('no-images');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalClose = document.getElementById('modal-close');
const modalPrev = document.getElementById('modal-prev');
const modalNext = document.getElementById('modal-next');

let images = [];
let currentImageIndex = 0;

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
    displayImages();
}

// Save images to localStorage
function saveImages() {
    localStorage.setItem('uploadedImages', JSON.stringify(images));
}

// Display images in gallery
function displayImages() {
    gallery.innerHTML = '';
    
    if (images.length === 0) {
        noImagesMsg.style.display = 'block';
        return;
    }
    
    noImagesMsg.style.display = 'none';
    
    images.forEach((img, index) => {
        const div = document.createElement('div');
        div.className = 'image-item';
        
        const image = document.createElement('img');
        image.src = img.data;
        image.alt = `Billede ${index + 1}`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '🗑️ Slet';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteImage(index);
        };
        
        div.appendChild(image);
        div.appendChild(deleteBtn);
        
        div.onclick = () => openModal(index);
        
        gallery.appendChild(div);
    });
}

// Delete image
function deleteImage(index) {
    if (confirm('Er du sikker på at du vil slette dette billede?')) {
        images.splice(index, 1);
        saveImages();
        displayImages();
    }
}

// Open modal with fullscreen image
function openModal(index) {
    currentImageIndex = index;
    modalImg.src = images[index].data;
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
}

// Navigate to previous image
function showPreviousImage() {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    modalImg.src = images[currentImageIndex].data;
}

// Navigate to next image
function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    modalImg.src = images[currentImageIndex].data;
}

// Event listeners
modalClose.onclick = closeModal;
modalPrev.onclick = (e) => {
    e.stopPropagation();
    showPreviousImage();
};
modalNext.onclick = (e) => {
    e.stopPropagation();
    showNextImage();
};

modal.onclick = (e) => {
    if (e.target === modal) {
        closeModal();
    }
};

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') showPreviousImage();
    if (e.key === 'ArrowRight') showNextImage();
});

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
