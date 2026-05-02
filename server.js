require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');

// Email Transporter Config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const app = express();
const PORT = process.env.PORT || 8000;
const db = new sqlite3.Database('./database.sqlite');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Clean URLs Routing
app.use((req, res, next) => {
    if (req.path.indexOf('.') === -1) {
        let file = req.path;
        if (file === '/') {
            res.sendFile(path.join(__dirname, 'index.html'));
            return;
        }
        
        // Custom mappings
        const mappings = {
            '/admin': 'admin_s_66_66.html',
            '/contacts': 'contact.html',
            '/about': 'about-us.html',
            '/products': 'all-products.html',
            '/installation': 'installation-services.html',
            '/air-conditioning': 'air-conditioners.html',
            '/gates': 'automatic-gates.html',
            '/intercom': 'intercom-systems.html',
            '/cctv': 'cctv-systems.html'
        };
        
        const targetFile = mappings[file] || (file.slice(1) + '.html');
        const filePath = path.join(__dirname, targetFile);
        
        if (require('fs').existsSync(filePath)) {
            res.sendFile(filePath);
            return;
        }
    }
    next();
});

app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });
const uploadProduct = multer({ storage: storage }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
]);

// Database setup
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT, category TEXT, price REAL, oldPrice REAL, rating REAL, reviews INTEGER, 
        badge TEXT, image_url TEXT, gallery_urls TEXT, tag1 TEXT, tag2 TEXT, tag3 TEXT, 
        description TEXT, long_description TEXT, specifications TEXT, 
        installation_info TEXT, stock_count INTEGER DEFAULT 15, units_sold INTEGER DEFAULT 234
    )`);
    // Auto-migrate: add gallery_urls to existing installs silently
    db.run(`ALTER TABLE products ADD COLUMN gallery_urls TEXT`, () => {});

    db.run(`CREATE TABLE IF NOT EXISTS spare_parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT, category TEXT, compatibility TEXT, 
        price REAL, image_url TEXT, gallery_urls TEXT, stock_count INTEGER DEFAULT 0
    )`);
    // Auto-migrate: add gallery_urls to existing installs silently
    db.run(`ALTER TABLE spare_parts ADD COLUMN gallery_urls TEXT`, () => {});

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT, email TEXT UNIQUE, password TEXT, phone TEXT, 
        is_verified INTEGER DEFAULT 0, verification_code TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER, user_name TEXT, rating REAL, comment TEXT, reply TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS search_hints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        video_url TEXT,
        likes INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS project_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        user_name TEXT,
        user_email TEXT,
        comment TEXT,
        parent_id INTEGER DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT,
        project_id INTEGER,
        activity_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS team (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        role TEXT,
        image_url TEXT,
        experience INTEGER,
        specialization TEXT,
        bio TEXT,
        rating REAL DEFAULT 5.0,
        reviews_count INTEGER DEFAULT 0,
        linkedin_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS admin_config (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);

    // Seed default admin password
    db.get("SELECT value FROM admin_config WHERE key = 'admin_password'", (err, row) => {
        if (!row) {
            db.run("INSERT INTO admin_config (key, value) VALUES ('admin_password', 'saycomm66')");
        }
    });

    // Migration for existing tables
    db.run("ALTER TABLE users ADD COLUMN cart TEXT DEFAULT '[]'", (err) => {});
    db.run("ALTER TABLE users ADD COLUMN wishlist TEXT DEFAULT '[]'", (err) => {});
    db.run("ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'ru'", (err) => {});
    db.run("ALTER TABLE user_activity ADD COLUMN user_email TEXT", (err) => {});
    db.run("ALTER TABLE project_comments ADD COLUMN user_email TEXT", (err) => {});
});

// Admin OTP storage (temp)
const adminOTPs = new Map();

// --- VIP CLUB APIs ---
app.post('/api/vip/subscribe', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    db.run("INSERT INTO subscribers (email) VALUES (?)", [email], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: "You are already a VIP member!" });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "success", id: this.lastID });
    });
});

app.get('/api/vip/subscribers', (req, res) => {
    db.all("SELECT * FROM subscribers ORDER BY subscribed_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/vip/broadcast', async (req, res) => {
    const { subject, message } = req.body;
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({ error: "Email credentials are not configured in .env file" });
    }

    db.all("SELECT email FROM subscribers", [], async (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (rows.length === 0) {
            return res.json({ message: "No subscribers found", recipientCount: 0 });
        }

        let sentCount = 0;
        let errors = [];

        for (const subscriber of rows) {
            try {
                await transporter.sendMail({
                    from: `"SAYCOM VIP CLUB" <${process.env.EMAIL_USER}>`,
                    to: subscriber.email,
                    subject: subject || "SAYCOM VIP Club Update",
                    html: message
                });
                sentCount++;
            } catch (mailErr) {
                console.error(`Failed to send to ${subscriber.email}:`, mailErr);
                errors.push(subscriber.email);
            }
        }

        res.json({ 
            message: "success", 
            recipientCount: rows.length, 
            sentCount,
            failedCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
        });
    });
});

// --- FAQ APIs ---
app.get('/api/faqs', (req, res) => {
    db.all("SELECT * FROM faqs ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/faqs', (req, res) => {
    const { question, answer } = req.body;
    db.run("INSERT INTO faqs (question, answer) VALUES (?, ?)", [question, answer], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, question, answer });
    });
});

app.put('/api/faqs/:id', (req, res) => {
    const { question, answer } = req.body;
    db.run("UPDATE faqs SET question = ?, answer = ? WHERE id = ?", [question, answer, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'updated', changes: this.changes });
    });
});

// Projects API with Upload support
app.get('/api/projects', (req, res) => {
    db.all("SELECT * FROM projects", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/projects', upload.single('video'), (req, res) => {
    const { title, description } = req.body;
    const video_url = req.file ? `/uploads/${req.file.filename}` : req.body.video_url;
    
    db.run("INSERT INTO projects (title, description, video_url, likes, shares, saves, comments_count) VALUES (?, ?, ?, 0, 0, 0, 0)", 
        [title, description, video_url], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'success' });
        });
});

// New Interaction APIs
app.post('/api/projects/:id/interaction', (req, res) => {
    const { type, email } = req.body; // type: 'likes', 'shares', 'saves'
    const id = req.params.id;
    
    if (!email) return res.status(401).json({ error: "Authentication required" });
    if (!['likes', 'shares', 'saves'].includes(type)) return res.status(400).json({ error: "Invalid type" });

    const activityType = type.slice(0, -1); // 'like', 'share', 'save'
    
    // Check if user already interacted
    db.get("SELECT id FROM user_activity WHERE user_email = ? AND project_id = ? AND activity_type = ?", 
        [email, id, activityType], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (row) {
                // Already exists -> Toggle OFF (Unlike/Unsave/Unshare)
                db.run(`UPDATE projects SET ${type} = MAX(0, ${type} - 1) WHERE id = ?`, [id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    db.run("DELETE FROM user_activity WHERE id = ?", [row.id], (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ message: "removed", type: activityType });
                    });
                });
            } else {
                // Doesn't exist -> Toggle ON
                db.run(`UPDATE projects SET ${type} = ${type} + 1 WHERE id = ?`, [id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    db.run("INSERT INTO user_activity (user_email, project_id, activity_type) VALUES (?, ?, ?)", 
                        [email, id, activityType], function(err) {
                            if (err) return res.status(500).json({ error: err.message });
                            res.json({ message: "added", type: activityType });
                        });
                });
            }
        });
});

app.get('/api/projects/:id/comments', (req, res) => {
    db.all("SELECT * FROM project_comments WHERE project_id = ? ORDER BY created_at DESC", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/projects/:id/comments', (req, res) => {
    const { user_name, comment, parent_id } = req.body;
    const id = req.params.id;
    
    db.run("INSERT INTO project_comments (project_id, user_name, comment, parent_id) VALUES (?, ?, ?, ?)", [id, user_name, comment, parent_id || null], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run("UPDATE projects SET comments_count = comments_count + 1 WHERE id = ?", [id]);
        res.json({ message: "success" });
    });
});

app.put('/api/projects/:id', upload.single('video'), (req, res) => {
    const { title, description } = req.body;
    let sql = "UPDATE projects SET title = ?, description = ? WHERE id = ?";
    let params = [title, description, req.params.id];

    if (req.file) {
        sql = "UPDATE projects SET title = ?, description = ?, video_url = ? WHERE id = ?";
        params = [title, description, `/uploads/${req.file.filename}`, req.params.id];
    }

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "success" });
    });
});

app.delete('/api/projects/:id', (req, res) => {
    db.run("DELETE FROM projects WHERE id = ?", req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted successfully" });
    });
});

// --- INSTALLATIONS APIs ---
app.get('/api/installations', (req, res) => {
    db.all("SELECT key, value FROM admin_config WHERE key LIKE 'install_%'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const config = {};
        rows.forEach(r => {
            try { config[r.key] = JSON.parse(r.value); } catch(e) { config[r.key] = {}; }
        });
        res.json({ data: config });
    });
});

app.put('/api/installations/:key', (req, res) => {
    const key = `install_${req.params.key}`;
    const value = JSON.stringify(req.body);
    db.run("INSERT INTO admin_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", [key, value], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "success" });
    });
});

app.delete('/api/faqs/:id', (req, res) => {
    db.run("DELETE FROM faqs WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// --- PRODUCT APIs ---
app.get('/api/products', (req, res) => {
    const category = req.query.category;
    
    // If specifically asking for Spare Parts, only return from spare_parts table
    if (category === 'Spare Parts') {
        db.all("SELECT * FROM spare_parts", [], (err, spares) => {
            if (err) return res.status(500).json({ error: err.message });
            const formattedSpares = spares.map(s => ({
                ...s,
                is_spare: true,
                category: 'Spare Parts',
                badge: 'Запчасть',
                rating: 5.0,
                reviews: 0,
                oldPrice: null,
                tag1: 'Оригинал',
                tag2: s.compatibility,
                tag3: 'В наличии'
            }));
            return res.json({ message: "success", data: formattedSpares });
        });
        return;
    }

    // Fetch regular products
    let sql1 = "SELECT * FROM products";
    let params1 = [];
    if (category && category !== 'All Products') {
        sql1 += " WHERE category = ?";
        params1.push(category);
    }

    db.all(sql1, params1, (err, products) => {
        if (err) return res.status(500).json({ error: err.message });

        // Fetch spare parts and include them if category matches or no category selected
        let sql2 = "SELECT * FROM spare_parts";
        let params2 = [];
        if (category && category !== 'All Products') {
            sql2 += " WHERE category = ?";
            params2.push(category);
        }

        db.all(sql2, params2, (err, spares) => {
            if (err) return res.status(500).json({ error: err.message });

            // Format spares to match product structure
            const formattedSpares = spares.map(s => ({
                ...s,
                is_spare: true,
                category: 'Spare Parts',
                badge: 'Запчасть',
                rating: 5.0,
                reviews: 0,
                oldPrice: null,
                tag1: 'Оригинал',
                tag2: s.compatibility,
                tag3: 'В наличии'
            }));

            const allProducts = [...products, ...formattedSpares];
            res.json({ message: "success", data: allProducts });
        });
    });
});

app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    // First check regular products
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
        if (err) return res.status(500).json({ error: err.message });
        if (product) {
            return res.json({ data: product });
        }
        // If not found, check spare_parts
        db.get('SELECT * FROM spare_parts WHERE id = ?', [id], (err, spare) => {
            if (err) return res.status(500).json({ error: err.message });
            if (spare) {
                // Format spare to match product structure
                const formatted = {
                    ...spare,
                    is_spare: true,
                    category: 'Spare Parts',
                    badge: 'Запчасть',
                    rating: 5.0,
                    reviews: 0,
                    oldPrice: null,
                    tag1: 'Оригинал',
                    tag2: spare.compatibility,
                    tag3: 'В наличии',
                    description: spare.compatibility, // Simple fallback
                    long_description: `Это запасная часть высокого качества. Совместимость: ${spare.compatibility}`,
                    specifications: JSON.stringify([{k: "Совместимость", v: spare.compatibility}])
                };
                return res.json({ data: formatted });
            }
            res.status(404).json({ error: "Product not found" });
        });
    });
});

app.post('/api/products', uploadProduct, (req, res) => {
    const p = req.body;
    console.log("Adding product:", p);
    const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
    const galleryFiles = req.files && req.files['gallery'] ? req.files['gallery'] : [];
    const imageUrl = imageFile ? `uploads/${imageFile.filename}` : 'uploads/placeholder.png';
    const galleryUrls = galleryFiles.map(f => `uploads/${f.filename}`).join(';');
    const sql = `INSERT INTO products (title, category, price, oldPrice, rating, reviews, badge, image_url, gallery_urls, tag1, tag2, tag3, description, long_description, specifications, installation_info, stock_count, units_sold) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const params = [p.title || null, p.category || null, p.price || null, p.oldPrice || null, 0, 0, p.badge || null, imageUrl, galleryUrls || null, p.tag1 || null, p.tag2 || null, p.tag3 || null, p.description || null, p.long_description || null, p.specifications || null, p.installation_info || null, p.stock_count || 15, p.units_sold || 234];
    db.run(sql, params, function(err) {
        if (err) {
            console.error("Error adding product:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "success", id: this.lastID });
    });
});

app.put('/api/products/:id', uploadProduct, (req, res) => {
    const p = req.body;
    console.log("Updating product:", req.params.id, p);
    const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
    const galleryFiles = req.files && req.files['gallery'] ? req.files['gallery'] : [];
    let sql = `UPDATE products SET title=?, category=?, price=?, oldPrice=?, badge=?, tag1=?, tag2=?, tag3=?, description=?, long_description=?, specifications=?, installation_info=?, stock_count=?, units_sold=?`;
    let params = [p.title, p.category, p.price, p.oldPrice, p.badge, p.tag1, p.tag2, p.tag3, p.description, p.long_description, p.specifications, p.installation_info, p.stock_count, p.units_sold];
    
    if (imageFile) {
        sql += `, image_url=?`;
        params.push(`uploads/${imageFile.filename}`);
    }
    if (galleryFiles.length > 0) {
        // Append to existing gallery if gallery_append flag is set
        const newGalleryUrls = galleryFiles.map(f => `uploads/${f.filename}`).join(';');
        if (p.gallery_append === 'true') {
            // Get existing gallery first, then append
            db.get('SELECT gallery_urls FROM products WHERE id=?', req.params.id, (err, row) => {
                const existing = row && row.gallery_urls ? row.gallery_urls : '';
                const combined = [existing, newGalleryUrls].filter(Boolean).join(';');
                sql += `, gallery_urls=?`;
                params.push(combined);
                sql += ` WHERE id=?`;
                params.push(req.params.id);
                db.run(sql, params, function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "success" });
                });
            });
            return;
        } else {
            sql += `, gallery_urls=?`;
            params.push(newGalleryUrls);
        }
    }
    
    sql += ` WHERE id=?`;
    params.push(req.params.id);
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error("Error updating product:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "success" });
    });
});

app.delete('/api/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "deleted" });
    });
});

app.delete('/api/products/bulk/delete', (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "Invalid IDs" });
    const placeholders = ids.map(() => '?').join(',');
    db.run(`DELETE FROM products WHERE id IN (${placeholders})`, ids, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "bulk deleted", count: this.changes });
    });
});

app.delete('/api/products-all/delete', (req, res) => {
    db.run('DELETE FROM products', function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "all deleted", count: this.changes });
    });
});

// --- SPARE PARTS APIs ---
app.get('/api/spare-parts', (req, res) => {
    db.all("SELECT * FROM spare_parts", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/spare-parts', uploadProduct, (req, res) => {
    const p = req.body;
    const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
    const galleryFiles = req.files && req.files['gallery'] ? req.files['gallery'] : [];
    const imageUrl = imageFile ? `uploads/${imageFile.filename}` : 'uploads/parts-placeholder.png';
    const galleryUrls = galleryFiles.map(f => `uploads/${f.filename}`).join(';');
    const price = parseFloat(p.price) || 0;
    const stock = parseInt(p.stock_count) || 0;
    const sql = `INSERT INTO spare_parts (title, category, compatibility, price, image_url, gallery_urls, stock_count) VALUES (?,?,?,?,?,?,?)`;
    db.run(sql, [p.title, p.category, p.compatibility, price, imageUrl, galleryUrls || null, stock], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "success", id: this.lastID });
    });
});

app.put('/api/spare-parts/:id', uploadProduct, (req, res) => {
    const p = req.body;
    const imageFile = req.files && req.files['image'] ? req.files['image'][0] : null;
    const galleryFiles = req.files && req.files['gallery'] ? req.files['gallery'] : [];
    let sql = `UPDATE spare_parts SET title=?, category=?, compatibility=?, price=?, stock_count=?`;
    let params = [p.title, p.category, p.compatibility, p.price, p.stock_count];
    if (imageFile) {
        sql += `, image_url=?`;
        params.push(`uploads/${imageFile.filename}`);
    }
    if (galleryFiles.length > 0) {
        const newGalleryUrls = galleryFiles.map(f => `uploads/${f.filename}`).join(';');
        if (p.gallery_append === 'true') {
            db.get('SELECT gallery_urls FROM spare_parts WHERE id=?', req.params.id, (err, row) => {
                const existing = row && row.gallery_urls ? row.gallery_urls : '';
                const combined = [existing, newGalleryUrls].filter(Boolean).join(';');
                sql += `, gallery_urls=?`;
                params.push(combined);
                sql += ` WHERE id=?`;
                params.push(req.params.id);
                db.run(sql, params, function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "success" });
                });
            });
            return;
        } else {
            sql += `, gallery_urls=?`;
            params.push(newGalleryUrls);
        }
    }
    sql += ` WHERE id=?`;
    params.push(req.params.id);
    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "success" });
    });
});

app.delete('/api/spare-parts/:id', (req, res) => {
    db.run('DELETE FROM spare_parts WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "deleted" });
    });
});

app.delete('/api/spare-parts/bulk/delete', (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "Invalid IDs" });
    const placeholders = ids.map(() => '?').join(',');
    db.run(`DELETE FROM spare_parts WHERE id IN (${placeholders})`, ids, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "bulk deleted", count: this.changes });
    });
});

app.delete('/api/spare-parts-all/delete', (req, res) => {
    db.run('DELETE FROM spare_parts', function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "all deleted", count: this.changes });
    });
});

// --- REVIEWS APIs ---
app.get('/api/reviews/:product_id', (req, res) => {
    db.all('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [req.params.product_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/reviews', (req, res) => {
    const { product_id, user_name, rating, comment } = req.body;
    db.run(
        'INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)',
        [product_id, user_name, rating, comment],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Re-calculate average rating for the product
            db.get('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id = ?', [product_id], (err, stats) => {
                if (!err && stats) {
                    db.run('UPDATE products SET rating = ?, reviews = ? WHERE id = ?', [stats.avg, stats.count, product_id]);
                }
            });

            res.json({ message: "success", id: this.lastID });
        }
    );
});

app.put('/api/reviews/:id/reply', (req, res) => {
    const { reply } = req.body;
    db.run('UPDATE reviews SET reply = ? WHERE id = ?', [reply, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "reply added" });
    });
});

app.delete('/api/reviews/:id', (req, res) => {
    db.run('DELETE FROM reviews WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "deleted" });
    });
});

// --- AUTH & ADMIN ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid email or password" });
        
        if (row.is_verified === 0) {
            return res.status(403).json({ error: "Please verify your email", email: row.email });
        }

        // Parse persistent data
        row.cart = JSON.parse(row.cart || '[]');
        row.wishlist = JSON.parse(row.wishlist || '[]');

        res.json({ message: "success", data: row });
    });
});

app.post('/api/register', async (req, res) => {
    const { full_name, email, password } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    db.run("INSERT INTO users (full_name, email, password, verification_code) VALUES (?, ?, ?, ?)",
        [full_name, email, password, code], async function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: "Email already exists" });
                return res.status(500).json({ error: err.message });
            }

            // Send Verification Email
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                try {
                    await transporter.sendMail({
                        from: `"SAYCOM Support" <${process.env.EMAIL_USER}>`,
                        to: email,
                        subject: "Your Verification Code",
                        html: `<h2>Welcome to SAYCOM!</h2><p>Your verification code is: <b>${code}</b></p>`
                    });
                } catch (mailErr) {
                    console.error("Mail send error:", mailErr);
                }
            }

            res.json({ message: "success", email });
        });
});

app.post('/api/verify', (req, res) => {
    const { email, code } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND verification_code = ?", [email, code], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(400).json({ error: "Invalid code" });

        db.run("UPDATE users SET is_verified = 1 WHERE id = ?", [row.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Parse persistent data
            row.cart = JSON.parse(row.cart || '[]');
            row.wishlist = JSON.parse(row.wishlist || '[]');

            res.json({ message: "verified", data: row });
        });
    });
});

app.get('/api/admin/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => res.json({ data: rows }));
});

// --- ADMIN SECURITY APIs ---
app.post('/api/admin/check-password', (req, res) => {
    const { password } = req.body;
    db.get("SELECT value FROM admin_config WHERE key = 'admin_password'", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row && row.value === password) {
            res.json({ message: "success" });
        } else {
            res.status(401).json({ error: "Incorrect password" });
        }
    });
});

app.post('/api/admin/send-otp', async (req, res) => {
    const otp = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digits
    const targetEmail = 'saycomcompaniy@gmail.com';
    
    adminOTPs.set(targetEmail, { otp, expires: Date.now() + 600000 }); // 10 min

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            await transporter.sendMail({
                from: `"SAYCOM Security" <${process.env.EMAIL_USER}>`,
                to: targetEmail,
                subject: "Admin Password Change Verification Code",
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background: #060B15; border-radius: 15px;">
                        <h2 style="color: #10B981;">Admin Security Alert</h2>
                        <p style="color: #94A3B8;">A request was made to change the admin panel password.</p>
                        <div style="background: rgba(16, 185, 129, 0.1); padding: 30px; border-radius: 12px; text-align: center; margin: 25px 0; border: 1px solid rgba(16, 185, 129, 0.2);">
                            <span style="font-size: 36px; font-weight: 800; color: #10B981; letter-spacing: 8px;">${otp}</span>
                        </div>
                        <p style="color: #64748B; font-size: 13px;">If you did not request this, please secure your admin panel immediately.</p>
                    </div>
                `
            });
            res.json({ message: "OTP sent" });
        } catch (err) {
            console.error("OTP send failed:", err);
            res.status(500).json({ error: "Failed to send email" });
        }
    } else {
        console.log(`[DEV] Admin OTP: ${otp}`);
        res.json({ message: "OTP logged in terminal (Dev Mode)" });
    }
});

app.post('/api/admin/update-password', (req, res) => {
    const { oldPassword, newPassword, otp } = req.body;
    const targetEmail = 'saycomcompaniy@gmail.com';

    const stored = adminOTPs.get(targetEmail);
    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    db.get("SELECT value FROM admin_config WHERE key = 'admin_password'", (err, row) => {
        if (row.value !== oldPassword) return res.status(401).json({ error: "Old password incorrect" });

        db.run("UPDATE admin_config SET value = ? WHERE key = 'admin_password'", [newPassword], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            adminOTPs.delete(targetEmail);
            res.json({ message: "Password updated successfully" });
        });
    });
});

// Search Hints API
app.get('/api/search-hints', (req, res) => {
    db.all("SELECT * FROM search_hints ORDER BY RANDOM() LIMIT 10", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.get('/api/search-hints-all', (req, res) => {
    db.all("SELECT * FROM search_hints ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/search-hints', (req, res) => {
    const { text, category } = req.body;
    db.run("INSERT INTO search_hints (text, category) VALUES (?, ?)", [text, category], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, text, category });
    });
});

app.put('/api/search-hints/:id', (req, res) => {
    const { text, category } = req.body;
    db.run("UPDATE search_hints SET text = ?, category = ? WHERE id = ?", [text, category, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

app.delete('/api/search-hints/:id', (req, res) => {
    db.run("DELETE FROM search_hints WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

app.get('/api/brands', (req, res) => {
    db.all("SELECT * FROM brands", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Start Server
app.post('/api/user/sync', (req, res) => {
    const { email, cart, wishlist, language } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Ensure language is provided, fallback to existing or 'ru' if undefined here but typically we pass it
    let query = "UPDATE users SET cart = ?, wishlist = ? WHERE email = ?";
    let params = [JSON.stringify(cart || []), JSON.stringify(wishlist || []), email];
    
    if (language !== undefined) {
        query = "UPDATE users SET cart = ?, wishlist = ?, language = ? WHERE email = ?";
        params = [JSON.stringify(cart || []), JSON.stringify(wishlist || []), language, email];
    }

    db.run(query, params, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "synced" });
        }
    );
});

app.get('/api/team', (req, res) => {
    db.all("SELECT * FROM team ORDER BY created_at ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/team', upload.single('image'), (req, res) => {
    const { name, role, experience, specialization, bio, linkedin_url } = req.body;
    const image_url = req.file ? `uploads/${req.file.filename}` : 'uploads/placeholder.png';

    db.run(
        "INSERT INTO team (name, role, image_url, experience, specialization, bio, linkedin_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, role, image_url, experience, specialization, bio, linkedin_url],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "success", id: this.lastID });
        }
    );
});

app.put('/api/team/:id', upload.single('image'), (req, res) => {
    const { name, role, experience, specialization, bio, linkedin_url } = req.body;
    let query = "UPDATE team SET name = ?, role = ?, experience = ?, specialization = ?, bio = ?, linkedin_url = ? WHERE id = ?";
    let params = [name, role, experience, specialization, bio, linkedin_url, req.params.id];

    if (req.file) {
        query = "UPDATE team SET name = ?, role = ?, image_url = ?, experience = ?, specialization = ?, bio = ?, linkedin_url = ? WHERE id = ?";
        params = [name, role, `uploads/${req.file.filename}`, experience, specialization, bio, linkedin_url, req.params.id];
    }

    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "updated" });
    });
});

app.delete('/api/team/:id', (req, res) => {
    db.run("DELETE FROM team WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "deleted" });
    });
});

// --- USER ACTIVITY & ACCOUNT MANAGEMENT ---
app.get('/api/user/:email/activity-stats', (req, res) => {
    const email = req.params.email;
    db.all("SELECT activity_type, COUNT(*) as count FROM user_activity WHERE user_email = ? GROUP BY activity_type", [email], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const stats = {
            likes: 0,
            saves: 0,
            shares: 0
        };
        
        rows.forEach(row => {
            if (row.activity_type === 'like') stats.likes = row.count;
            if (row.activity_type === 'save') stats.saves = row.count;
            if (row.activity_type === 'share') stats.shares = row.count;
        });
        
        res.json({ data: stats });
    });
});

app.post('/api/send-delete-otp', async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    db.run("UPDATE users SET verification_code = ? WHERE email = ?", [code, email], async (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await transporter.sendMail({
                    from: `"SAYCOM Security" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: "Confirmation Code - SAYCOM",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #EF4444;">Warning: Account Deletion</h2>
                            <p>You requested to delete your SAYCOM profile. If this was not you, ignore this email.</p>
                            <div style="background: #F1F5F9; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">${code}</span>
                            </div>
                            <p>Use this code to confirm deletion. It will expire soon.</p>
                        </div>
                    `
                });
                return res.json({ message: "code sent" });
            } catch (mailErr) {
                console.error("Mail send error:", mailErr);
                return res.status(500).json({ error: "Ошибка почтового сервера: " + mailErr.message });
            }
        } else {
            console.log("!!! OTP FOR DELETE !!! Email: " + email + " Code: " + code);
            return res.status(500).json({ error: "Email server not configured. Check terminal logs." });
        }
    });
});

app.delete('/api/delete-profile', (req, res) => {
    const { email, code } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND verification_code = ?", [email, code], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(400).json({ error: "Invalid verification code" });
        
        db.run("DELETE FROM users WHERE id = ?", [row.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Clean up activity and comments
            db.run("DELETE FROM user_activity WHERE user_email = ?", [email]);
            db.run("DELETE FROM project_comments WHERE user_email = ?", [email]);

            res.json({ message: "deleted" });
        });
    });
});

app.get('/api/user/:email/activity', (req, res) => {
    db.all("SELECT project_id, activity_type FROM user_activity WHERE user_email = ?", [req.params.email], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 SAYCOM Server active on http://localhost:${PORT}`);
});
