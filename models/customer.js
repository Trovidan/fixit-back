import mongoose from 'mongoose'
import provider from './provider.js'
import { doesExist } from './validators.js'
import reviews from './reviews.js'
import chat from './chat.js'

const reviewSchema = new mongoose.Schema({
    _id: {
        type: String,
        ref: 'Review',
        validate: (v) => doesExist(reviews, v)
    }
})

const chatSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Chat',
        validate: (v) => doesExist(chat, v)
    }
})

const providerSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        validate: (v) => doesExist(provider, v)
    },
    status: {
        type: String,
        default: "PENDING"
    },
    reviewID: {
        type: reviewSchema,
        default: null
    }
})


const customerSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required:true
    }, 
    password: {
        type: String,
        required:true
    },
    contactNumber: {
        type: String,
        unique: true
    },
    address: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        default: "others"
    },
    city: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    },
    requests: {
        type: [providerSchema],
        default: []
    },
    favorites: [providerSchema],
    chats: [chatSchema],
    reviews: [reviewSchema]
})

export default mongoose.model('Customer', customerSchema)