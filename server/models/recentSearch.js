//create mongoDB model for recent searches

const mongoose = require("mongoose");

const recentSearchSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
  }
});

//export mongoDB schema to be used with other files
//this model lets us directly interact with the database using this recentSearchSchema (i.e. in index.js)
module.exports = mongoose.model("RecentSearch", recentSearchSchema); //(name of model in db, schema that corresponds)
