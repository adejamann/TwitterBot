//twitter library.
var Twit = require('twit');
//our configuration file.
var T = new Twit(require('./config'));


//Debug
//Useful for debuging if we don't want to post to Twitter
var debug = false 

//Wordnik Information
var WordnikAPI = '';
var request = require('request');
var inflection = require('inflection');


//Blacklist
var wordfilter = require('wordfilter');


//Helper Function for the array that will pick a random thing
Array.prototype.pick = function() {
	return this[Math.floor(Math.random()*this.length)];
}
Array.prototype.remove = function() {
	var what, a = arguments,L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while((ax=this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;

};

//url search for the trending tweet on the #GaTech hashtag.
var mediaArtsSearch = {q:"#GaTech", count: 5, result_type: "trending"};

function retweetLatest(){
    T.get('search/tweets', mediaArtsSearch, function (error, data) {
        // log out any errors and responses
	  console.log(error, data);
	  // If our search request to the server 
	  if (!error) {
	  	// 
		var retweetId = data.statuses[0].id_str;
		//retweets it
		T.post('statuses/retweet/' + retweetId, { }, function (error, response) {
			if (response) {
				console.log('Success! Your bot tweeted something.')
			}
			// prints out error if there is error
			if (error) {
				console.log('There was an error with Twitter:', error);
			}
		})
	  }
	  // However, if our original search request had an error, we want to print it out here.
	  else {
	  	console.log('There was an error: ', error);
      }
	});     
}

//Will retweet something as soon as the program is ran
retweetLatest();

// ...and then every hour after that.It will retweet something every 30 minutes
// 1000 mil seconds --> 60 seconds---> 30 minutes
setInterval(retweetLatest, 1000 * 60 * 30);