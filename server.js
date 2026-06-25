const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // For handling JSON bodies in PUT/POST (non-multipart)
app.use(express.static('public')); // Serve the vanilla frontend
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Set up Multer for handling multipart/form-data
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Redirect root to dashboard (or mobile)
app.get('/', (req, res) => {
    res.redirect('/dashboard/index.html');
});

// API Endpoints
app.post('/api/upload', upload.single('image'), (req, res) => {
    const { lat, lng, message, name } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    db.run(
        `INSERT INTO markers (lat, lng, message, image_url, name) VALUES (?, ?, ?, ?, ?)`,
        [lat, lng, message, imageUrl, name || 'New Observation'],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.get('/api/markers', (req, res) => {
    db.all(`SELECT * FROM markers ORDER BY timestamp DESC`, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

app.put('/api/markers/:id', (req, res) => {
    const { name, message } = req.body;
    db.run(`UPDATE markers SET name = ?, message = ? WHERE id = ?`, [name, message, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
    });
});

app.delete('/api/markers/:id', (req, res) => {
    db.run(`DELETE FROM markers WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
