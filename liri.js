// import modules and packages
var fs = require("fs");
const request = require("request");
const Spotify = require("node-spotify-api");
const moment = require("moment");

// turn on dotenv to load up environment variables from .env file
require("dotenv").config();

const spotifyKeys = require("./keys.js");


// turn on new spotify app
const spotify = new Spotify(spotifyKeys.spotify);

// switch used to call functions based on input.

var action = process.argv[2];
var songChoice = (process.argv[3])
switch (action) {
  case "concert-this":
    concert();
    break;

  case "spotify-this-song":
    spotifyThis(songChoice);
    break;

  case "movie-this":
    movie();
    break;

  case "do-what-it-says":
    doWhatItSays();
    break;
  default:
    console.log("Invalid request. Try concert-this, spotify-this-song, movie-this or do-what-it-says");
}

function concert() {

  let artist = process.argv.slice(3).join("+");

  request("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp",
    function (error, response, body) {
      // console.log(JSON.parse(body))
      // If the request is successful (i.e. if the response status code is 200) Code 200 is a successful request.

      if (!error && response.statusCode === 200) {
        // parese and save the results to an array so we can loop over each separate event and print.
        let resultsArr = JSON.parse(body);
        // console.log(resultsArr)
        // Looping and printing based on number on events.
        for (let i = 0; i < resultsArr.length; i++) {
          let venueName = resultsArr[i].venue.name;
          let venueCity = resultsArr[i].venue.city;
          let venueCountry = resultsArr[i].venue.country;
          let venueDate = resultsArr[i].datetime;
          
          // as the date is in 2019-02-16T19:00:51 format; slice till index 10, convert to string, and then use moment to convert to required format of MM/DD/YYYY
          var newDate = venueDate.slice(0, 10);
          var date = newDate.toString();
          // console.log(date);
          let convertedDate = moment(date).format("MM/DD/YYYY")
          // console.log(venueName);
          // console.log(venueCity + ", " + venueCountry);
          // console.log(convertedDate);
          var concertInfo = 
          "-----------------------------------------------------------------" + "\r\n" + "Concert Venue: " + venueName + "\r\n" + "Venue address: " + venueCity + ", " + venueCountry + "\r\n" + "Date of the Event: " + convertedDate + "\r\n" + "-----------------------------------------------------------------"

          console.log(concertInfo);
          writeTofile(concertInfo);
          
        }
      }
    });
}


function spotifyThis(songChoice) {
// save the song entered in a variable
 
if (!songChoice){
  songChoice = "The Sign by Ace of Base"
} 

// search for the song in spotify
  spotify.search({
    type: 'track',
    query: songChoice
  }, function (err, data) {
    if (err) {
      return console.log("Error occurred: " + err);
    }
    if (!data) {
      console.log("Invalid Input");
      return;
    }
    // console.log(data);
    // console.log(data.tracks.items);
    // save the relavant data to a var to easier reference
    let songVar = data.tracks.items;
    // loop over the number of songs returned to print required info.
    for (var i = 0; i < songVar.length; i++) {

      let songInfo = 
      "-----------------------------------------------------------------" + "\r\n" + 'Song: ' + songVar[i].name +  "\r\n" + 'Artist: ' + songVar[i].artists[0].name + "\r\n" + 'Album: ' + songVar[i].album.name + "\r\n" + 'Url: ' + songVar[i].external_urls.spotify + 
      "-----------------------------------------------------------------"

      console.log(songInfo);
      writeTofile(songInfo);
      // console.log('Song: ' + songVar[i].name);
      // console.log('Artist: ' + songVar[i].artists[0].name);
      // console.log('Album: ' + songVar[i].album.name);
      // console.log('Url: ' + songVar[i].external_urls.spotify);

    }
  });
}

// save movie in a var. and join with a + as its required for the search request. If no movie enetered, default to Mr. Nobody.
function movie() {
  let name = ""
  if (!(process.argv[3])) {
    name = "Mr." + "Nobody"
  } else {
    name = process.argv.slice(3).join("+");
  }

  request("http://www.omdbapi.com/?t=" + name + "&y=&plot=short&apikey=trilogy", function (error, response, body) {

    // If the request is successful (i.e. if the response status code is 200) Code 200 is a successful request.
    if (!error && response.statusCode === 200) {
      let info = JSON.parse(body);
        var movieInfo = 
        "-----------------------------------------------------------------" + "\r\n" +
				"Title: " + info.Title+"\r\n"+
				"Year: " + info.Year+"\r\n"+
				"Imdb Rating: " + info.imdbRating+"\r\n"+
				"Country: " + info.Country+"\r\n"+
				"Language: " + info.Language+"\r\n"+
				"Plot: " + info.Plot+"\r\n"+
				"Actors: " + info.Actors+"\r\n"+
				"Rotten Tomatoes Rating: " + info.tomatoRating+"\r\n"+
				"Rotten Tomatoes URL: " + info.tomatoURL + "\r\n" + 
				"------------------------------------------------------------------" + "\r\n";
      console.log(movieInfo)
      writeTofile(movieInfo);

      //Parse the body of the site and recover just the imdbRating
      // JSON.parse needed as it comes back as a string
      // console.log("Title of the movie: " + JSON.parse(body).Title);
      // console.log("Year the movie was released: " + JSON.parse(body).Year);
      // console.log("IMDB Rating of the movie: " + JSON.parse(body).imdbRating);
      // console.log("Rotten Tomatoes Rating of the movie: " + JSON.parse(body).Ratings[1].Value);
      // console.log("Country where the movie was produced: " + JSON.parse(body).Country);
      // console.log("Language of the movie: " + JSON.parse(body).Language);
      // console.log("Plot of the movie: " + JSON.parse(body).Plot);
      // console.log("Actors in the movie: " + JSON.parse(body).Actors);
      // console.log(JSON.parse(body));
    }
  });
};

function doWhatItSays() {

  fs.readFile("random.txt", "utf8", function (err, data) {

    if (err) {
      return console.log(err);
    } else {
      // console.log(data);
      let dataArr = data.split(",");
      song = dataArr[1];
      spotifyThis(song);
      // console.log(song);
  // We will then re-display the content as an array for later use.
  // console.log(dataArr);

    }
  });
};

// Write all info to log.txt
function writeTofile (data) {
  fs.appendFile("log.txt", data, function(err) {

    // If an error was experienced we will log it.
    if (err) {
      console.log(err);
    }
  
    // If no error is experienced, we'll log the phrase "Content Added" to our node console.
    else {
      console.log("Content Added!");
    }
  
  });
}