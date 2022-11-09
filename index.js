const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ohvfmrr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log('authHeader', authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('tasteHub').collection('services');
        const reviewCollection = client.db('tasteHub').collection('review');


        // jwt token send

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
            // console.log(token);
        })

        // limited services api

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });

        // all services api

        app.get('/allservice', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        //details api by id

        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.post('/review', verifyJWT, async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        // all review api
        app.get('/review/:service', async (req, res) => {
            const service = req.params.service;
            let query = { service: service };
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        });

        // My reviews api
        app.get('/review', verifyJWT, async (req, res) => {
            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {
               return res.status(403).send({ message: 'unauthorized access' })
            }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            console.log(review);
            res.send(review);
        });

        // get review by id

        app.get('/singlereview/:id', verifyJWT, async (req, res) => {
            const {id} = req.params;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review); 
        })

        
        // update review api 

        app.put("/updatereview/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = req.body;
            const option = {upsert: true};
            const updatedReview = {
                $set: {
                    massage: user.massage
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedReview, option);
            console.log(result);
            // res.send(result);
          });



        // delete review api 

        app.delete('/reviewd/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

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