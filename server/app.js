//add socket.io -> allows use of web sockets, open door connection between server and client (basic html + javascript, React (build folder?), Angular ...)
const http = require('http') 
const express = require('express')
const socketIO = require('socket.io')
//const cors = require('cors');

const needle = require('needle') //http client to make our requests
const config = require('dotenv').config() //to use .env file - to get token
const TOKEN = process.env.TWITTER_BEARER_TOKEN
const PORT = process.env.PORT || 4001
const index = require("./routes/index");

const app = express() //initialize express

//to extract information from POST requests
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({extended:true})); // to support URL-encoded bodies

app.use(index) //points to routes defined in index.js

//to allow front end to make api calls to back end
//app.use(cors());
// app.use(
//     cors({
//       origin: ["http://localhost:3000"],
//       credentials: true,
//     })
//   );
// const corsOptions ={
//     origin:'http://localhost:3000', 
//     credentials:true,            //access-control-allow-credentials:true
//     optionSuccessStatus:200
// }
// app.use(cors(corsOptions));

//set up server + sockets
const server = http.createServer(app) //want to listen to this server

//FOR USING REACT CLIENT
var io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000", //client endpoint
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
})

/* store a reference to the io object so that it can be used in routes !!! */
app.set('socketio', io);





// const rules = [{value: 'demon slayer'}]

// const ruleFunctions = require('./strategies/ruleFunctions');

// io.on('connection', async () => {
//     console.log('Client connected')
//     let currentRules
    
//     // socket_id.push(io.id);
//     // if (socket_id[0] === io.id) {
//     //     // remove the connection listener for any subsequent 
//     //     // connections with the same ID
//     //     io.removeAllListeners('connection'); 
//     // }

//     try {
//         //get all stream rules
//         currentRules = await ruleFunctions.getRules()

//         //delete all stream rules
//         await ruleFunctions.deleteRules(currentRules)

//         //set rules base on rules array
//         await ruleFunctions.setRules(rules)
    
//     } catch (err) {
//         console.error(err)
//         process.exit(1)
//     }

//     //pass in socket 
//     ruleFunctions.streamTweets(io)

// })



// const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
// const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id' //by default tweets return id and text, can add query to add more, such as retweets + likes

// const rules = [{value: 'demon slayer'}]

// //3 separate functions for the rules:
// //1) get stream rules -> using needle + PROMISES
// async function getRules() {
//     const response = await needle('get', rulesURL, { //specified in needle documentation
//         headers: {
//             Authorization: `Bearer ${TOKEN}`
//         }
//     })
//     //console.log(response)
//     return response.body
// }

// //2) set stream rules
// async function setRules() {
//     const data = { //specified in the twitter api documentation
//         add: rules
//     }

//     const response = await needle('post', rulesURL, data, {
//         headers: {
//             'content-type' : 'application/json',
//             Authorization: `Bearer ${TOKEN}`
//         }
//     })

//     return response.body
// }

// //3) delete stream rules
// async function deleteRules(rules) {
//     if (!Array.isArray(rules.data)){ //rules.data needs to be an array!
//         return null
//     }

//     const ids = rules.data.map((rule) => rule.id)

//     const data = { 
//         delete: {
//            ids: ids 
//         }
//     }

//     const response = await needle('post', rulesURL, data, {
//         headers: {
//             'content-type' : 'application/json',
//             Authorization: `Bearer ${TOKEN}`
//         }
//     })

//     return response.body
// }

// function streamTweets(io) {
//     //make request to stream url -> get stream
//     const stream = needle.get(streamURL, {
//         headers: {
//             Authorization: `Bearer ${TOKEN}`
//         }
//     })

//     //Attach event handlers on the stream https://www.w3schools.com/jquery/event_on.asp, 'data' is the event, (data) is the function to run when the event occurs (i.e. gives us the data)
//     //data is a buffer -> need to parse to json
//     stream.on('data', (data) => {
//         try {
//             const json = JSON.parse(data)
            
//             //emit an event called tweet, how to communicate between client and backend -> send an event ('tweet') to client, and pass data along (tweets)
//             io.emit('tweet', json)
//             //console.log(json)
//         } catch(error) {
//             //console.log(error)
//             console.log(data)
//         }
//     })
// }

// //add event handler for socket io -> runs when client connects
// io.on('connection', async () => {
//     console.log('Client connected')
//     let currentRules

//     try {
//         //get all stream rules
//         currentRules = await getRules()

//         //delete all stream rules
//         await deleteRules(currentRules)

//         //set rules base on rules array
//         await setRules()
    
//     } catch (err) {
//         console.error(err)
//         process.exit(1)
//     }

//     //pass in socket 
//     streamTweets(io)

// })

io.on('disconnect', () =>{
    console.log('Client DISCONNECTED')
})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))