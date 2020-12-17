import dotenv from "dotenv"
import express from 'express'
import { doesExist, decodeJWT, ReviewDelete, CustomerUpdate, ProviderUpdate, ReviewUpdate, Reviewfetch } from "../utitlity.js"
import jwt from 'jsonwebtoken'
import Provider from "../models/provider.js"
import Customer from "../models/customer.js"
import Review from "../models/reviews.js"
import customer from "../models/customer.js"

dotenv.config({ silent: process.env.NODE_ENV === "production" })
const SECRET_KEY = process.env.SECRET_KEY || "q!wq!w@e3R$t%y^u7*i(u)i*o_p+(@e3R$t%y^u7*q!w@e3R$t%y^u7*i(u)i*o_p+(i(u)i*o_p+("
const review = express.Router()
const PENDING = process.env.PENDING
const ACCEPTED = process.env.ACCEPTED
const CUSTOMER = process.env.CUSTOMER
const PROVIDER = process.env.PROVIDER

review.post('/add',(req, res)=>{
    let { token } = req.cookies
    let { providerID, title, content, rating } = req.body

    //console.log(token);
    //console.log(providerID)
    //console.log(title)
    //console.log(content);
    //console.log(rating);
    if (!doesExist(token) || !doesExist(providerID) || !doesExist(title) || !doesExist(content) || !doesExist(rating)) {
        res.status(400).send('improper request')
        return;
    }
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {

        if (err) {
            res.status(400).send("Token expired!")
            return;
        }
        if (decoded.status !== CUSTOMER) {
            res.status(400).send("Only Customer can Review Service!")
            return;
        }

        let review = {
            _id: `${decoded._id}/review/${providerID}`,
            title: title,
            rating: rating,
            content: content,
            customer: decoded._id,
            provider: providerID
        }

        Review.insertMany([review], (err, docs) => {
            if (err || !docs) {
                //console.log(err);
                res.status(400).send("Unable to add review")
                return;
            }
            let filter = {
                "_id": decoded._id,
                "requests._id": providerID
            }
            let update = {
                $set: { "requests.$.reviewID": { _id: review._id} },
                $addToSet: { reviews: { _id: review._id }}
            }
            console.log(filter);
            customer.findOne({ "requests._id": providerID}, (err,doc)=>{
                console.log(doc);
            })
            Customer.findOneAndUpdate(filter, update, { runValidators: true, new: true }, (err, doc) => {
                if (err || !doc) {
                    filter={
                        _id: review._id,
                    }
                    ReviewDelete(filter).catch(err=>{
                        //console.log(err);
                    })
                    res.status(400).send("Customer must be in touch with Provider!")
                    return;
                }

                update = {
                    $addToSet: { reviews: {_id: review._id} },
                    $inc: { totalReview: 1, totalReviewPoint:review.rating},
                }
                Provider.findOneAndUpdate({ _id: providerID }, update, { runValidators: true, new: true }, (err, doc) => {
                    if (err || !doc) {
                        //add method to rollback
                        res.status(400).send("Unable to add review in provider")
                        return;
                    }
                    let newRating = doc.totalReviewPoint/doc.totalReview;
                    update = {
                        $set: {rating: newRating}
                    }
                    Provider.findOneAndUpdate({ _id: providerID }, update, { runValidators: true, new: true }, (err, doc) => {
                        if (err || !doc) {
                            //add method to rollback
                            res.status(400).send("Unable to add review in provider")
                            return;
                        }
                        res.status(202).send("Added successfully")
                        return;
                    })
                })
            })
        })     
    })  
})

review.post('/delete', (req,res)=>{
    let { token } = req.cookies
    let { reviewID, providerID} = req.body
    if(!doesExist(token) || !doesExist(reviewID) || !doesExist(providerID)){
        res.status(400).send("incomplete parameters")
        return
    }
    decodeJWT(token).then(decoded=>{
        if(decoded.status!= CUSTOMER){
            res.status(400).send("Only Customer could delete Review");
            return;
        }
        let filter = {
            _id: decoded._id,
            "requests._id" : providerID
        }
        let update = {
            $set: { "requests.$.reviewID": { _id: null} },
            $pull: { reviews: { _id: reviewID } }
        }
        CustomerUpdate(filter, update, {runValidators:false, new: true}).then(doc=>{
            filter = {
                _id: reviewID,
                customer: decoded._id
            }
            ReviewDelete(filter).then(review => {
                
                filter = {
                    _id: providerID
                }
                update = {
                    $pull: { reviews: { _id: review._id } },
                    $inc: {totalReview: -1, totalReviewPoint: -review.rating}
                }

                ProviderUpdate(filter,update, {runValidators:false, new:true}).then(provider=>{
                    update = {
                        $set: {
                            rating: provider.totalReview? (provider.totalReviewPoint / provider.totalReview) : 0
                        }
                    }
                    ProviderUpdate(filter, update, { runValidators: false, new: true }).then(provider=>{
                        res.status(203).send("Review Removed");
                        return;
                    })
                }).catch(err=>{
                    if (err == 1) {
                        res.status(503).send("Unable to reach provider db! ");
                    }
                    else if (err == 2) {
                        res.status(400).send("unable to update provider!");
                    }
                })

            }).catch(err => {
                if (err == 1) {
                    res.status(503).send("unable to reach review db! ");
                }
                else if (err == 2) {
                    res.status(400).send("Such Review Doesn't Exist");
                }
            })
        }).catch(err=>{
            if (err == 1) {
                res.status(503).send("unable to reach customer db! ");
            }
            else if (err == 2) {
                res.status(400).send("Review Doesn't Exist");
            }
        })
        
    }).catch(err=>{
        res.status(200).send(err);
    })
})

review.post('/edit', (req, res) => {
    let { token } = req.cookies
    let { reviewID, providerID, title, content, rating } = req.body

    if (!doesExist(token) || !doesExist(reviewID) || !doesExist(providerID) || !doesExist(title) || !doesExist(rating) || !doesExist(content)) {
        res.status(400).send("incomplete parameters")
        return;
    }
    //console.log("editing");
    decodeJWT(token).then(decoded => {
        if (decoded.status != CUSTOMER) {
            res.status(400).send("Only Customer could edit Review");
            return;
        }
        //console.log("token decoded");
        let update = {
            $set: {
                title: title,
                rating: rating,
                content: content
            }
        }

        let filter = {
            _id: reviewID,
            customer: decoded._id
        }
        //console.log("updating review");
        ReviewUpdate(filter,update,{new: false, runValidators: true}).then(review => {
            //console.log("review updated");
            filter = {
                _id: providerID
            }
            update = {
                $inc: {totalReviewPoint: rating-review.rating }
            }
            //console.log("updating rating points");
            ProviderUpdate(filter, update, { runValidators: false, new: true }).then(provider => {
                //console.log("updated raitng");
                update = {
                    $set: {
                        rating: provider.totalReviewPoint / provider.totalReview
                    }
                }
                //console.log("updating rating");
                ProviderUpdate(filter, update).then(provider => {
                    //console.log("editing complete");
                    res.status(203).send("Review edited");
                    return;
                }).catch(err => {
                    //console.log("error in rating updation");

                    if (err == 1) {
                        res.status(503).send("unable to reach review db! ");
                    }
                    else if (err == 2) {
                        res.status(400).send("Such Review Doesn't Exist");
                    }
                })
            }).catch(err => {
                //console.log("encountered error in provider");
                if (err == 1) {
                    res.status(503).send("Unable to reach provider db! ");
                }
                else if (err == 2) {
                    res.status(400).send("unable to update provider!");
                }
            })

        }).catch(err => {
            //console.log("error in review updation");
            
            if (err == 1) {
                res.status(503).send("unable to reach review db! ");
            }
            else if (err == 2) {
                res.status(400).send("Such Review Doesn't Exist");
            }
        })

    }).catch(err => {
        //console.log("error while decoding");
        res.status(200).send(err);
    })
})

review.post('/fetch',(req,res)=>{
    let {ids} = req.body
    
    if(!doesExist(ids)){
        res.send(400).send("Review Id's required!!!")
        return;
    }

    let filter = {
        _id: {$in:ids}
    }

    Reviewfetch(filter).then(reviews=>{
        res.status(200).send(reviews)
        return;

    }).catch(err=>{
        if (err == 1) {
            res.status(503).send("Unable to reach reviews db! ");
            return 
        }
        else if (err == 2) {
            res.status(400).send("unable to fetch reviews!");
            return 
        }
    })
})

export default review