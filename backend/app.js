const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors')
require('dotenv').config()

app.use(bodyParser.json());

const corsOptions = {
    origin: ['http://localhost:3000', 'https://gemini-app-frontend.vercel.app'],
    methods: ['GET', 'POST'],
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
