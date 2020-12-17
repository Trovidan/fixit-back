import dotenv from "dotenv";
import express from 'express';
import { doesExist, decodeJWT, ProviderUpdate } from "../utitlity.js";
import Provider from "../models/provider.js";

dotenv.config({ silent: process.env.NODE_ENV === "production" })
const user = express.Router()
const PROVIDER = process.env.PROVIDER

user.post("/fetch", (req, res) => {
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
        if (Array.isArray(fieldOptions) && fieldOptions.length > 0) {
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

    if (experience > 0) {
        filter["experience.years"] = { $gte: experience }
    }
    if (rating > 0) {
        filter["rating"] = { $gte: rating }
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

user.post('/update', (req, res) => {
    let { token } = req.cookies
    let { name, email, contactNumber, address, city, state, password, gender } = req.body


    if (!doesExist([name, email, contactNumber, address, city, state, token, gender])) {
        console.log(req.body);
        res.status(400).send("incomplete request")
        return
    }

    decodeJWT(token).then(decoded => {
        if (decoded.status != PROVIDER) {
            res.status(401).send("Only provider Can edit provider details")
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
        if (doesExist(password)) {
            update["password"] = password
        }
        ProviderUpdate(filter, update).then(doc => {
            doc.password = undefined
            res.status(202).send(doc)
            return
        }).catch(err => {
            if (err == 1) {
                res.status(503).send("Unable to reach database")
            }
            else {
                res.status(401).send("Unable to find such a user")
            }
            return;
        })
    }).catch(err => {
        res.status(401).send(err)
        return;
    })
})

export default user