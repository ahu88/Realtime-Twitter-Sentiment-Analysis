import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { HomePage, SentimentPage } from "./pages";

function App() {
	return (
		<Router>
			<Switch>
				<Route exact path="/" component={HomePage} />
				<Route exact path="/Sentiment" component={SentimentPage} />
			</Switch>
		</Router>
	);
}

export default App;
