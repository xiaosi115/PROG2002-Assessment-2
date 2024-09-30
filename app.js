const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
const db = require('./crowdfunding_db'); // Import database connection
// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 路由处理
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/Search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Search.html'));
});

app.get('/Fundraiser', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Fundraiser.html'));
});




app.get('/api/fundraisers', (req, res) => {
    const query = `
        SELECT f.*, c.NAME AS category_name
        FROM FUNDRAISER f
        JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID
        WHERE f.ACTIVE = 1 limit 4
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});





app.get('/api/your-endpoint', (req, res) => {
    const { ORGANIZER, CATEGORY, CITY, search } = req.query; // Get query parameters

    // Base query statement
    let baseQuery = 'SELECT * FROM fundraiser';
    let conditions = [];
    let queryParams = [];

    // Dynamically add query conditions based on existing parameters
    if (search) {
        conditions.push('caption LIKE ?');
        queryParams.push(`%${search}%`);
    }

    if (ORGANIZER) {
        conditions.push('ORGANIZER = ?');
        queryParams.push(ORGANIZER);
    }

    if (CATEGORY) {
        conditions.push('CATEGORY_ID = (SELECT CATEGORY_ID FROM category WHERE NAME = ?)');
        queryParams.push(CATEGORY);
    }

    if (CITY) {
        conditions.push('CITY = ?');
        queryParams.push(CITY);
    }

    // If there are conditions, append WHERE clause
    if (conditions.length > 0) {
        baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // Execute query
    db.query(baseQuery, queryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results); // Return query results to frontend
    });
});




app.get('/person', (req, res) => {
    const { organizer, CITY, CAPTION, img } = req.query; // Get query parameters

    // Validate parameters
    if (!organizer) {
        return res.status(400).json({ error: 'Organizer is required' });
    }
    if (!CITY) {
        return res.status(400).json({ error: 'City is required' });
    }
    if (!CAPTION) {
        return res.status(400).json({ error: 'Caption is required' });
    }
    if (!img) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    // Construct query statement
    const query = 'SELECT * FROM fundraiser WHERE ORGANIZER = ? AND CITY = ? AND CAPTION = ?';
    const queryParams = [organizer, CITY, CAPTION];

    // Execute query
    db.query(query, queryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        // If no fundraiser found, return 404
        if (results.length === 0) {
            return res.status(404).json({ error: 'No fundraiser found for this organizer' });
        }

        // Render page, assuming using EJS template engine
        res.json(results); // Return details of the first fundraiser
    });
});

























// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器在 http://localhost:${PORT} 上运行`);
});
