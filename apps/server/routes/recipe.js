const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.json({ msg: "Get all recipes" });
})

router.post('/', (req, res) => {
    res.json({ msg: "Create a new recipe" });
})

router.get('/:id', (req, res) => {
    res.json({ msg: "Get a single recipe: " + req.params.id })
})

router.delete('/:id', (req, res) => {
    res.json({ msg: "Delete a single recipe: " + req.params.id })
})

router.patch('/:id', (req, res) => {
    res.json({ msg: "Update a single recipe: " + req.params.id })
})

module.exports = router

