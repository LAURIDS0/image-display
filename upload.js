const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const previewContainer = document.getElementById('preview-container');
const previewGrid = document.getElementById('preview-grid');
const uploadBtn = document.getElementById('upload-btn');
const successMessage = document.getElementById('success-message');

// API URL
const API_URL = window.location.origin;

let selectedFiles = [];

// Click to select files
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

// Handle selected files
function handleFiles(files) {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        alert('Vælg venligst billedfiler');
        return;
    }

    selectedFiles = [...selectedFiles, ...imageFiles];
    displayPreviews();
}

// Display file previews
function displayPreviews() {
    previewGrid.innerHTML = '';
    
    if (selectedFiles.length === 0) {
        previewContainer.style.display = 'none';
        return;
    }

    previewContainer.style.display = 'block';
    successMessage.classList.remove('show');

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-preview';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => removeFile(index);
            
            div.appendChild(img);
            div.appendChild(removeBtn);
            previewGrid.appendChild(div);
        };
        
        reader.readAsDataURL(file);
    });
}

// Remove file from selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    displayPreviews();
}

// Upload button click
uploadBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploader...';
    
    // Read all files and store them
    const promises = selectedFiles.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    data: e.target.result,
                    name: file.name,
                    timestamp: new Date().toISOString()
                });
            };
            reader.readAsDataURL(file);
        });
    });

    try {
        const imageData = await Promise.all(promises);
        
        // Send to server
        const response = await fetch(`${API_URL}/api/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(imageData)
        });
        
        if (response.ok) {
            // Show success message
            successMessage.textContent = '✓ Billeder uploadet! De vises nu på displayet.';
            successMessage.classList.add('show');
            uploadBtn.textContent = 'Upload Billeder';
            uploadBtn.disabled = false;
            
            // Clear selection
            selectedFiles = [];
            fileInput.value = '';
            displayPreviews();
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 3000);
        } else {
            alert('Upload fejlede. Prøv igen.');
            uploadBtn.textContent = 'Upload Billeder';
            uploadBtn.disabled = false;
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload fejlede. Prøv igen.');
        uploadBtn.textContent = 'Upload Billeder';
        uploadBtn.disabled = false;
    }
});
