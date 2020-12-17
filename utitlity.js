import dotenv from "dotenv";
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import jwt from 'jsonwebtoken'
import Provider from "./models/provider.js"
import Customer from "./models/customer.js"
import Review from "./models/reviews.js"

dotenv.config({ silent: process.env.NODE_ENV === "production" })
const SECRET_KEY = process.env.SECRET_KEY || "q!wq!w@e3R$t%y^u7*i(u)i*o_p+(@e3R$t%y^u7*q!w@e3R$t%y^u7*i(u)i*o_p+(i(u)i*o_p+("

export const doesExist = (values)=>{
    let rv = true
    if(!Array.isArray(values)){
        if(values){
            return true
        }
        return false
    }
    values.map(val => {
        if(val === undefined){
            rv = false
        }
        return true
    })
    return rv
}

export const generateToken = (details)=>{
    return jwt.sign(details, SECRET_KEY, {expiresIn: '30d'})
}

export const decodeJWT = (token)=>{
    return new Promise((resolve,reject)=>{
        jwt.verify(token, SECRET_KEY, (err,decoded)=>{
            if(err){
                reject("Invalid Token");
            }
            else{
                resolve(decoded);
            }
        })
    })
}

export const ReviewUpdate = (filter, update, options = { new: true, runValidators: true }) => {
    if (!doesExist(filter) || !doesExist(update)) {
        return "Improper update Request"
    }
    return new Promise((resolve, reject) => {
        Review.findOneAndUpdate(filter, update, options, (err, doc) => {
            if (err) {
                console.log(err)
                reject(1)
            }
            if (!doc) {
                console.log(doc)
                reject(2)
            }
            resolve(doc)
        })
    })
}

export const ReviewDelete = (filter, options = "") =>{
    if(!doesExist(filter)){
        return "Improper Delete Request"
    }

    return new Promise ((resolve,reject)=>{
        Review.findOneAndDelete(filter, options, (err,doc)=>{
            if(err){
                reject(1)
            }
            if(!doc ){
                reject(2) 
            }
            resolve(doc)
        })
    })
}

export const Reviewfetch = (filter, options = "") => {
    if (!doesExist(filter)) {
        return "Improper fetch Request"
    }

    return new Promise((resolve, reject) => {
        Review.find(filter, options, (err, docs) => {
            if (err) {
                reject(1)
            }
            if (!docs) {
                reject(2)
            }
            resolve(docs)
        })
    })
}


export const CustomerUpdate = (filter, update, options={new: true, runValidators: true})=>{
    if (!doesExist(filter) || !doesExist(update)) {
        return "Improper update Request"
    }

    return new Promise((resolve,reject)=>{
        Customer.findOneAndUpdate(filter,update,options, (err,doc)=>{
            if (err) {
                console.log(err)
                reject(1)
            }
            if (!doc) {
                console.log(doc)
                reject(2)
            }
            resolve(doc)
        })
    })
}

export const ProviderUpdate = (filter, update, options = { new: true, runValidators: true }) => {
    if (!doesExist(filter) || !doesExist(update)) {
        return "Improper update Request"
    }

    return new Promise((resolve, reject) => {
        Provider.findOneAndUpdate(filter, update, options, (err, doc) => {
            if (err) {
                console.log(err)
                reject(1)
            }
            if (!doc) {
                reject(2)
            }
            resolve(doc)
        })
    })
}