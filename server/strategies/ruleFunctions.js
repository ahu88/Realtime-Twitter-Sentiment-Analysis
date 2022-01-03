const http = require('http') 
const express = require('express') 
const socketIO = require('socket.io')

const needle = require('needle') 
const config = require('dotenv').config() 
const TOKEN = process.env.TWITTER_BEARER_TOKEN

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'

//1) get stream rules
async function getRules() {
  const response = await needle('get', rulesURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  })
  return response.body
}

//2) set stream rules
async function setRules(rules) {
  const data = {
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
  if (!Array.isArray(rules.data)){ 
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
  //make request to stream url -> get stream
  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  })

  //Attach event handlers on the stream
  stream.on('data', (data) => {
    try {
      //data is a buffer -> need to parse to json
      const json = JSON.parse(data)
      //emit a 'tweet' event to communicate between client and backend + pass tweet data
      socket.emit('tweet', json)
    } 
    catch(error) {
      console.log("error" + data)
    }
  })
}

module.exports.getRules = getRules;
module.exports.setRules = setRules;
module.exports.deleteRules = deleteRules;
module.exports.streamTweets = streamTweets;