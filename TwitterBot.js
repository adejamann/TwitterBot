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
var motivate;

var pre;	// store prebuilt strings here.


//Blacklist
var wordfilter = require('wordfilter');

// Twitter Essentials
// Twitter Library
var Twit = require('twit');

// Include configuration file
var T = new Twit(require('./config.js'));


// Wordnik related word search url
function adjectiveUrl() {
	return "https://api.wordnik.com/v4/word.json/amazing/relatedWords?useCanonical=false&relationshipTypes=synonym&limitPerRelationshipType=50&api_key=d9776ttsyoaffi5hplh66ud2us6ipfuso1thwwe0mv3nvfpxd";
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


//Tweet random graphic design images from images folder
//Generates an image from 
const randomFromArray = (images) => {
	return images[Math.floor(Math.random() * images.length)];
  } 



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

//Post a tweet encouraging other artist
function tweet() {

    var tweetText = motivate.pick(); 

    if (debug)
        console.log('Debug mode: ', tweetText); //will not post it on twitter
    else
        T.post('statuses/update', { //will post a status
            status: tweetText
        }, function(err, reply) {
            if (err != null) {
                console.log('Error: ', err); // in the case something goes wrong with the status update
            } else {
                console.log('Tweeted: ', tweetText); //successful tweet!
            }
        });
}



//Reply someone's post under #artwork
function artworkReply() {
	var artworkSearch = {
		q: "artwork",
		count: 10,
		result_type: "recent"
	};
	T.get('search/tweets', artworkSearch, function(error, data) {
		//log out any errors
		console.log(error, data);
		if (!error) {
            // get the id of the tweet to reply
            var userName = data.statuses[0].user.screen_name;
            // ...and then we tell Twitter we want to retweet it!
            T.post('statuses/update', {
                status: "@" + userName + " " + pre.pick()
            }, function(err, response) { // Uses the username to create a new replies


                if (response) {
                    console.log('Bot has replied successfully.')
                }
                // If there was an error with our Twitter call, we print it out here.
                if (error) {
                    console.log('There was an error:', error);
                }
            })
        }
        // if search request was an error:
        else {
            console.log('There was an error with your hashtag search:', error);
        }
    });
}




function runBot() {
	console.log(" "); // just for legible logs
	var d=new Date();
	var ds = d.toLocaleDateString() + " " + d.toLocaleTimeString();
	console.log(ds);  // date/time of the request	


	//Request words from Worknik that is related with word awesome
    request(adjectiveUrl(), function(err, response, data) {
        if (err != null) return; // Bails if no data
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

		motivate = [

            "Dear artist, you are all " + adjective[0].words.pick() + " and your work is " + adjective[0].words.pick() + " so never give up!"

        ];


		pre = [

			"This piece of artwork is so " + adjective[0].words.pick() + ".", 
			"This is so " + adjective[0].words.pick() + " to me.",
			" I really love how " + adjective[0].words.pick() + " this is.",
			"I think this piece is so " + adjective[0].words.pick() +"." ,
			"You did a " + adjective[0].words.pick() + " job.",
			"Your art is " + adjective[0].words.pick() + ".",
			"I really like the technique you did, it makes it so " + adjective[0].words.pick() + ".",
			"Your hard work really makes this piece so " + adjective[0].words.pick() + ".",
			"You are doing such a " + adjective[0].words.pick() + "job on your artwork.",
			"keep up the " + adjective[0].words.pick() + " work."
			// etc.			

		];
		
		// Randomly choose a method to execute
		var rand = Math.floor(Math.random() * 11);

		if (rand <= 2) {
		console.log("-------Post a tweet");
		tweet();

		} else if (rand <= 4) {
		console.log("-------Retweet something in #artwork");
		retweetLatest();

		} else if (rand <= 6) {
		console.log("-------Like something if word artwork is in the tweet");
		likepost();

		} else {
		console.log("-------Reply someone's post under #artwork hashtag");
		artworkReply();
		}
	});
}
// Run the bot
runBot();
// And recycle every hour
setInterval(runBot, 1000 * 60 * 30);