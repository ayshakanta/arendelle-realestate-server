const express = require('express');
const app = express() ;
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;


const corsOptions = {
  origin: ['http://localhost:5173'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))


app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ronnby7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db('arendelleDb').collection('users');
    const propertyCollection = client.db('arendelleDb').collection('properties');
    const wishlistCollection = client.db('arendelleDb').collection('wishlist');


    // user related api

    app.get("/users", async(req, res)=>{
      const result = await userCollection.find().toArray()
      res.send(result)
    })


    app.post("/users", async(req, res)=>{
      const user = req.body;

      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
        return res.send({message: "User already exist", insertedId: null})
      }

      const result = await userCollection.insertOne(user);
      res.send(result)
    })

    // make admin 

    app.patch("/users/admin/:id", async(req, res)=>{
      const id = req.params.id 
      const filter = {_id: new ObjectId(id)}
      const updatedDoc ={
        $set: {
          role: "admin"
        }
      }
      const result = await userCollection.updateOne(filter,  updatedDoc)
      res.send(result)
    })

    // make agent 

    app.patch("/users/agent/:id", async(req, res)=>{
      const id = req.params.id 
      const filter = {_id: new ObjectId(id)}
      const updatedDoc ={
        $set: {
          role: "agent"
        }
      }
      const result = await userCollection.updateOne(filter,  updatedDoc)
      res.send(result)
    })


    app.delete("/users/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query)
      res.send(result)
    })

    app.get('/properties', async(req, res) =>{
      const result = await propertyCollection.find().toArray()
      res.send(result)
    })


    app.get('/property/:id', async(req, res) =>{
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await propertyCollection.findOne(query)
      res.send(result)
    })

    //wishlist collection

    

    app.get('/wishlist', async(req, res)=>{
      const email = req.query.email
      const query = {email:email}
      const result = await wishlistCollection.find(query).toArray()
      res.send(result)
    })

    app.post("/wishlist", async(req, res)=>{
      const wishlistItem = req.body;
      const result = await wishlistCollection.insertOne(wishlistItem)
      res.send(result)
    })

    app.delete("/wishlist/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    })

    


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send('arendelle is running')
});

app.listen(port, ()=>{
    console.log(`arendelle is running on port ${port}`)
});