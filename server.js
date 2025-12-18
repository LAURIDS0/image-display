const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));
app.use('/uploads', express.static(UPLOADS_DIR));

// Storage file for image metadata
const STORAGE_FILE = path.join(__dirname, 'images.json');

// Initialize storage file if it doesn't exist
if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify([]));
}

// Get all images
app.get('/api/images', (req, res) => {
    try {
        const images = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
        res.json(images);
    } catch (error) {
        console.error('Error reading images:', error);
        res.status(500).json({ error: 'Failed to read images' });
    }
});

// Upload new images
app.post('/api/images/upload', upload.array('images', 50), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        // Read existing images
        const existingImages = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
        
        // Create metadata for new images
        const newImages = req.files.map(file => ({
            name: file.originalname,
            filename: file.filename,
            url: `/uploads/${file.filename}`,
            timestamp: new Date().toISOString()
        }));

        // Combine and save
        const allImages = [...existingImages, ...newImages];
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(allImages));
        
        console.log(`Uploaded ${newImages.length} images. Total: ${allImages.length}`);
        res.json({ success: true, count: allImages.length, uploaded: newImages.length });
    } catch (error) {
        console.error('Error saving images:', error);
        res.status(500).json({ error: 'Failed to save images' });
    }
});

// Update all images (for admin to delete specific ones)
app.put('/api/images/update', (req, res) => {
    try {
        const currentImages = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
        const updatedImages = req.body;
        
        // Find deleted images and remove their files
        const deletedImages = currentImages.filter(current => 
            !updatedImages.some(updated => updated.filename === current.filename)
        );
        
        deletedImages.forEach(img => {
            const filePath = path.join(UPLOADS_DIR, img.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Deleted file: ${img.filename}`);
            }
        });
        
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(updatedImages));
        res.json({ success: true, count: updatedImages.length });
    } catch (error) {
        console.error('Error updating images:', error);
        res.status(500).json({ error: 'Failed to update images' });
    }
});

// Delete all images
app.delete('/api/images', (req, res) => {
    try {
        // Read current images
        const images = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
        
        // Delete all image files
        images.forEach(img => {
            const filePath = path.join(UPLOADS_DIR, img.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
        
        fs.writeFileSync(STORAGE_FILE, JSON.stringify([]));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting images:', error);
        res.status(500).json({ error: 'Failed to delete images' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
