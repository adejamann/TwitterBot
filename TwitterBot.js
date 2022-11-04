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


// This is the URL of a search for the latest tweets on the '#graphic design' hashtag.
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
retweetLatest();
//Retweet every hour
setInterval(retweetLatest, 1000 * 60 * 60);


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
