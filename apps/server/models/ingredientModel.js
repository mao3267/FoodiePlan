const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ingredientSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true,
        trim: true
    },
    usedInRecipes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Recipe'
    }]

}, { timestamps: true })

module.exports = mongoose.model('Ingredient', ingredientSchema);