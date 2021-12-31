//a custom hook that creates the socket.io-client, exposes a tweet object
//, and whenever a new tweet is received - will add to the array of all tweets
import { useState, useRef, useEffect } from "react";
import {io} from "socket.io-client";
import {tweetSentiment} from '../utils/sentimentAnalysis'

const ENDPOINT = "http://localhost:4001/";

function useTweets() {
  //* with functional components, we use the useState hook to use state variables */

  //received tweets from server -> is an array
  //tweets is the current state, and setTweets is a function that updates it
  const [tweets, setTweets] = useState([]); //[] is the initial state of tweets
  const socketRef = useRef(); //object returned from useRef will persist for the full lifetime of the component

  //handle tweet events
  //*** THIS IS LIKE THE COMPONENTDIDMOUNT FUNCTION -> RUN ON FIRST RENDER (not subsequent updates since passed in [] as second prop) */
  useEffect(async () => {
    socketRef.current = io(ENDPOINT)
    
    socketRef.current.on("tweet", async (tweet) => {
      if (tweet.data != undefined) {
        //object that represents the tweet data to display
        const newTweet = {
          id : tweet.data.id,
          text : tweet.data.text,
          username : `@${tweet.includes.users[0].username}`,
          sentiment: await tweetSentiment(tweet.data)
        }
        console.log(newTweet);

        //add new tweet to array of tweets -> return this array
        setTweets((tweets) => [...tweets, newTweet]);
      }
    });

    //destroy socket reference when connection is closed
    return () => {
      socketRef.current.disconnect();
    };
  }, []);
  return tweets;
}

export default useTweets;

