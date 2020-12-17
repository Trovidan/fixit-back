import dotenv from "dotenv";
import express from 'express';
import { doesExist, generateToken } from "../utitlity.js";
import jwt from 'jsonwebtoken'
import Provider from "../models/provider.js";
import Customer from "../models/customer.js";

const fetch = express.Router()

fetch.post("/provider", (req, res) => {
    // console.log("fetching books");
    let { service, experience, rating, gender, projection, sortby, limit, skip, ids } = req.body;
    let filter = {};

    //default options
    sortby = sortby === undefined ? '-rating' : sortby;
    limit = limit === undefined ? 12 : limit;
    skip = skip === undefined ? 0 : skip;
    projection = projection === undefined ? "" : projection;

    const addFilter = (fieldOptions, fieldName) => {
        let temp = [];
        if (Array.isArray(fieldOptions) && fieldOptions.length>0) {
            fieldOptions.map(field => {
                if (field.selected === true) {
                    temp.push(field.title);
                }
            });
            if (temp.length > 0) {
                filter[fieldName] = {
                    $in: temp
                };     
            }
        }
    }

    addFilter(service, "service");
    addFilter(gender, "gender");

    if (Array.isArray(ids) && ids.length > 0) {
        filter["_id"] = {
            $in: ids
        };
    }

    if(experience > 0){
        filter["experience.years"] = {$gte: experience}
    }
    if(rating > 0){
        filter["rating"] = {$gte: rating}
    }
    // console.log(filter);
    Provider.find(filter, projection, { sort: sortby, limit: limit, skip: skip }, (err, docs) => {
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

});


fetch.post('/customer', (req,res)=>{
    let {ids} = req.body;
    let filter;
    if (Array.isArray(ids) && ids.length > 0) {
        filter= {
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

export default fetch