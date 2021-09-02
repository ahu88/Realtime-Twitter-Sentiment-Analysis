// Use express's router to route all our API endpoints
const path = require('path');
const express = require("express");
const router = express.Router();
const ruleFunctions = require('../strategies/ruleFunctions');
const socketIO = require('socket.io');

//*** MAYBE ISSUE WITH ASYNC FOR HANDLING POST REQUESTS - USE PROMISES INSTEAD??? https://stackoverflow.com/questions/56119131/node-js-and-express-wait-for-asynchronous-operation-before-responding-to-http-r */
// POST Request - set the rules array, stream tweets
router.post("/",  async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    console.log("POST MALONE");

    var rulesArray = [];
    var rules = req.body.rules;
    var rulesJson = {value: `${rules}`}

    rulesArray.push(rulesJson);

    let socket_id = [];
    var io = req.app.get('socketio');

    console.log(`Rules: ${rules}`);
    console.log(`RulesArray: ${rulesArray}`);

    //add event handler for socket io -> runs when client connects
    //io.on('connection', async () => {
        console.log('Client connected')
        let currentRules
        
        // socket_id.push(io.id);
        // if (socket_id[0] === io.id) {
        //     // remove the connection listener for any subsequent 
        //     // connections with the same ID
        //     io.removeAllListeners('connection'); 
        // }

        try {
            //get all stream rules
            currentRules = await ruleFunctions.getRules()

            //delete all stream rules
            await ruleFunctions.deleteRules(currentRules)

            //set rules base on rules array
            await ruleFunctions.setRules(rulesArray)
        
        } catch (err) {
            console.error(err)
            process.exit(1)
        }

        //pass in socket 
        ruleFunctions.streamTweets(io)

    //})

});


module.exports = router;