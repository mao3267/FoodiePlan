const express = require('express');
const ingredientModel = require('../models/ingredientModel');
const router = express.Router();


router.get('/', (req, res) => {
    res.json({ msg: "Get all ingredients" });
})

router.post('/', (req, res) => {
    try {
        const { name, quantity, unit } = req.body
        const ingredient = ingredientModel.create({ name, quantity, unit })
        res.status(200).json(ingredient)
    } catch (error) {
        res.status(400).json({ "error": error.message })
    }
})

router.delete('/:id', (req, res) => {
    res.json({ msg: "Delete a single ingredient: " + req.params.id })
})

router.get('/:id', (req, res) => {
    res.json({ msg: "Get a single ingredient: " + req.params.id })
})

router.patch('/:id', (req, res) => {
    res.json({ msg: "Update a single ingredient: " + req.params.id })
})



module.exports = router;