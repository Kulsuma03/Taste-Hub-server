const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ohvfmrr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('tasteHub').collection('services');

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/allservice', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/allservice/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

    }
    finally {

    }

}

run().catch(err => console.error(err));



app.get('/', (req, res) => {
    res.send('assignment 11 server is running')
});

app.listen(port, () => {
    console.log('assignment 11 server running port', port);
})