const express = require('express');
const path = require('path');
const axios = require('axios'); // For calling APIs
const app = express();
const db = require('./crowdfunding_db'); // Import database connection
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Simulated API data (replacing actual API calls)

// 1. Get all active fundraisers and their categories
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

// 2. Get all categories
app.get('/api/categories', (req, res) => {
    const query = 'SELECT * FROM CATEGORY';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});

// 3. Get active fundraisers and their categories based on conditions
app.get('/api/fundraisers/search', (req, res) => {
    const { categoryId } = req.query; // Get category ID from query parameters
    let query = `
        SELECT f.*, c.NAME AS category_name
        FROM FUNDRAISER f
        JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID
        WHERE f.ACTIVE = 1
    `;

    if (categoryId) {
        query += ` AND f.CATEGORY_ID = ?`;
    }

    db.query(query, [categoryId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
    });
});

// 4. Get fundraiser details by ID
app.get('/api/fundraiser/:id', (req, res) => {
    const fundraiserId = req.params.id;
    const query = `
        SELECT f.*, c.NAME AS category_name
        FROM FUNDRAISER f
        JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID
        WHERE f.FUNDRAISER_ID = ?
    `;

    db.query(query, [fundraiserId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Fundraiser not found' });
        }
        res.json(results[0]); // Return details of a single fundraiser
    });
});

// Declare dynamic routes

app.get('/Search', (req, res) => {
    res.render('Search', { title: 'About Us' });
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
        res.render('Fundraiser', { fundraiser: results[0] }); // Return details of the first fundraiser
    });
});

// Declare another endpoint for querying fundraisers based on various parameters
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






app.get('/', (req, res) => {
    const query = 'SELECT * FROM FUNDRAISER';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Database query error');
        }
        console.log('Query results:', results); // Check query results
        res.render('index.ejs', { fundraisers: results });
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
