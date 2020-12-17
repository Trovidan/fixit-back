import mongoose from 'mongoose'
import chat from './chat.js'
import customer from './customer.js'
import provider from './provider.js'
import { doesExist } from './validators.js'

const messageSchema = new mongoose.Schema({
    chatID: {
        type: String,
        ref: 'Chat',
        validate: (v) => doesExist(chat, v)
    },
    sender: {
        type: String,
        ref: 'Provider',
        validate: (v) => {
            return (doesExist(provider, v) || doesExist(customer, v))
        }
    },
    receiver: {
        type: String,
        ref: 'Provider',
        validate: (v) => {
            return (doesExist(provider, v) || doesExist(customer, v))
        }
    },
    content: String
},{timestamps:true})

export default mongoose.model('Message', messageSchema)