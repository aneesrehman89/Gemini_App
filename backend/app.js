const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors')
require('dotenv').config()

app.use(bodyParser.json());

const corsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://gemini-app-frontend.vercel.app",
        "http://localhost:3000", // Allow localhost during development
      ];
  
      // Allow requests with no origin (e.g., mobile apps, Postman, server-side calls)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type"], // Allowed headers
  };
  
  app.use(cors(corsOptions));
  

app.post('/getResponse', (req, res) => {
    console.log(req.body.question)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    model.generateContent(req.body.question).then(result=>{
        console.log(result.response.text());
        const response = result.response.text();
        res.status(200).json({
            response:response
        })
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    })
})

app.get('*',(req,res)=>{
    res.status(404).json({
        msg:'Hello world'
    })
})


module.exports = app;
