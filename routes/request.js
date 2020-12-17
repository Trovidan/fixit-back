import dotenv from "dotenv"
import express from 'express'
import { doesExist, generateToken } from "../utitlity.js"
import jwt from 'jsonwebtoken'
import Provider from "../models/provider.js"
import Customer from "../models/customer.js"
import provider from "../models/provider.js"

dotenv.config({ silent: process.env.NODE_ENV === "production" })
const SECRET_KEY = process.env.SECRET_KEY || "q!wq!w@e3R$t%y^u7*i(u)i*o_p+(@e3R$t%y^u7*q!w@e3R$t%y^u7*i(u)i*o_p+(i(u)i*o_p+("
const request = express.Router()
const PENDING = process.env.PENDING
const ACCEPTED = process.env.ACCEPTED
const CUSTOMER = process.env.CUSTOMER
const PROVIDER = process.env.PROVIDER

request.post('/add',(req,res)=>{
    // let { token } = req.cookies
    let {token} = req.cookies
    let {providerID} = req.body
    
    if (!doesExist(token) || !doesExist(providerID)) {
        res.status(400).send('improper request')
        return;
    }

    jwt.verify(token, SECRET_KEY, (err,decoded)=>{
    
        if(err){
            res.status(400).send("Token expired!")
            return;
        }
        if (decoded.status !== CUSTOMER) {
            res.status(400).send("Only Customer can Request Service!")
            return;
        }
        let update = {
            $addToSet: {
                requests: { _id:providerID, status: PENDING}
            }
        }
        Customer.findByIdAndUpdate(decoded._id, update, {runValidators: true,new:true}, (err,doc)=>{
            if(err){
                res.status(404).send("Invalid parameters in request")
                return;
            }
            if(!doc){
                res.status(400).send('improper request')
                return;
            }
            update = {
                $addToSet: {
                    requests: { _id: decoded._id, status: PENDING }
                }
            }
            provider.findByIdAndUpdate(providerID,update,{ runValidators: true, new: true }, (err, doc2)=>{
                if (err) {
                    res.status(503).send("Server Under Maintainance!")
                    return;
                }   
                res.status(200).send(doc.requests)
                return;
            })
            
        })
    })
})

request.post('/delete', (req, res) => {
    // let { token } = req.cookies
    let { token } = req.cookies
    let { providerID } = req.body

    if (!doesExist(token) || !doesExist(providerID)) {
        res.status(400).send('improper request')
        return;
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {

        if (err) {
            res.status(400).send("Token expired!")
            return;
        }
        if (decoded.status !== CUSTOMER) {
            res.status(400).send("Only Customer can Request Service!")
            return;
        }
        let update = {
            $pull: {
                requests: { _id: providerID, status: PENDING }
            }
        }
        Customer.findByIdAndUpdate(decoded._id, update, { runValidators: true, new: true }, (err, doc) => {
            if (err) {
                res.status(404).send("Invalid parameters in request")
                return;
            }
            if (!doc) {
                res.status(400).send('improper request')
                return;
            }
            update = {
                $pull: {
                    requests: { _id: decoded._id, status: PENDING }
                }
            }
            provider.findByIdAndUpdate(providerID, update, { runValidators: true, new: true }, (err, doc2) => {
                if (err) {
                    res.status(503).send("Server Under Maintainance!")
                    return;
                }
                res.status(200).send(doc.requests)
                return;
            })

        })
    })
})

request.post('/accept', (req, res) => {
    let { token } = req.cookies
    let { customerID } = req.body

    if (!doesExist(token) || !doesExist(customerID)) {
        res.status(400).send('improper request')
        return;
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {

        if (err) {
            res.status(400).send("Token expired!")
            return;
        }
        if (decoded.status !== PROVIDER) {
            res.status(400).send("Only Provider can accept service!")
            return;
        }
        let filter = {
            "_id": customerID,
            "requests._id" : decoded._id
        }
        let update = {
            $set : {"requests.$.status": ACCEPTED}
        }
        Customer.findOneAndUpdate(filter, update, { runValidators: true, new: true }, (err, doc) => {
            if (err) {
                console.log(err);
                res.status(404).send("Invalid parameters in request")
                return;
            }
            if (!doc) {
                res.status(400).send('improper request')
                return;
            }
            filter = {
                "_id": decoded._id,
                "requests._id": customerID
            }
            let update = {
                $set: { "requests.$.status": ACCEPTED }
            }
            provider.findOneAndUpdate(filter, update, { runValidators: true, new: true }, (err, doc2) => {
                if (err) {
                    res.status(503).send("Server Under Maintainance!")
                    return;
                }
                res.status(200).send(doc2.requests)
                return;
            })
        })
    })
})

request.post('/deny', (req, res) => {
    
    let { token } = req.cookies
    let { customerID } = req.body

    if (!doesExist(token) || !doesExist(customerID)) {
        res.status(400).send('improper request')
        return;
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {

        if (err) {
            res.status(400).send("Token expired!")
            return;
        }
        if (decoded.status !== PROVIDER) {
            res.status(400).send("Only Customer can Request Service!")
            return;
        }
        let update = {
            $pull: {
                requests: { _id: decoded._id, status: PENDING }
            }
        }
        Customer.findByIdAndUpdate(customerID, update, { runValidators: true, new: true }, (err, doc) => {
            if (err) {
                res.status(404).send("Invalid parameters in request")
                return;
            }
            if (!doc) {
                res.status(400).send('improper request')
                return;
            }
            update = {
                $pull: {
                    requests: { _id: customerID, status: PENDING }
                }
            }
            provider.findByIdAndUpdate(decoded._id, update, { runValidators: true, new: true }, (err, doc2) => {
                if (err) {
                    res.status(503).send("Server Under Maintainance!")
                    return;
                }
                res.status(200).send(doc2.requests)
                return;
            })

        })
    })
})

export default request