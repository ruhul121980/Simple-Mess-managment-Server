const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin:["http://localhost:5173",
      "https://mess-managment-10e82.web.app",
      "https://mess-managment-10e82.firebaseapp.com",
    ],
    credentials:true,
    
  }));
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
    // await client.connect();
    console.log("Connected successfully to MongoDB");

    const database = client.db("medi-camp");
    const messInfo = database.collection("messInfo");
    const roomsCollection = database.collection("roomsCollection");
    const members = database.collection("members");
    const membersPayment = database.collection("membersPayment");

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

    app.get('/roomDetails/:id', async (req, res) => {
      try {
          const id = req.params.id;
          
          // Validate if 'id' is a valid ObjectId
          if (!ObjectId.isValid(id)) {
              return res.status(400).send('Invalid ID format');
          }
  
          const query = { _id: new ObjectId(id) };
          const result = await roomsCollection.findOne(query);
  
          if (!result) {
              return res.status(404).send('Service not found');
          }
  
          res.send(result);
      } catch (error) {
          console.error('Error in fetching service information:', error);
          res.status(500).send('Internal Server Error');
      }
  });
  app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await roomsCollection.find().toArray();
        res.json(rooms);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
  });

  app.get('/api/members/:id', async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      
      const query = { roomId: id };
      const membersList = await members.find(query).toArray();
      
      if (membersList.length === 0) {
        return res.status(404).send('No members found for this room');
      }

      res.json(membersList);
    } catch (err) {
      console.error('Error fetching members:', err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/api/member-details/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // Validate if 'id' is a valid ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send('Invalid ID format');
        }

        const query = { _id: new ObjectId(id) };
        const result = await members.findOne(query);

        if (!result) {
            return res.status(404).send('Service not found');
        }

        res.send(result);
    } catch (error) {
        console.error('Error in fetching service information:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/api/member-payment/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    
    const query = { memberId: id };
    const membersPaymentList = await membersPayment.find(query).toArray();
    
    if (membersPaymentList.length === 0) {
      return res.status(404).send('No members found for this room');
    }

    res.json(membersPaymentList);
  } catch (err) {
    console.error('Error fetching members:', err);
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

app.post('/api/members', async (req, res) => {
  try {
      const newMember = req.body;
      await members.insertOne(newMember);
      res.json('members added!');
  } catch (err) {
      res.status(400).json('Error: ' + err);
  }
});

app.post('/api/payment', async (req, res) => {
  try {
      const newPayment = req.body;
      console.log(newPayment)
      
      await membersPayment.insertOne(newPayment);
      res.json('payment added!');
  } catch (err) {
      res.status(400).json('Error: ' + err);
  }
});





  

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
