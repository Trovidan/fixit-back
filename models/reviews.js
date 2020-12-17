import mongoose from 'mongoose'
import customer from './customer.js'
import provider from './provider.js'
import { doesExist } from './validators.js'

const reviewSchema = new mongoose.Schema({
    _id: String,
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required:true,
        validate: (v) => doesExist(customer, v)
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true,
        validate: (v) => doesExist(provider, v)
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        default: 1
    }
})

export default mongoose.model('Review', reviewSchema)