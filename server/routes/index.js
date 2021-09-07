// Use express's router to route all our API endpoints
const path = require('path');
const express = require("express");
const router = express.Router();
const ruleFunctions = require('../strategies/ruleFunctions');
const socketIO = require('socket.io');

const needle = require('needle') //http client to make our requests
const config = require('dotenv').config() //to use .env file - to get token
const TOKEN = process.env.TWITTER_BEARER_TOKEN

// POST Request - set the rules array, stream tweets
router.post("/",  async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    console.log("REAL-TIME TWITTER FEED POST REQUEST");

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
    res.status(200);
});

// POST Request - get recent tweets for sentiment analysis
router.post("/sentiment",  async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    console.log("SENTIMENT ANALYSIS POST REQUEST");

    //get user inputted keyword to search
    var query = req.body.query;
    //const tweetURL = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=20`
    const tweetURL = `https://api.twitter.com/2/tweets/search/recent?query=${query}%20-is:retweet%20-is:reply&max_results=20`  //exclude retweets and replies, '-' is negation

    const response = await needle('get', tweetURL, { //specified in needle documentation
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    //console.log(response.body.data);

    res.status(200).json(response.body.data); //return 20 most recent tweets of the query
});


module.exports = router;