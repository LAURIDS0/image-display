// API URL
const API_URL = window.location.origin;

// Get elements
const gallery = document.getElementById('gallery');
const loading = document.getElementById('loading');
const noImagesMsg = document.getElementById('no-images');
const statsEl = document.getElementById('stats');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalClose = document.getElementById('modal-close');

let images = [];

// Load images from server
async function loadImages() {
    try {
        loading.style.display = 'block';
        gallery.innerHTML = '';
        noImagesMsg.style.display = 'none';
        
        const response = await fetch(`${API_URL}/api/images?t=${Date.now()}`, {
            cache: 'no-store'
        });
        
        if (response.ok) {
            images = await response.json();
            displayImages();
        } else {
            console.error('Failed to load images');
            images = [];
            displayImages();
        }
    } catch (error) {
        console.error('Error loading images:', error);
        images = [];
        displayImages();
    } finally {
        loading.style.display = 'none';
    }
}

// Display images in gallery
function displayImages() {
    gallery.innerHTML = '';
    
    // Update stats
    statsEl.textContent = `📊 ${images.length} billede${images.length !== 1 ? 'r' : ''} i alt`;
    
    if (images.length === 0) {
        noImagesMsg.style.display = 'block';
        return;
    }
    
    noImagesMsg.style.display = 'none';
    
    images.forEach((img, index) => {
        const card = document.createElement('div');
        card.className = 'image-card';
        
        const image = document.createElement('img');
        image.src = API_URL + img.url;
        image.alt = img.name || `Billede ${index + 1}`;
        image.onclick = () => openModal(API_URL + img.url);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteImage(index);
        };
        
        const info = document.createElement('div');
        info.className = 'image-info';
        
        const name = document.createElement('div');
        name.className = 'image-name';
        name.textContent = img.name || `Billede ${index + 1}`;
        
        const date = document.createElement('div');
        date.className = 'image-date';
        if (img.timestamp) {
            const d = new Date(img.timestamp);
            date.textContent = d.toLocaleString('da-DK');
        }
        
        info.appendChild(name);
        if (img.timestamp) info.appendChild(date);
        
        card.appendChild(image);
        card.appendChild(deleteBtn);
        card.appendChild(info);
        
        gallery.appendChild(card);
    });
}

// Delete single image
async function deleteImage(index) {
    const img = images[index];
    const confirmMsg = `Slet dette billede?\n${img.name || 'Billede ' + (index + 1)}`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
        // Remove from array
        images.splice(index, 1);
        
        // Update server
        const response = await fetch(`${API_URL}/api/images/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(images)
        });
        
        if (response.ok) {
            displayImages();
        } else {
            alert('Kunne ikke slette billedet. Prøv igen.');
            loadImages(); // Reload to get correct state
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        alert('Kunne ikke slette billedet. Prøv igen.');
        loadImages();
    }
}

// Delete all images
async function deleteAllImages() {
    if (!confirm(`⚠️ Er du SIKKER på du vil slette ALLE ${images.length} billeder?\n\nDette kan ikke fortrydes!`)) {
        return;
    }
    
    if (!confirm('Sidste advarsel! Slet alle billeder?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/images`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            images = [];
            displayImages();
            alert('✓ Alle billeder er slettet');
        } else {
            alert('Kunne ikke slette billeder. Prøv igen.');
        }
    } catch (error) {
        console.error('Error deleting all images:', error);
        alert('Kunne ikke slette billeder. Prøv igen.');
    }
}

// Open modal with fullscreen image
function openModal(imageSrc) {
    modalImg.src = imageSrc;
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
}

// Event listeners
modalClose.onclick = closeModal;
modal.onclick = (e) => {
    if (e.target === modal) {
        closeModal();
    }
};

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Initialize
loadImages();
