const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "blocked"],
        default: "active",
    },
    habits: [
        {
            id: { type: String },
            name: { type: String, required: true },
            category: { type: String, default: "health" },
            completed: { type: Boolean, default: false },
            streak: { type: Number, default: 0 },
            flagged: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true
})

const user = mongoose.model('User', userSchema)
module.exports= user 