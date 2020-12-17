import dotenv from "dotenv";
import express from 'express';
import { CustomerUpdate, decodeJWT, doesExist, generateToken } from "../utitlity.js";
import Customer from "../models/customer.js";

dotenv.config({ silent: process.env.NODE_ENV === "production" })
const user = express.Router()
const CUSTOMER = process.env.CUSTOMER

user.post('/fetch', (req, res) => {
    let { ids } = req.body;
    let filter;
    if (Array.isArray(ids) && ids.length > 0) {
        filter = {
            _id: {
                $in: ids
            }
        };
    } else {
        res.status(400).send("Request requires customer ids")
        return;
    }
    Customer.find(filter, (err, docs) => {
        if (err) {
            // console.log(err);
            res.status(503).send("Something Went Wrong!!!");
            return;
        }
        else {
            // console.log(data);
            res.status(200).send(docs);
            return;
        }
    });
})

user.post('/update',(req,res)=>{
    let {token} = req.cookies
    let {name, email, contactNumber, address,city,state, password, gender} = req.body


    if(!doesExist([name,email,contactNumber,address,city,state,token,gender])){
        console.log(req.body);
        res.status(400).send("incomplete request")
        return
    }

    decodeJWT(token).then(decoded=>{
        if(decoded.status != CUSTOMER){
            res.status(401).send("Providers Cann't Edit customer details")
            return;    
        }

        let filter = {
            _id: decoded._id
        }
        let update = {
            name: name,
            email: email,
            city: city,
            state: state,
            address: address,
            contactNumber: contactNumber,
            gender: gender
        }
        if(doesExist(password)){
            update["password"]=password
        }
        CustomerUpdate(filter,update).then(doc=>{
            doc.password = undefined
            res.status(202).send(doc)
            return
        }).catch(err=>{
            if(err == 1){
                res.status(503).send("Unable to reach database")
            }
            else{
                res.status(401).send("Unable to find such a user")
            }
            return;
        })
    }).catch(err=>{
        res.status(401).send(err)
        return;
    })
})
export default user