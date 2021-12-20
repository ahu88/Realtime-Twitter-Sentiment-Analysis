//add socket.io -> allows use of web sockets, open door connection between server and client (basic html + javascript, React (build folder?), Angular ...)
const http = require('http') 
const express = require('express')
const socketIO = require('socket.io')
const mongoose = require("mongoose");
//const cors = require('cors');

const needle = require('needle') //http client to make our requests
const config = require('dotenv').config() //to use .env file - to get token
const TOKEN = process.env.TWITTER_BEARER_TOKEN
const PORT = process.env.PORT || 4001
const index = require("./routes/index");

const app = express() //initialize express

//connect to database
mongoose.connect(process.env.DATABASE_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
const db = mongoose.connection
db.on('error', (error) => console.error(error));
db.once('open', (error) => console.log('Connected to Database'));


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

io.on('disconnect', () =>{
    console.log('Client DISCONNECTED')
})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))