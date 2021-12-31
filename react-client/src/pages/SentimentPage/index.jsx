import React from "react";
import { useState, useRef, useEffect } from "react";
import axios from 'axios'; //to make api calls
import { Form, FormGroup, Button } from "react-bootstrap"
import '../../App.css'
import {tweetSentiment} from '../../utils/sentimentAnalysis'

export const SentimentPage = () => {
  const [query, setQuery] = useState(""); //state var to hold user inputted query to send to backend
  const [tweets, setTweets] = useState([]); //state array to hold 20 tweets returned by post request
  const [twitterData, setTwitterData] = useState([]); //state array to hold sentiment analysis data on 20 tweets
      
  //urls for pre-trained sentiment model
  const urls = {
    model: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json',
    metadata: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json'
  };

  //function to handle form submission event -> send post request to backend
	const handleSubmit = async (evt) => {
    evt.preventDefault();
		alert(`Submitting Query: ${query}`)

    setTwitterData([]); //clear twitterData array
    
    //THIS IS A PROMISE. THE AXIOS.POST OR GET RETURNS A PROMISE, THEN .THEN() HAS THE CALLBACK FUNCTION TO RUN, AND .CATCH IS FOR ERRORS
		axios.post('/sentiment', {
			query: query
		})
    //response is array of tweets from Twitter API
    .then(async function(response){
      //https://stackoverflow.com/questions/54069253/usestate-set-method-not-reflecting-change-immediately **interesting issue...
      console.log(response.data);
      //*this will update tweets for the NEXT RENDER, state values are used by functions based on their CURRENT CLOSURES, state updates will reflect in the next re-render*/
      setTweets(response.data); //set tweets state var to the arr of 20 tweets returned by this request
      console.log(tweets);

      /* NOTE THAT THE ABOVE TWO CONSOLE.LOGS ARE DIFFERENT, tweets is updated on the NEXT render */
      /* so in order for the twitter sentiment function to work properly (instead of being one render behind, i.e. the first time the array is empty, second time is the first array, ...) */
      /* so, pass in response.data to twitterSentiment instead of tweets*/

      const twitter_data = [];
      await response.data.forEach(async (tweet, i) => {
        let tweet_data = await tweetSentiment(tweet);
        twitter_data.push(tweet_data);
        setTwitterData(twitterData => [...twitterData, tweet_data]);
      });
    })
    .catch(function(err){
			console.log("error");
		});
	}

  return (
    <div>
      <div class="container">
        {/* form for user inputted hashtag -> do sentiment analysis on this tag*/}
				<form class="rules-form" onSubmit={handleSubmit}>  {/* when onSubmit event happens, call the handleSubmit function */}
          <h1 class="display-6">Sentiment Analysis</h1>
					<Form.Group className="mb-3">
						<Form.Label>Keyword</Form.Label>
						<Form.Control value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter hashtag" />
					</Form.Group>
					<Button variant="primary" type="submit">
						Submit
					</Button>
				</form>


        {/* print out list of tweets in real-time as they are updated by useTweets hook */}
				{/* <div id="tweetStream">
					{tweets.map((tweet) => (
            <div class="card my-4">
              <div class="card-body">
                <h5 class="card-title">{tweet.text}</h5>
              </div>
            </div>

					))}
				</div> */}
        <div id="tweetStream">
					{twitterData.map((tweet) => (
            <div class="card my-4">
              <div class="card-body">
                <h5 class="card-title">{tweet.tweet}</h5>
								<h6 class="card-subtitle mb-2 text-muted">{tweet.sentiment}: {tweet.score}</h6>

              </div>
            </div>

					))}
				</div>
      </div>
    </div>
  );
};
