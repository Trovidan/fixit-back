import dotenv from "dotenv";
import express from 'express';
import { doesExist, generateToken } from "../utitlity.js";
import customer from "../models/customer.js";
import jwt from 'jsonwebtoken'
import provider from "../models/provider.js";

//server config
dotenv.config({silent: process.env.NODE_ENV === "production"})
const SECRET_KEY = process.env.SECRET_KEY || "q!wq!w@e3R$t%y^u7*i(u)i*o_p+(@e3R$t%y^u7*q!w@e3R$t%y^u7*i(u)i*o_p+(i(u)i*o_p+("
const CUSTOMER = process.env.CUSTOMER
const PROVIDER = process.env.PROVIDER
const access = express.Router();

access.post('/login',(req,res)=>{
    let {email,password,status}= req.body;

    if( !doesExist(email) || !doesExist(password)){
        res.status(400).send("Request requires email and password! ")
        return;
    }
    
    if(status == PROVIDER){
        provider.findOne({email:email}, (err, doc) => {
            if (err) {
                res.status(503).send("Unable to authenticate, Please try later")
                return;
            }
            if (!doc) {
                res.status(400).send("No account exists with this email!")
                return;
            }
            if (doc.password !== password) {
                res.status(400).send("Invalid Passsword!")
                return;
            }
            doc.password = undefined
            let token = generateToken({ _id: doc._id, status: PROVIDER })
            res.status(202).send({ userDetails: doc, token: token, status: PROVIDER })
            return;
        })
    }
    else{
        customer.findOne({email:email}, (err, doc) => {
            if (err) {
                res.status(503).send("Unable to authenticate, Please try later")
                return;
            }
            if (!doc) {
                res.status(400).send("No account exists with this email!")
                return;
            }
            if (doc.password !== password) {
                res.status(400).send("Invalid Passsword!")
                return;
            }
            doc.password = undefined
            let token = generateToken({ _id: doc._id, status: CUSTOMER })
            res.status(202).send({ userDetails: doc, token: token, status:CUSTOMER })
            return;
        })
    }
})

access.get('/validate',(req, res)=>{
    let {token} = req.cookies
    
    if(!doesExist(token)){
        res.status(400).send('improper request')
        return;
    }

    jwt.verify(token, SECRET_KEY, (err, decoded)=>{
        if (err ) {
            res.status(400).send("Token expired!")
            return;
        }
        if(decoded.status == PROVIDER ){
            provider.findById(decoded._id, (err, doc) => {
                if (err || !doc) {
                    res.status(400).send("Invalid Token!")
                    return;
                }
                doc.password = undefined
                res.status(202).send({ userDetails: doc, status: PROVIDER})
                return;
            })
        }
        else{
            customer.findById(decoded._id, (err, doc) => {
                if (err || !doc) {
                    res.status(400).send("Invalid Token!")
                    return;
                }
                doc.password = undefined
                res.status(202).send({ userDetails: doc, status:CUSTOMER })
                return;
            })
        }
    })
})

export default access;