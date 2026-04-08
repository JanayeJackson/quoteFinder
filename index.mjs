import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const conn = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.end.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', async (req, res) => {
    //Get authors
    let sql = `SELECT authorId, firstName, lastName
                FROM q_authors
                ORDER BY lastName`;
    const [rows] = await conn.query(sql);

    //Get categories
    sql = `SELECT DISTINCT category
            FROM q_quotes
            ORDER BY category`;
    const [categories] = await conn.query(sql);
    res.render('index', {"authors": rows, "categories": categories});
});


app.get('/searchByKeyword', async (req, res) => {
    let userKeyword = req.query.keyword;
    let sql = `SELECT authorId, firstName, lastName, quote, likes, category
                FROM q_quotes
                NATURAL JOIN q_authors
                WHERE quote LIKE ?`;
    let sqlParams = [`%${userKeyword}%`];
    const [rows] = await conn.query(sql, sqlParams);
    res.render("results", {"quotes":rows});

});

app.get('/searchByAuthor', async (req, res)=> {
    let userAuthorId = req.query.authorId;
    let sql = `SELECT authorId, firstName, lastName, quote, likes, category
                FROM q_quotes
                NATURAL JOIN q_authors
                WHERE authorId = ?`;
    let sqlParams = [`${userAuthorId}`];
    const [rows] = await conn.query(sql, sqlParams);
    res.render("results", {"quotes":rows});
});

app.get('/searchByCategory', async (req, res)=> {
    let userCategory = req.query.category;
    let sql = `SELECT authorId, firstName, lastName, quote, likes, category
                FROM q_quotes
                NATURAL JOIN q_authors
                WHERE category = ?`;
    let sqlParams = [`${userCategory}`];
    const [rows] = await conn.query(sql, sqlParams);
    res.render("results", {"quotes":rows});
});


app.get('/searchByRange', async (req, res)=> {
    let userMin = req.query.min;
    let userMax = req.query.max;
    let sql = `SELECT authorId, firstName, lastName, quote, likes, category
                FROM q_quotes
                NATURAL JOIN q_authors
                WHERE likes BETWEEN ? AND ?`;
    let sqlParams = [`${userMin}`, `${userMax}`];
    const [rows] = await conn.query(sql, sqlParams);
    res.render("results", {"quotes":rows});
});


app.get('/api/author/:id', async (req, res) => {
    let authorId = req.params.id;
    let sql = `SELECT * 
                FROM q_authors
                WHERE authorId = ?`;
    const [rows] = await conn.query(sql, [authorId]);
    res.send(rows);
});

app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})