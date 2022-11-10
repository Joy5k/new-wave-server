const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json())


const uri="mongodb://localhost:27017"
// const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.ctmwtm0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
      return  res.status(401).send({ message: 'unauthorize access.' })
        
    }
    const token = authHeaders.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
          return  res.status(403).send({message:'unauthorize access'})
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try {
        const lessonCollection = client.db('newWaveDB').collection('lesson');
        const reviewCollection = client.db('newWaveDB').collection('reviews')
        app.post('/jwt', (req, res) => {
            const user = req.body;
          const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'7d'})
      res.send({token})
        })
        app.get('/', (req, res) => {
            res.send('Assignment Server is Running')
        })
      
        app.get('/lesson', async (req, res) => {
            const query = {}
            const cursor = lessonCollection.find(query).limit(3);
            const courses = await cursor.toArray();
            res.send(courses);
        });
        app.get('/lessons', async(req, res) => {
            const query = {}
            const cursor = lessonCollection.find(query);
            const courses = await cursor.toArray();
            res.send(courses);
        });
        app.get('/lessons/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const course = await lessonCollection.findOne(query)
            res.send(course)
        });
    
        app.put('/addService', async (req, res) => {
            const service = req.body;
            const result = await lessonCollection.insertOne(service)
            res.send(result);
        })
//add review

        app.post('/addReview',verifyJWT, async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result);
        })




        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = {id}
            const cursor = reviewCollection.find(query);
            const courses = await cursor.toArray();
            res.send(courses);
        });
 
    //  get my all reviews
        
  

        app.get('/myreviews',verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log(decoded)
            if (decoded.email !== req.query.email) {
                res.status(403).send({message:'unauthorize access'})
            }
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query)
            const reviews=await cursor.toArray()
            res.send(reviews)
        })      
        
      
//delete my review
app.delete('/myreviews/:id',verifyJWT, async(req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) }
    const result = await reviewCollection.deleteOne(query)
    res.send(result)
})
        
        
        // get specific  cart's review;

        app.get('/allreviews', async(req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query);
            const courses = await cursor.toArray();
            res.send(courses);
        });
      
    }
    finally {
   
    }


} run().catch(error => console.log(error))

app.listen(port, () => {
 
    console.log(`server running on ${port}`);
})