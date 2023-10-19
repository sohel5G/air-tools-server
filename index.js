const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { cookie } = require('express/lib/response');
const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Aircraft Engineers Store Server is running')
})

app.listen(port, () => {
    console.log(`Aircraft Engineers Store Server is running on PORT: ${port}`)
})


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS_WORD}@cluster0.qbl5b3c.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const productsCollection = client.db("aircraftengineersstoreDB").collection("products");
const brandsCollection = client.db("aircraftengineersstoreDB").collection("brands");

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })
        app.get('/products', async (req, res) => {
            const products = productsCollection.find()
            const result = await products.toArray()
            res.send(result)
        })


        app.get('/brands', async (req, res) => {
            const brands = brandsCollection.find()
            const result = await brands.toArray()
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.log);
