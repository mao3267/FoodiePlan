const mongoose = require('mongoose')

const Schema = mongoose.Schema

const recipeIngredientSchema = new Schema({
    ingredientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true,
        index: true
    },
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
}, { id: false })

const recipeSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    servings: {
        type: Number,
        required: true
    },
    ingredients: [recipeIngredientSchema]
},
    { timestamps: true })

module.exports = mongoose.model('Recipe', recipeSchema)