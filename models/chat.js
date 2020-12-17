import mongoose from 'mongoose'
import customer from './customer.js'
import message from './message.js'
import provider from './provider.js'

const messageSchema = new mongoose.Schema({
    id: {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'Message',
            validate: (v) => doesExist(message, v),
            required: true
        }
})
const chatSchema = new mongoose.Schema({
    customer: {
        type: String,
        ref: "Customer",
        validate: (v) => doesExist(customer, v)
    },
    provider: {
        type: String,
        ref: 'Provider',
        validate: (v) => doesExist(provider, v)
    },
    message: {
        type: [messageSchema]
    },
})

export default mongoose.model('Chat', chatSchema)