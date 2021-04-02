const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const admin = require('firebase-admin');
const serviceAccount = require('./config/khaas-foods-123-firebase-adminsdk-mie3u-dc91d9daaa.json');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kiqx3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

client.connect((err) => {
    const foodsCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection(`${process.env.DB_FOODS_COLLECTION}`);

    const buyCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection(`${process.env.DB_BUY_COLLECTION}`);

    app.get('/foods', (req, res) => {
        foodsCollection.find({}).toArray((err, result) => {
            res.send(result);
        });
    });

    app.post('/addFood', (req, res) => {
        const newfood = req.body;
        foodsCollection.insertOne(newfood).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    app.get('/buyData', (req, res) => {
        buyCollection
            .find({ email: req.query.email })
            .toArray((err, result) => {
                res.send(result);
            });
    });

    app.post('/addBuyData', (req, res) => {
        const newfood = req.body;
        buyCollection.insertOne(newfood).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    app.delete('/delete/:id', (req, res) => {
        foodsCollection
            .deleteOne({ _id: ObjectId(req.params.id) })
            .then((result) => {
                res.send(result.deletedCount > 0);
            });
    });

    err
        ? console.log('Database Connection Fail!')
        : console.log('Database Connection Successfully!');
});

app.get('/', (req, res) => {
    res.send('Hello Express!');
});

app.listen(port, () =>
    console.log(`App listening at http://localhost:${port}`)
);
