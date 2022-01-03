import $ from 'jquery'

const tf = require('@tensorflow/tfjs');

let model, metadata;

//urls for pre-trained sentiment model
const urls = {
  model: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json',
  metadata: 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json'
};

const SentimentThreshold = {
  Positive: 0.66,
  Neutral: 0.33,
  Negative: 0
}

const PAD_INDEX = 0;
const OOV_INDEX = 2;

//LOAD SENTIMENT MODEL
async function loadModel(url) {
  try {
    const model = await tf.loadLayersModel(url);
    return model;
  } catch (err) {
    console.log(err);
  }
}
 
async function loadMetadata(url) {
  try {
    const metadataJson = await fetch(url);
    const metadata = await metadataJson.json();
    return metadata;
  } catch (err) {
    console.log(err);
  }
}

//PERFORM SENTIMENT ANALYSIS ON EACH TWEET
async function setupSentimentModel(){
  model = await loadModel(urls.model);
  metadata = await loadMetadata(urls.metadata);

}

//takes in individual tweet, gets sentiment score, determine if positive, neutral, or negative
async function processTweetData(tweet) {
  await setupSentimentModel();
    
  let twitterData = {};

  const tweet_text = tweet.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  const sentiment_score = getSentimentScore(tweet_text);

  let tweet_sentiment = '';
  if(sentiment_score > SentimentThreshold.Positive){
    tweet_sentiment = 'positive'
  }else if(sentiment_score > SentimentThreshold.Neutral){
    tweet_sentiment = 'neutral'
  }else if(sentiment_score >= SentimentThreshold.Negative){
    tweet_sentiment = 'negative'
  }

  twitterData = {
    sentiment: tweet_sentiment,
    score: sentiment_score.toFixed(4),
    tweet: tweet_text
  };

  return twitterData;
}

//gets the sentiment score of a single tweet using model.predict()
function getSentimentScore(text) {
  const inputText = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
  // Convert the words to a sequence of word indices.
  const sequence = inputText.map(word => {
    let wordIndex = metadata.word_index[word] + metadata.index_from;
    if (wordIndex > metadata.vocabulary_size) {
    wordIndex = OOV_INDEX;
    }
    return wordIndex;
  });
  // Perform truncation and padding.
  const paddedSequence = padSequences([sequence], metadata.max_len);
  const input = tf.tensor2d(paddedSequence, [1, metadata.max_len]);

  const predictOut = model.predict(input);
  const score = predictOut.dataSync()[0];
  predictOut.dispose();
 
  return score;
}

function padSequences(sequences, maxLen, padding = 'pre', truncating = 'pre', value = PAD_INDEX) {
  return sequences.map(seq => {
    if (seq.length > maxLen) {
    if (truncating === 'pre') {
      seq.splice(0, seq.length - maxLen);
    } else {
      seq.splice(maxLen, seq.length - maxLen);
    }
    }
  
    if (seq.length < maxLen) {
    const pad = [];
    for (let i = 0; i < maxLen - seq.length; ++i) {
      pad.push(value);
    }
    if (padding === 'pre') {
      seq = pad.concat(seq);
    } else {
      seq = seq.concat(pad);
    }
    }
  
    return seq;
  });
  }


//function to run the sentiment analysis using a single tweet
export async function tweetSentiment(tweet) {
  let sentiment_data = await processTweetData(tweet);
  return sentiment_data;
}


// //export the functions as modules so that they can be reused by other parts of the code (i.e. in index.js)
// module.exports.loadModel = loadModel;
// module.exports.loadMetadata = loadMetadata;
// module.exports.processTwitterData = processTwitterData;
// module.exports.getSentimentScore = getSentimentScore;
// module.exports.twitterSentiment = twitterSentiment;