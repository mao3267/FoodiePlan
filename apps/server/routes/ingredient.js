const express = require('express');

const router = express.Router();


router.get('/', (req, res) => {
    res.json({ msg: "Get all ingredients" });
})

router.post('/', (req, res) => {
    res.json({ msg: "Create a new ingredient" });
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