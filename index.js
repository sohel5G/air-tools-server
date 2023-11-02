require('dotenv').config();
const express = require('express');
jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express()
const cors = require('cors')

//middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Aircraft Engineers Store Server is running')
})

app.listen(port, () => {
    console.log(`Aircraft Engineers Store Server is running on PORT: ${port}`)
})






// My Custom made middleware
const logger = (req, res, next) => {
    console.log('Log Info : ', req.method, req.url);
    next()
}

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    // console.log('this cookie in the middleware ware', token);

    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' });
    }

    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' });
        }
        req.user = decoded;
        next()
    })
}
// My Custom made middleware end






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
        // await client.connect();









        // Auth API, Create token and set it to browser cookie
        app.post('/jwt', async (req, res) => {

            const user = req.body;
            const token = jwt.sign(user, process.env.SECRET_TOKEN, { expiresIn: '1h' })

            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
                .send({ success: true })
        })
        // Auth API, Create token and set it to browser cookie end


        // Remove cookie if user logout
        app.post('/logout', async (req, res) => {
            const user = req.body;

            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })
        // Remove cookie if user logout end



















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
        app.post('/carditems/:userEmail', async (req, res) => {

            const newUserEmail = req.params.userEmail;
            const cartItemCollection = client.db("aircraftengineersstoreAddToCartDB").collection(`${newUserEmail}`);

            const product = req.body;

            const result = await cartItemCollection.insertOne(product);
            res.send(result);
        })


        /* THIS JWT VERIFY API */

        // Cart page API Show all Cart item for this user
        app.get('/carditems/:userEmail', verifyToken, async (req, res) => {
            const newUserEmail = req.params.userEmail;
            const cartItemCollection = client.db("aircraftengineersstoreAddToCartDB").collection(`${newUserEmail}`);

            console.log('This is user', newUserEmail)
            console.log('Token owner info', req.user)

            if (req.user.email !== newUserEmail){
                return res.status(403).send({message: 'forbidden access'});
            }
            const cardItems = cartItemCollection.find();
            const result = await cardItems.toArray();
            res.send(result);
        })

        /* THIS JWT VERIFY API */




        // Find Cart item to delete from cart page
        app.delete('/carditems/:userEmail', async (req, res) => {
            const newUserEmail = req.params.userEmail;
            const productId = req.query.productid;

            const cartItemCollection = client.db("aircraftengineersstoreAddToCartDB").collection(`${newUserEmail}`);

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
