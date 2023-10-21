require('dotenv').config()
const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express()
const cors = require('cors')

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
        // await client.connect();

        // Add products API
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })


        // Show All products API
        app.get('/products', async (req, res) => {
            const products = productsCollection.find()
            const result = await products.toArray()
            res.send(result)
        })


        // View single product details or show product details in the update page input API
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        })


        // Update product API
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const product = req.body;

            const options = { upsert: true };
            const updateProduct = {
                $set: {
                    name: product.name,
                    brand: product.brand,
                    type: product.type,
                    price: product.price,
                    ratting: product.ratting,
                    productImgURL: product.productImgURL,
                    description: product.description
                }
            };
            const result = await productsCollection.updateOne(query, updateProduct, options);
            res.send(result);
        })


        // Brands API Show all brand
        app.get('/brands', async (req, res) => {
            const brands = brandsCollection.find()
            const result = await brands.toArray()
            res.send(result)
        })

        // Brand single page Show only this brand products 
        app.get('/brands/:brandName', async (req, res) => {
            const brandName = req.params.brandName;
            const query = { brand: brandName };
            const brands = productsCollection.find(query);
            const result = await brands.toArray();
            res.send(result);
        })


        // Add To cart products store in the database API
        app.post('/carditems/:userId', async (req, res) => {

            const newUserId = req.params.userId;
            const cartItemCollection = client.db("aircraftengineersstoreAddToCartDB").collection(`${newUserId}`);

            const product = req.body;

            const result = await cartItemCollection.insertOne(product);
            res.send(result);
        })

        // Cart page API Show all Cart item for this user
        app.get('/carditems/:userId', async (req, res) => {
            const newUserId = req.params.userId;
            const cartItemCollection = client.db("aircraftengineersstoreAddToCartDB").collection(`${newUserId}`);

            const cardItems = cartItemCollection.find();
            const result = await cardItems.toArray();
            res.send(result);
        })

        // Find Cart item to delete from cart page
        app.delete('/carditems/:userId', async (req, res) => {
            const newUserId = req.params.userId;
            const productId = req.query.productid;

            const cartItemCollection = client.db("aircraftengineersstoreAddToCartDB").collection(`${newUserId}`);

            const query = { _id: new ObjectId(productId) };
            const result = await cartItemCollection.deleteOne(query);
            res.send(result);
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
