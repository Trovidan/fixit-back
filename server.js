import dotenv from "dotenv";
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import access from "./routes/access.js";
import Fetch from './routes/fetch.js'
import request from "./routes/request.js";
import Review from "./routes/reviews.js"
import customer from "./routes/customer.js"
import provider from "./routes/provider.js"

//appConfig 
dotenv.config({ silent: process.env.NODE_ENV === 'production' });
const app = express();
const port = process.env.PORT || 9000;


//middleWare
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use('/access', access)
app.use('/fetch',Fetch)
app.use('/request', request)
app.use('/review', Review)
app.use('/customer',customer)
app.use('/provider',provider)

//dbConfig
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.MONGO_DB_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => { console.log("Connected to database"); });

app.get('*',(req,res)=>{
    res.status(200).send('Request received on fixit server, Thanks!')
})

app.listen(port, ()=>{
    console.log("listening to port: "+port );
})