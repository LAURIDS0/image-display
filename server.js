const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Storage file
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

// Add new images
app.post('/api/images', (req, res) => {
    try {
        const newImages = req.body;
        const existingImages = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
        const allImages = [...existingImages, ...newImages];
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(allImages));
        res.json({ success: true, count: allImages.length });
    } catch (error) {
        console.error('Error saving images:', error);
        res.status(500).json({ error: 'Failed to save images' });
    }
});

// Update all images (for admin to delete specific ones)
app.put('/api/images/update', (req, res) => {
    try {
        const updatedImages = req.body;
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
