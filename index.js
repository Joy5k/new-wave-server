const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json())


const uri="mongodb://localhost:27017"
// const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.ctmwtm0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


app.get('/', (req, res) => {
    res.send('Assignment Server is Running')
})
async function run(){
    try {
        const lessonCollection = client.db('newWaveDB').collection('lesson');
        app.get('/lesson', async(req, res) => {
            const query = {}
            const cursor = lessonCollection.find(query).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });
    }
    finally {
   
    }


} run().catch(error => console.log(error))

app.listen(port, () => {
 
    console.log(`server running on ${port}`);
})