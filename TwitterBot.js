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

const randomFromArray = (arr) => {
    /* Helper function for picking a random item from an array. */

    return arr[Math.floor(Math.random() * arr.length)];
}

const tweetRandomImage = () => {
    /* First, read the content of the images folder. */

    fs.readdir(__dirname + '/images', (err, files) => {
        if (err){
            console.log('error:', err);
            return;
        } else {
            let images = [];

            files.forEach((f) => {
                images.push(f);
            });

            /* Then pick a random image. */

            console.log('opening an image...');

            const imagePath = path.join(__dirname, '/images/' + randomFromArray(images)),
                  imageData = fs.readFileSync(imagePath, { encoding: 'base64' });

            /* Upload the image to Twitter. */

            console.log('uploading an image...', imagePath);

            T.post('media/upload', { media_data: imageData }, (err, data, response) => {
                if (err){
                    console.log('error:', err);
                } else {
                    /* Add image description. */
                    
                    const image = data;
                    console.log('image uploaded, adding description...');

                    T.post('media/metadata/create', {
                        media_id: image.media_id_string,
                        alt_text: {
                            text: 'Describe the image'
                        }            
                    }, (err, data, response) => {

                        /* And finally, post a tweet with the image. */

                        T.post('statuses/update', {
                            // status: 'Optional tweet text.',
                            media_ids: [image.media_id_string]
                        },
                        (err, data, response) => {
                            if (err){
                                console.log('error:', err);
                            } else {
                                console.log('posted an image!');

                                /*
                                    After successfully tweeting, we can delete the image.
                                    Keep this part commented out if you want to keep the image and reuse it later.
                                */

                                // fs.unlink(imagePath, (err) => {
                                //   if (err){
                                //     console.log('error: unable to delete image ' + imagePath);
                                //   } else {
                                //     console.log('image ' + imagePath + ' was deleted');
                                //   }
                                // });
                            }
                        });
                    });
                }
            });
        }
    });
}
// Run the uploadRandomImage() method
uploadRandomImage();
// Set interval to once an hour
setInterval(uploadRandomImage, 1000 * 60 * 30);


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


//follows someone posted under #artwork
function artworkFollow() {
	var artworkSearch = { //#artwork is searched.
		q: "artwork",
		count: 10,
		result_type: "recent" //looking for recent users.
	};
	T.get('search/tweets', artworkSearch, function(error, data) { 
		if (error !== null) { //checks for error
			console.log('There is an error: ', err);
		  }
		  else {
		  	var sn = reply.pick().user.screen_name;
			if (debug) 
				console.log(sn);
			else {
				//Now follow that user
				T.post('friendships/create', {
					screen_name
                }, function(err, response) {
                    if (err) {
                        console.log('There was an error: ', err);
                    } else {
                        console.log(screen_name, ': Following'); //successfully followed!
                    }
				});
			}
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
		console.log("-------Post an image");
		uploadRandomImage();

		} else if (rand <= 4) {
		console.log("-------Retweet something in #artwork");
		retweetLatest();

		} else if (rand <= 6) {
		console.log("-------Like something if word artwork is in the tweet");
		likepost();

		} else if (rand <= 8) {
		console.log("-------Follow someone under #artwork hashtag");
		artworkFollow();

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
