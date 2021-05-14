const path = require('path');
const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../', 'client', 'index.html'))
    //res.send({ response: "I am alive" }).status(200);
})

module.exports = router;