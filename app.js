const express = require('express');
const path = require('path');
const axios = require('axios'); // 用于调用API
const app = express();
const db = require('./crowdfunding_db'); // 引入数据库连接
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// 模拟的API数据（替代实际API调用）

// 1. 获取所有活跃筹款活动及其类别
app.get('/api/fundraisers', (req, res) => {
    const query = `
        SELECT f.*, c.NAME AS category_name
        FROM FUNDRAISER f
        JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID
        WHERE f.ACTIVE = 1 limit 4
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: '数据库查询错误' });
        }
        res.json(results);
    });
});

// 2. 获取所有类别
app.get('/api/categories', (req, res) => {
    const query = 'SELECT * FROM CATEGORY';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: '数据库查询错误' });
        }
        res.json(results);
    });
});

// 3. 根据条件获取活跃筹款活动及其类别
app.get('/api/fundraisers/search', (req, res) => {
    const { categoryId } = req.query; // 从查询参数中获取类别 ID
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
            return res.status(500).json({ error: '数据库查询错误' });
        }
        res.json(results);
    });
});

// 4. 根据 ID 获取筹款活动详情
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
            return res.status(500).json({ error: '数据库查询错误' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: '筹款活动未找到' });
        }
        res.json(results[0]); // 返回单个筹款活动的详情
    });
});


//声明动态路由

app.get('/about', (req, res) => {
    res.render('about', { title: '关于我们' });
});

app.get("/articles", function(req, res){
    var articles = [
            {title: "Man Discovers Different Opinion", author: "Reginald", date: "9/2/45"},
            {title: "Tigers Aren't Great Pets", author: "Simon", date: "4/13/95"},
            {title: "Eating Cake for Breakfast", author: "Katie", date: "8/20/13"}
        ];
    res.render("articles.ejs", {articles: articles})
});


app.post('/api/your-endpoint', (req, res) => {
    console.log(req);
    const { search } = req.body; // Retrieve search input
    const query = 'SELECT * FROM fundraisers WHERE title LIKE ?'; // Example query

    db.query(query, [`%${search}%`], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results); // Return results to the frontend
    });
});



app.get('/', (req, res) => {
    const query = 'SELECT * FROM FUNDRAISER';
        var articles = [
            {title: "Man Discovers Different Opinion", author: "Reginald", date: "9/2/45"},
            {title: "Tigers Aren't Great Pets", author: "Simon", date: "4/13/95"},
            {title: "Eating Cake for Breakfast", author: "Katie", date: "8/20/13"}
        ];

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('数据库查询错误');
        }
        console.log('查询结果:', results); // 检查查询结果
        res.render('index.ejs', { fundraisers: results });
    });
});




app.listen(3000, () => {
    console.log('服务器在3000端口运行');
});

