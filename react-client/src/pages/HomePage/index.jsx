import React from "react";
import useTweets from "../../utils/useTweets"
import Expire from "../../utils/expire"
import { useState, useRef, useEffect } from "react";
import axios from 'axios'; //to make api calls
import { Form, FormGroup, Button } from "react-bootstrap"
import '../../App.css' //css stylesheet

export const HomePage = () => {
	const [rules, setRules] = useState(""); //state var to set the rules for tweet stream
	const [recentSearches, setRecentSearches] = useState([]); //state array to hold recently searched rules -> retrieved from mongoDB
	const tweets = useTweets() // useTweets() is a hook that will update the 'tweets' array with new tweets as soon as it is received from the socket

	//similar to componentDidMount and componentDidUpdate -> run at mounted/first render + all subsequent updates (only updates at mounted if pass in [] as parameter) 
  //when calling setState inside useEffect, make sure to pass in [] as 2nd param, else there will be an infinite loop (setState causes rerender -> call useEffect -> repeat)
	useEffect(() => {
    //GET request to get stored recent searches
    axios.get("/getRecentSearches")
    .then((response) => {
      console.log(response.data);
      //need to format the response.data, as it is an array of obj, not array of value strings
      let formattedRecentSearches = response.data.map((item) => {
        return item['value'];
      })
      console.log(formattedRecentSearches);
      setRecentSearches(formattedRecentSearches);
    })
		.catch((err) => {
			console.log(err); //err.message
		});
    
    console.log("recentSearches: " + recentSearches);
	}, []);

	//function to handle form submission event -> send post request to backend
	const handleSubmit = (evt) => {
		evt.preventDefault();
		alert(`Submitting Rule: ${rules}`)
    
    //send rule to backend -> start tweet stream
		axios.post("/", {
			rules: rules
		}).then()
		.catch((err) => {
			console.log("error");
		});

    // update the current recentSearches state arr 
    setRecentSearches(prevArray => [...prevArray, rules]);
    console.log(rules);
    console.log(recentSearches);

    //TODO: only update if unique?
    //TODO: instead of recentSearches being an array of strings, make it an array of obj {id, value}

    //POST request to update the mongoDB for recent searches
    axios.post("/addRecentSearch", {
			value: rules
		})
    .then((response) => {
      console.log(response.data);

      // update the current recentSearches state arr 
      setRecentSearches(prevArray => [...prevArray, rules]);
      console.log(rules);
      console.log(recentSearches);
    })
		.catch((err) => {
			console.log("error");
		});
	}

  //function to delete selected recent search
  const deleteRecentSearch = (e) => {

    console.log(tweets);

    e.preventDefault();
    console.log("deleteRecentSearch")
    console.log(e.target.value);

    axios.post("/deleteRecentSearch", {
			value: e.target.value
		})
    .then((response) => {
      console.log(response.data);

      //remove from recentSearches state array too
      setRecentSearches(recentSearches.filter(item => item !== e.target.value))
    })
		.catch((err) => {
			console.log("error");
		});

  }

	return (
		<div>
			<div class="container">
				{/* form for user inputted rule -> sent to backend API*/}
				<form class="rules-form" onSubmit={handleSubmit}>  {/* when onSubmit event happens, call the handleSubmit function */}
					<h1 class="display-6">Real-Time Twitter Stream</h1>
					<Form.Group className="mb-3">
						<Form.Label>Keyword</Form.Label>
						<Form.Control value={rules} onChange={e => setRules(e.target.value)} placeholder="Enter keyword to search for" />
					</Form.Group>
					<Button variant="primary" type="submit">
						Submit
					</Button>
				</form>

        {/* display recently searched */}
        <h5 class="mb-3">Recent Searches:</h5>
        <div class="recentContainer">
          {recentSearches.map((obj, index) => (
            // <p key={obj} class="recentTag">{obj}</p>
            <button onClick={deleteRecentSearch} value={obj} key={index} class="recentTag">{obj}</button>
          ))}
        </div>

				{/* print out list of tweets in real-time as they are updated by useTweets hook */}
				<div id="tweetStream">
					{tweets.map((tweet) => (
						<Expire delay="1000000"> {/* tweets disappear after 5 seconds */}
							<div class="card my-4">
								<div class="card-body">
									<h5 class="card-title">{tweet.text}</h5>
                  <h6 class="card-subtitle mb-2 text-muted">{tweet.sentiment.sentiment}: {tweet.sentiment.score}</h6>
									<h6 class="card-subtitle mb-2 text-muted">{tweet.username}</h6>

									<a class="btn btn-primary mt-3" href={"https://twitter.com/" + tweet.username + "/status/" + tweet.id} target="_blank">
										Go To Tweet
									</a>
								</div>
							</div>
						</Expire>
					))}
				</div>
			</div>
		</div>
	);
};
