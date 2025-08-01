const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/login');
}

// Image upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Show all blogs
router.get('/', async (req, res) => {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.render('blogs', { blogs });
});

// Show blog creation form
router.get('/new', isAuthenticated, (req, res) => {
    res.render('new');
});

// Handle blog creation with image upload
router.post('/', isAuthenticated, upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : '';
    await Blog.create({ title, content, image });
    res.redirect('/blogs');
});

// Handle blog delete
router.post('/:id/delete', isAuthenticated, async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    
    if (blog.image) {
        const imgPath = path.join(__dirname, '..', 'public', blog.image);
        fs.unlink(imgPath, err => {
            if (err && err.code !== 'ENOENT') {
                console.error('Failed to delete image:', err);
            }
        });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/blogs');
});

module.exports = router;