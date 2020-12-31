const express = require('express');
const app = express();
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;


// setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
dotenv.config();

// Connecting to DB

const port = process.env.PORT;
const dbname = process.env.DB_NAME;
const dbhost = process.env.DB_HOST;
const dbpassword = process.env.DB_PASSWORD;
const dbusername = process.env.DB_USERNAME;

const connectionString = `mongodb+srv://${dbusername}:${dbpassword}@${dbhost}/${dbname}?retryWrites=true&w=majority`;
MongoClient.connect(connectionString, { useUnifiedTopology: true }) //Mongo Client
  .then(client => { // All code in here
        console.log('Connected to Database')
        const db = client.db('feedback-db')   
        const feedbackCollection = db.collection('feedback-collection') 
        
        // express listeners
        app.listen(port||8080, () => {
            console.group(`port ${port}`);
        })
        
        // GET Requests
        app.get('/', (req, res) => {
            res.send("feedback api")
        })

        // POST Requests
        app.post('/feedback', (req, res) => {
            feedbackCollection.insertOne(req.body)
            .then(() => {
                res.json(
                    {
                        error:'',
                        response:"feedback saved!", 
                        name:req.body.name
                    }
                );
            })
            
            .catch(error => console.log(error) )
        }) 
  })

  .catch(error => console.error(error))