//Declareing global variables and npm package imports

require("dotenv").config ();
var fs = require ("fs");
var keys = require ("./keys")
var inquirer = require ("inquirer");
var request = require ("request");
var moment = require ("moment");
var Spotify = require("node-spotify-api");
var spotify = new Spotify(keys.spotify)
var concert = "";
var userMovie = "";

//Use inquirer to prompt the user to choose from programmed functionality
inquirer.prompt([
    // Here we give the user a list to choose from.
    {
        type: "list",
        message: "What can I help you with today?",
        choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says"],
        name: "choice"
      }
])
//Set up switchcases for the user choices to direct to direct function
.then (function (inquirerResponse) {
    switch (inquirerResponse.choice) {
        case "concert-this":
            concertThis();
        break;

        case "spotify-this-song":
            spotifyThis();
        break;
    
        case "movie-this":
            movieThis();
        break;
    
        case "do-what-it-says":
            doWhatItSays();
        break;
    };
})

//Declaring functions
function concertThis () {
    inquirer.prompt ([
        {
            type: "input",
            message: "Which band/artist are you itching to see?",
            name: "artist"
          }
    ])
    .then(function (answer) {
        var queryURL = "https://rest.bandsintown.com/artists/" + answer.artist + "/events?app_id=codingbootcamp";
        request (queryURL, function (error, response, body) {
            concert = JSON.parse(body);
            //console.log(typeof concert);
            for (var i = 0; i < 5; i++) {
                if (answer.artist === "") {
                    var queryURL = "https://rest.bandsintown.com/artists/taylor+swift/events?app_id=codingbootcamp";
                    request (queryURL, function (error, response, body) {
                    concert = JSON.parse(body);
                    console.log ("\nI think you need some Taylor Swift in your life. Here's her next show!")
                    console.log ("\nVenue: " + concert[0].venue.name);
                    console.log ("Location: " + concert[0].venue.city + " " + concert[0].venue.region);
                    console.log ("Date: " + moment(concert[0].datetime).format('MM/DD/YYYY'));
                    console.log ("-------------------");
                    });
                    return;
                } else if (!error && response.statusCode === 200) {
                    //console.log (concert)
                    if (!concert[i]) {
                        console.log ("\nLooks like " + answer.artist + " isn't touring right now. Better luck next year or never.");
                        return false;
                    } else {
                        console.log ("\nVenue: " + concert[i].venue.name);
                        console.log ("Location: " + concert[i].venue.city + " " + concert[i].venue.region);
                        console.log ("Date: " + moment(concert[i].datetime).format('MM/DD/YYYY'));
                        console.log ("-------------------");
                    }
                } else {
                    console.log('Error occurred.');
                }
            };
        });

    });
};

function spotifyThis () {
    inquirer.prompt ([
        {
            type: "input",
            message: "Pick a song, any song!!",
            name: "song"
        }
    ])
    .then(function (answer) {
        var song;
        if (answer.song === "") {
            song = "The Sign";
        } else {
            song = answer.song;
        };
        spotify.search({ type: "track", query: song, limit: 1}, function (error, data) {
            if (error) {
                return console.log("Error occurred: " + error);
            }
            var songData = data.tracks.items[0];
            console.log ("\nArtist: " + songData.artists[0].name);
            console.log ("Song Name: " + songData.name);
            console.log ("Preview Link: " + songData.preview_url);
            console.log ("Album Name: " + songData.album.name);
        })
    })
};

function movieThis () {
    inquirer.prompt ([
        {
            type: "input",
            message: "Give me a movie and watch the magic happen!",
            name: "movie"
        }
    ])
    .then(function (answer) {
        var queryMovieURL = "http://www.omdbapi.com/?t=" + answer.movie + "&y=&plot=short&tomatoes=true&apikey=trilogy";
        request (queryMovieURL, function (error, response, body) {
            userMovie = JSON.parse(body);
            //console.log (userMovie);
                if (answer.movie === "") {
                    console.log ("\nIf you haven't watched 'Mr. Nobody,' then you should: http://www.imdb.com/title/tt0485947/ \nIt's on Netflix!!");
                    return
                }
                if(!error && response.statusCode === 200) {
                    console.log ("\nTitle: " + userMovie.Title);
                    console.log ("Year of Release: " + userMovie.Year);
                    console.log ("IMDB Rating: " + userMovie.imdbRating);
                    console.log ("Rotten Tomatoes Rating: " + userMovie.tomatoRating);
                    console.log ("Production Country: " + userMovie.Country);
                    console.log ("Language: " + userMovie.Language);
                    console.log ("Plot: " + userMovie.Plot);
                    console.log ("Actors: " + userMovie.Actors);
                } else {
                    console.log('\nError occurred.')
                };
        });
    });
};

function doWhatItSays () {
    fs.readFile('random.txt', "utf8", function(error, data){
        console.log ("\nBet you didn't see that one coming!")
        var txt = data.split(',');
        var random = Math.floor(Math.random() * txt.length);
        if (random === 0) {
            concertThis ();
        } else if (random === 1) {
            spotifyThis ();
        } else {
            movieThis ();
        }
    });
}