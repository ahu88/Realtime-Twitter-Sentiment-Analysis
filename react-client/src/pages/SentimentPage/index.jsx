import React from "react";
import { useState, useRef, useEffect } from "react";
import axios from 'axios';
import { Form, FormGroup, Button } from "react-bootstrap"
import '../../App.css'
import {tweetSentiment} from '../../utils/sentimentAnalysis'

export const SentimentPage = () => {
  const [query, setQuery] = useState("");
  const [tweets, setTweets] = useState([]);
  const [twitterData, setTwitterData] = useState([]);
      
  //urls for pre-trained sentiment model
  const urls = {
    model: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json',
    metadata: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json'
  };

	const handleSubmit = async (evt) => {
    evt.preventDefault();
		alert(`Submitting Query: ${query}`)

    setTwitterData([]); 
    
		axios.post('/sentiment', {
			query: query
		})
    .then(async function(response){
      //*this will update tweets for the NEXT RENDER, state values are used by functions based on their CURRENT CLOSURES, state updates will reflect in the next re-render*/
      setTweets(response.data); //set tweets state var to the arr of 20 tweets returned by this request

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
				<form class="rules-form" onSubmit={handleSubmit}>
          <h1 class="display-6">Sentiment Analysis</h1>
					<Form.Group className="mb-3">
						<Form.Label>Keyword</Form.Label>
						<Form.Control value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter hashtag" />
					</Form.Group>
					<Button variant="primary" type="submit">
						Submit
					</Button>
				</form>
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
