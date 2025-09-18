const express = require('express');
require('dotenv').config();

const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
})

app.listen(process.env.PORT, () => {
    console.log('Server is running on http://localhost:' + process.env.PORT);
});