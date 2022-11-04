/**
Purpose of our Twitterbot: We have a few function, post, like, and upload images. We are also using
Wordnik API to interact with users on Twitter.
Post: We uploud random images related to #artwork.
Like: Likes posts with the word artwork mentioned.
retweet: posts are retweeted when there is #artwork.
uploads: random images are pulled out and are posted.
*/
//Debug
//Useful for debuging if we don't want to post to Twitter
var debug = false 

//wordnik stuff
var WordnikAPIKey = 'd9776ttsyoaffi5hplh66ud2us6ipfuso1thwwe0mv3nvfpxd';
var request = require('request');
var inflection = require('inflection');
var awesome;

var pre;	// store prebuilt strings here.

//Blacklist
var wordfilter = require('wordfilter');

// Twitter Essentials
// Twitter Library
var Twit = require('twit');

// Include configuration file
var T = new Twit(require('./config.js'));

// Wordnik stuff
function adjectiveUrl() {
	return "https://api.wordnik.com/v4/word.json/awesome/relatedWords?useCanonical=false&relationshipTypes=synonym&limitPerRelationshipType=10&api_key=d9776ttsyoaffi5hplh66ud2us6ipfuso1thwwe0mv3nvfpxd";
}

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


// This is the URL of a search for the latest tweets on the '#artwork' hashtag.
var artworkSearch = {
    q: "#artwork", 
    count: 10, 
    result_type: "recent",
}; 
// This function finds the latest tweet with the #artwork hashtag, and retweets it.
function retweetLatest() {
	T.get('search/tweets', artworkSearch, function (error, data) {
	  // log out any errors and responses
	  console.log(error, data);
	  // If our search request to the server had no errors...
	  if (!error) {
	  	// ...then we grab the ID of the tweet we want to retweet...
		var retweetId = data.statuses[0].id_str;
		// ...and then we tell Twitter we want to retweet it!
		T.post('statuses/retweet/' + retweetId, { }, function (error, response) {
			if (response) {
				console.log('Success! Check your bot, it should have retweeted something.')
			}
			// If there was an error with our Twitter call, we print it out here.
			if (error) {
				console.log('There was an error with Twitter:', error);
			}
		})
	  }
	  // However, if our original search request had an error, we want to print it out here.
	  else {
	  	console.log('There was an error with your hashtag search:', error);
	  }
	});
}
//Will retweet something as soon as the program is ran
retweetLatest();
// ...and then every hour after that.It will retweet something every 30 minutes
// 1000 mil seconds --> 60 seconds---> 30 minutes
setInterval(retweetLatest, 1000 * 60 * 30);


// Like posts under #artwork hashtag
function likepost() {
	T.get('search/tweets', {
		q: 'artwork', count: 5 
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

//Tweet random graphic design images from images folder
//Generates an image from 
const randomFromArray = (images) => {
	return images[Math.floor(Math.random() * images.length)];
  } 
// Pull out image from image.js
const uploadRandomImage = (images) => {
	console.log('opening an image...');
	const randomImage = randomFromArray(images);
	const imagePath = path.join(__dirname, '/images/' + randomImage.file);
	const imageData = fs.readFileSync(imagePath, {encoding: 'base64'});
	// Upload image to post
	T.post('media/upload', {media_data: imageData}, (err, data, response) => {
		console.log('uploading an image...');
		// Print out error if an error occurs
		if (err){
			console.log('error:', err);
		} else {
			console.log('adding description...');
			const image = data;
			//Post the random image
			T.post('media/metadata/create', {
				media_id: data.media_id_string,
				alt_text: {
					text: randomImage.altText
				}            
			}, (err, data, response) => {
				console.log('tweeting...');
				T.post('statuses/update', {
					status: randomImage.text,
					media_ids: new Array(image.media_id_string)
				}, (err, data, response) => {
					if (err){
						console.log('error:', err);
					}
				});
			});
		}
	});
}
// Run the uploadRandomImage() method
uploadRandomImage();
// Set interval to once an hour
setInterval(uploadRandomImage, 1000 * 60 * 60);

function runBot() {
	console.log(" "); // just for legible logs
	var d=new Date();
	var ds = d.toLocaleDateString() + " " + d.toLocaleTimeString();
	console.log(ds);  // date/time of the request	

	// Get 200 adjective with minimum corpus count of 5,000 (lower numbers = more common words) 
	request(adjectiveUrl(5000,200), function(err, response, data) {
		if (err != null) return;		// bail if no data
		adjective = eval(data);

		// Filter out the bad nouns via the wordfilter
		
		for (var i = 0; i < adjective.length; i++) {
			if (wordfilter.blacklisted(adjective[i].word))
			{
				console.log("Blacklisted: " + adjective[i].word);
				adjective.remove(adjective[i]);
				i--;
			}				
		}

		pre = [
			
			"I don't know how anybody can tolerate Prof. " + capitalize(singularize(nouns.pick().word)) + ". What a tool.", 
			"I'm so behind in my " + singularize(nouns.pick().word) + " class.",
			"I'm thinking of changing my major to " + capitalize(singularize(nouns.pick().word)) + " Studies.",
			"Seriously, " + capitalize(singularize(nouns.pick().word)) + " Engineering is ruining my life.",
			"I can't believe I forgot to bring my " + nouns.pick().word + " to lab again.",
			"Sooo much homework in this " + capitalize(nouns.pick().word) + " class. I should have taken " + capitalize(nouns.pick().word) + " instead.",
			"Almost the weekend! Totally amped for the " + nouns.pick().word + " party.",
			"Seriously I have had enough of Intro to " + capitalize(nouns.pick().word) + ".",
			"Who's coming to Club " + capitalize(singularize(nouns.pick().word)) + " tonight? I'm DJing along with my bro " + capitalize(nouns.pick().word) + ".",
			"Missed class again. Too many " + pluralize(nouns.pick().word) + " last night."
			// etc.			
		];
		
		///----- NOW DO THE BOT STUFF
		var rand = Math.random();

 		if(rand <= 1.60) {      
			console.log("-------Tweet something");
			tweet();
			
		} else if (rand <= 0.80) {
			console.log("-------Tweet something @someone");
			respondToMention();
			
		} else {
			console.log("-------Follow someone who @-mentioned us");
			followAMentioner();
		}
	});
}

// Run the bot
runBot();

// And recycle every hour
setInterval(runBot, 1000 * 60 * 60);
