const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kiqx3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

client.connect((err) => {
    const foodsCollection = client
        .db(`${process.env.DB_NAME}`)
        .collection(`${process.env.DB_COLLECTION}`);

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
