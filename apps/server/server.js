const express = require('express');
const recipeRouter = require("./routes/recipe")
const ingredientRouter = require("./routes/ingredient")

require('dotenv').config();

const app = express();

// Middleware
// Parse all data into JSON and store it in req
app.use(express.json())
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
})

app.use("/api/recipe", recipeRouter)
app.use("/api/ingredient", ingredientRouter)

app.listen(process.env.PORT, () => {
    console.log('Server is running on http://localhost:' + process.env.PORT);
});