import mongoose from 'mongoose'
import chat from './chat.js'
import customer from './customer.js'
import reviews from './reviews.js'
import { doesExist } from './validators.js'

const reviewSchema = new mongoose.Schema({
    _id: {
        type: String,
        ref: 'Review',
        validate: (v) => doesExist(reviews, v),
    }
})

const chatSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Chat',
        validate: (v) => doesExist(chat, v)
    }
})

const customerSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        validate: (v) => doesExist(customer, v)
    },
    status: {
        type: String,
        default: "PENDING"
    }
})

const providerSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
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
    service: {
        type: String,
        default: null
    },
    city: String,
    state: String,
    imageUri: String,
    chargesHr: Number,
    chargesDay: Number,
    description: {
        type: String,
        default: "I have been in this field for quite a long time and have a ton of experience in the serivces I offer, the charges are rigid and are definetly negotiable and vary with complexity of work.<br/>Now, here goes some work specifics of the provider to give the customer an idea of his experties like for eletrician kind of machines he is good with, for maid her speciality like cooking or cleaning. "
    },
    rating: {
        type: Number,
        default: null
    },
    totalReview: {
        type: Number,
        default: 0
    },
    totalReviewPoint: {
        type: Number,
        default: 0
    },
    experience: {
        years:{type: Number, min:0, max:60},
        months:{type:Number, min:0, max:11}
    },
    requests: {
        type: [customerSchema],
        default: []
    },
    chats: [chatSchema],
    reviews: [reviewSchema]
})

export default mongoose.model('Provider', providerSchema)