const dns = require('node:dns');
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;
const PORT = process.env.port|| 8000;

app.use(cors());
app.use(express.json());


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect();

    const db = client.db("studynooks");
    const usercollection = db.collection("users");    
    
    app.post('/register', async (req, res) => {
      const user = req.body;
      
      const result = await usercollection.insertOne(user);
      res.json(result);
      console.log(user, result);
    });



    const roomcollection = db.collection("rooms");

    app.post('/addroom', async (req, res) => {
      const room = req.body;
      const result = await roomcollection.insertOne(room);
      res.json(result);
      console.log(room, result);
    });

    app.get('/addroom', async (req, res) => {
      const rooms = await roomcollection.find().toArray();
      res.json(rooms);
    });

    app.get("/rooms/:id", async (req, res) => {
            try {
              const room = await roomcollection.findOne({ _id: new ObjectId(req.params.id) });
              if (!room) return res.status(404).json({ error: "Room not found" });
              res.json(room);
            } catch (error) {
              res.status(400).json({ error: "Invalid room ID" });
            }
    });



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
} catch(error) {
    await client.close();
  }
}

run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello, World!');
}); 


app.listen(PORT, ()=>{
    console.log("server is running");
})