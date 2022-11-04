//twitter library.
var Twit = require('twit');
//our configuration file.
var T = new Twit(require('./config'));


//Debug
//Useful for debuging if we don't want to post to Twitter
var debug = false 

//wordnik stuff
var WordnikAPIKey = 'd9776ttsyoaffi5hplh66ud2us6ipfuso1thwwe0mv3nvfpxd';
var request = require('request');
var inflection = require('inflection');

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

//url search for the trending tweet on the #graphicdesign hashtag.
var mediaArtsSearch = {q:"#graphicdesign", count: 5, result_type: "rencent"};

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

function likepost() {
	T.get('search/tweets', {
		q: 'graphic design', count: 6 
	},
	function(err, data, response) {
		var likedId = data.statuses[0].id_str;
		T.post('favorites/create', {
			id: likedId
		},
		function(err, data, response) {
			console.log("You liked a post")
		});
		console.log(data);
	});
}

//Will retweet something as soon as the program is ran
retweetLatest();

// ...and then every hour after that.It will retweet something every 30 minutes
// 1000 mil seconds --> 60 seconds---> 30 minutes
setInterval(retweetLatest, 1000 * 60 * 30);
