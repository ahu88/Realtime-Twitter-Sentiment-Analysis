// // Use express's router to route all our API endpoints
// const express = require('express');
// const router = express.Router();

// // POST Request - update the rules array
// router.post("/",  async (req, res) => {
//     const {zipCode, tempMetric} = req.body;
//     let weather = new Weather();
    
//     // The params for zipCode and tempMetric are dynamic
//     let weatherData = await weather.getWeatherData(zipCode, tempMetric);

//     res.header("Content-Type",'application/json');
//     res.send(JSON.stringify(weatherData, null, 4));
// });

// module.exports = router;