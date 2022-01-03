import React from "react";
import useTweets from "../../utils/useTweets"
import Expire from "../../utils/expire"
import { useState, useRef, useEffect } from "react";
import axios from 'axios'; 
import { Form, FormGroup, Button } from "react-bootstrap"
import '../../App.css' 

export const HomePage = () => {
	const [rules, setRules] = useState("");
	const [recentSearches, setRecentSearches] = useState([]);
	const tweets = useTweets()

	useEffect(() => {
    //GET request to get stored recent searches
    axios.get("/getRecentSearches")
    .then((response) => {
      let formattedRecentSearches = response.data.map((item) => {
        return item['value'];
      })
      setRecentSearches(formattedRecentSearches);
    })
    .catch((err) => {
      console.log(err);
    });
	}, []);

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

    setRecentSearches(prevArray => [...prevArray, rules]);

    //POST request to update the mongoDB for recent searches
    axios.post("/addRecentSearch", {
			value: rules
		})
    .then((response) => {
      setRecentSearches(prevArray => [...prevArray, rules]);
    })
		.catch((err) => {
			console.log("error");
		});
	}

  //function to delete selected recent search
  const deleteRecentSearch = (e) => {
    e.preventDefault();

    axios.post("/deleteRecentSearch", {
			value: e.target.value
		})
    .then((response) => {
      setRecentSearches(recentSearches.filter(item => item !== e.target.value))
    })
		.catch((err) => {
			console.log("error");
		});
  }

	return (
		<div>
			<div class="container">
				{/* form for user inputted rule */}
				<form class="rules-form" onSubmit={handleSubmit}>
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
            <button onClick={deleteRecentSearch} value={obj} key={index} class="recentTag">{obj}</button>
          ))}
        </div>

				{/* print out list of tweets in real-time as they are updated by useTweets hook */}
				<div id="tweetStream">
					{tweets.map((tweet) => (
						<Expire delay="1000000">
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
