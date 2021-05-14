const http = require('http') 
const express = require('express') 
const socketIO = require('socket.io')

const needle = require('needle') 
const config = require('dotenv').config() 
const TOKEN = process.env.TWITTER_BEARER_TOKEN
const PORT = process.env.PORT || 4001
const index = require("./routes/index");

const app = express() 
app.use(index) 

const server = http.createServer(app) //want to listen to this server
//FOR USING REACT CLIENT
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000", //client endpoint
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
})
//const io = socketIO(server) 

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id' 

const rules = [{value: 'anime'}]

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
async function setRules() {
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
    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAAPtGPAEAAAAA1TnVkUnuELQcbZpqUt%2F5j7ZdoCE%3D8A59EuclpznwaOqAYWWtggq3t9H0rEtDIfS6I5RnAxT4766drb`
        }
    })

    stream.on('data', (data) => {
        try {
            const json = JSON.parse(data)
            socket.emit('tweet', json)
        } catch(error) {
            //console.log(error)
            //console.log(data)
        }
    })
}

//add event handler for socket io -> runs when client connects
io.on('connection', async () => {
    console.log('Client connected')
    let currentRules

    try {
        currentRules = await getRules()
        await deleteRules(currentRules)
        await setRules()
    } catch (err) {
        console.error(err)
        process.exit(1)
    }

    //pass in socket 
    streamTweets(io)
})

io.on('disconnect', () =>{
    console.log('Client DISCONNECTED')
})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))