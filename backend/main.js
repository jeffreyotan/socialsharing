// load required libraries and modules
const morgan = require('morgan');
const express = require('express');
const mysql = require('mysql2/promise');

// load libraries for S3
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');

// load libraries for mongodb
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const Timestamp = require('mongodb').Timestamp;
// alternatively, we can declare together const [ Timestamp, MongoClient ] = require('mongodb');

// mongodb connection string
const MONGO_URL = "mongodb://localhost:27017";

// create an instance of the mongodb Client
const mongoClient = new MongoClient(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// configure PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

// create an instance of the express server
const app = express();

// create a pool to MySQL backend
const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT) || 3306,
	user: process.env.DB_USER,
	password: process.env.DB_PW,
	database: process.env.DB_NAME || 'paf2020',
	connectionLimit: parseInt(process.env.DB_CONN_LIMIT) || 4,
	timezone: '+08:00'
});

// create sql queries
const makeQuery = (sql, dbPool) => {
    console.info('=> Creating query: ', sql);
    return (async (args) => {
        const conn = await dbPool.getConnection();
        try {
            let results = await conn.query(sql, args) || [];
            return results[0];
        } catch (e) {
            console.error(e);
        } finally {
            conn.release();
        }
    });
};

const SQL_QUERY_AUTH_USER = "select * from user where user_id = ?";

const authUser = makeQuery(SQL_QUERY_AUTH_USER, pool);

// define any cloud persistance storage settings
const multipart = multer({
    dest: process.env.TMP_DIR || path.join(__dirname, "/uploads/")
});
const cloudEP = process.env.CLOUD_ENDPOINT;
const endpoint = new AWS.Endpoint(cloudEP);
const s3 = new AWS.S3({
    endpoint: endpoint,
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

// define constants for mongodb
const MONGO_DB_NAME = '';
const MONGO_COLLECTION_NAME = '';

// define middleware and routes
app.use(morgan('combined'));

// POST /login with payload in the body
app.post('/login', express.urlencoded({ extended: true }), express.json(), (req, res, next) => {
	const body = req.body;
    console.info('=> in /login with body:', body);

    authUser([ body['username'] ]).then(result => {
        // console.info(`=> password:${JSON.stringify(result[0]['password'])}, body.password:${body['password']}`);
        if(result && result.length && result[0]['password'] === body['password']) {
            res.status(200).contentType('application/json').json({ status: 'ok' });
        } else {
            res.status(401).contentType('application/json').json({ status: 'fail' });
        }
    }).catch(e => {
        console.error("=> Something went wrong with the mysql query!", e);
        res.status(500).contentType('application/json').json({ status: 'internal server error' });
    });
});

// start the server
const startApp = async (newApp, newPool) => {
	try {
        const conn = await newPool.getConnection();

        console.info('We are pinging the database..');
        await conn.ping();

        // at this point, if an error is not thrown, a connection to the DB can be established
        conn.release();

        const p0 = new Promise((resolve, reject) => {
            if((!!process.env.ACCESS_KEY) && (!!process.env.SECRET_ACCESS_KEY)) {
                resolve();
            } else {
                reject('S3 Keys are not found');
            }
        });
        const p1 = mongoClient.connect();

        // mongoClient.connect().then(() => {
        Promise.all([p0, p1]).then(() => {
            newApp.listen(PORT, () => {
                console.info(`Application started on port ${PORT} at ${new Date()}`);
            });
        }).catch(e => {
            console.error('=> Unable to establish a connection to the MongoDB server: ', e);
        });
    } catch (e) {
        console.error('=> Unable to establish connection to DB: ', e);
    }
}

startApp(app, pool);
