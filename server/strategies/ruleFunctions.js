//add socket.io -> allows use of web sockets, open door connection between server and client (basic html + javascript, React (build folder?), Angular ...)
const http = require('http') 
const express = require('express') //easier to load page
const socketIO = require('socket.io')

const needle = require('needle') //http client to make our requests
const config = require('dotenv').config() //to use .env file - to get token
const TOKEN = process.env.TWITTER_BEARER_TOKEN

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id' //by default tweets return id and text, can add query to add more, such as retweets + likes

//const rules = [{value: 'demon slayer'}]


//3 separate functions for the rules:
//1) get stream rules -> using needle + PROMISES
async function getRules() {
    console.log("GET RULES");

    const response = await needle('get', rulesURL, { //specified in needle documentation
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })
    //console.log(response)
    return response.body
}

//2) set stream rules
async function setRules(rules) {
    console.log(`SET RULES: ${rules}`);

    const data = { //specified in the twitter api documentation
        add: rules
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type' : 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })

    return response.body
}

//3) delete stream rules
async function deleteRules(rules) {
    console.log("DELETE RULES");
    if (!Array.isArray(rules.data)){ //rules.data needs to be an array!
        return null
    }

    const ids = rules.data.map((rule) => rule.id)

    const data = { 
        delete: {
           ids: ids 
        }
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type' : 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })

    return response.body
}

function streamTweets(socket) {
    console.log("STREAM RULES");

    //make request to stream url -> get stream
    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    //Attach event handlers on the stream https://www.w3schools.com/jquery/event_on.asp, 'data' is the event, (data) is the function to run when the event occurs (i.e. gives us the data)
    //data is a buffer -> need to parse to json
    stream.on('data', (data) => {
        try {
            const json = JSON.parse(data)
            
            //emit an event called tweet, how to communicate between client and backend -> send an event ('tweet') to client, and pass data along (tweets)
            socket.emit('tweet', json)
            //console.log(json)
        } catch(error) {
            //console.log(error)
            console.log("error" + data)
        }
    })
}

//export the functions as modules so that they can be reused by other parts of the code (i.e. in index.js)
module.exports.getRules = getRules;
module.exports.setRules = setRules;
module.exports.deleteRules = deleteRules;
module.exports.streamTweets = streamTweets;