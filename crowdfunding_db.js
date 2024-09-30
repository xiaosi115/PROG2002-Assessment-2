const mysql = require('mysql2');

// 创建数据库连接
const connection = mysql.createConnection({
    host: 'localhost',      // 数据库主机
    user: 'root',  // 数据库用户名
    password: '123456', // 数据库密码
    database: 'crowdfunding_db' // 数据库名称
});

// 连接到数据库
connection.connect((err) => {
    if (err) {
        console.error('数据库连接错误:', err.stack);
        return;
    }
    console.log('成功连接到数据库');
});

// 导出连接
module.exports = connection;
