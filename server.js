const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://Medi-Camp:D7yBt1PomnbYcNAP@cluster0.v1zto12.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server
    await client.connect();
    console.log("Connected successfully to MongoDB");

    const database = client.db("medi-camp");
    const messInfo = database.collection("messInfo");
    const roomsCollection = database.collection("roomsCollection");

    app.get('/messInfo', async (req, res) => {
      try {
        const cursor = messInfo.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    

    // Login endpoint
    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      console.log('Login request received:', email, password); // Log request data
      try {
          const user = await messInfo.findOne({ email, password });
          console.log('User found:', user); // Log the user found
          if (user) {
              res.json('Success');
          } else {
              res.status(400).send('Invalid credentials');
          }
      } catch (error) {
          console.error('Error occurred during login:', error);
          res.status(500).send('Internal Server Error');
      }
  });

  app.post('/api/rooms', async (req, res) => {
    try {
        const newRoom = req.body;
        await roomsCollection.insertOne(newRoom);
        res.json('Room added!');
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});
  

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
