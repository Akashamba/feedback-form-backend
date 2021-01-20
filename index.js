const express = require('express');
const app = express();
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const cors = require("cors");
const nodemailer = require('nodemailer');

// setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

// nodemailer
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS,
    }
});

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
            res.send("feedback api");
        })

        // POST Requests
        app.post('/feedback', (req, res) => {
            feedbackCollection.insertOne(req.body)
            .then(() => {
                res.json({
                        error:'',
                        response:"feedback saved!", 
                        name:req.body.name
                });
                
                var mailOptions = {
                    from: 'akash.server.mail@gmail.com',
                    to: 'akashambashankar@gmail.com',
                    subject: `New Feedback for ${req.body.website} from ${req.body.name}.`,
                    text: `Feedback from: ${req.body.name}
                           Feedback for: ${req.body.website}
                           Date: ${req.body.date}
                           How they found: ${req.body.find}
                           Rating: ${req.body.rating}/5
                           What was good: ${req.body.good}
                           what can be improved: ${req.body.improvement}
                           other: ${req.body.other}`
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
            })
            
            .catch(error => {
                console.log(error);
                res.json({
                    error: error
                });
            })
        }) 
  })

  .catch(error => console.error(error))