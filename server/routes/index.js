const path = require('path');
const express = require("express");
const router = express.Router();
const ruleFunctions = require('../strategies/ruleFunctions');
const socketIO = require('socket.io');
const RecentSearch = require('../models/recentSearch')
const needle = require('needle')
const config = require('dotenv').config() 
const TOKEN = process.env.TWITTER_BEARER_TOKEN

// POST Request - set the rules array, stream tweets
router.post("/",  async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

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
    //   // remove the connection listener for any subsequent 
    //   // connections with the same ID
    //   io.removeAllListeners('connection'); 
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
  const tweetURL = `https://api.twitter.com/2/tweets/search/recent?query=${query}%20-is:retweet%20-is:reply&max_results=20`  //exclude retweets and replies, '-' is negation

  const response = await needle('get', tweetURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  })
  res.status(200).json(response.body.data); //return 20 most recent tweets of the query
});

// GET request - return ALL recent searches stored in mongoDB
router.get("/getRecentSearches",  async (req, res) => {
  try {
  const recentSearches = await RecentSearch.find(); 
  console.log("recentSearches: " + recentSearches);
  res.send(recentSearches);
  } 
  catch(err) {
  res.status(500).json({ message: err.message }); 
  }
});

// POST request - add recent search to be stored in mongoDB
router.post("/addRecentSearch",  async (req, res) => {
  console.log("ADDRECENTSEARCH");
  console.log(req.body.value);
  //create db model, populate with req from client
  const recentSearch = new RecentSearch({
  value: req.body.value
  })
  //save model in database -> asynchronous
  try {
  const newRecentSearch = await recentSearch.save(); 
  res.status(201).json(newRecentSearch); 
  }
  catch (err) {
  res.status(400).json({ message: err.message });
  }
});

//delete specified recent search
router.post("/deleteRecentSearch", getRecentSearch, async (req, res) => {
  try {
  //try to remove 
  console.log("deleteRecentSearch")
  console.log(res.recentSearch);
  await res.recentSearch.remove()
  res.json({ message: 'Deleted recent search' })
  } 
  catch (err) {
  res.status(500).json({ message: err.message })
  }
});

//TODO: update frontend and backend to delete by id, not value
//middleware to get specific recent search by value, next is callback function to call after
async function getRecentSearch(req, res, next) {
  let recentSearch
  try {
  console.log("GETRECENTSEARCH")
  console.log(req.body.value);
  //recentSearch = await RecentSearch.findById(req.params.id)
  recentSearch = await RecentSearch.findOne({ value: req.body.value })
  if (recentSearch == null) {
    return res.status(404).json({ message: 'Cannot find recentSearch' })
  }
  //console.log(recentSearch);
  }
  catch (err) {
  return res.status(500).json({ message: err.message })
  }

  res.recentSearch = recentSearch //so all the other functions can just call res.recentSearch for the set recentSearch
  //call next function (deleteRecentSearch, etc.)
  next()
}

module.exports = router;