/**
 * 
 * This code is based on examples from @IonicaBizau youtube-api
 *
 * Requires you have to create OAuth2 credentials and download them
 * as JSON and replace the `credentials.json` file.
 * 
 */

// dependencies
var Youtube = require("youtube-api");
var Fs = require("fs");
var ReadJson = require("r-json");
var Lien = require("lien");
var Logger = require("bug-killer");
var Opn = require("opn");
var ReadLine = require('readline');


var path = '/Users/danielshiffman/Dropbox/File\ requests/introcompmedia_videos/'

// Constants
// I downloaded the file from OAuth2 -> Download JSON
const CREDENTIALS = ReadJson("./credentials.json");

// Init lien server
var server = new Lien({
    host: "localhost"
  , port: 5000
});


var stdIn = ReadLine.createInterface({
    input: process.stdin
  , output: process.stdout
});

// Authenticate
// You can access the Youtube resources via OAuth2 only.
// https://developers.google.com/youtube/v3/guides/moving_to_oauth#service_accounts
var oauth = Youtube.authenticate({
    type: "oauth"
  , client_id: CREDENTIALS.web.client_id
  , client_secret: CREDENTIALS.web.client_secret
  , redirect_url: CREDENTIALS.web.redirect_uris[0]
});

Opn(oauth.generateAuthUrl({
    access_type: "offline"
  , scope: ["https://www.googleapis.com/auth/youtube.upload"]
}));

// Handle oauth2 callback
server.page.add("/oauth2callback", function (lien) {
    Logger.log("Trying to get the token using the following code: " + lien.search.code);
    oauth.getToken(lien.search.code, function(err, tokens) {
        
        if (err) { 
          lien.end(err, 400); 
          return Logger.log(err); 
        }
        
        oauth.setCredentials(tokens);

        ReadJson('./icm.json', function(error, data){

          for (var n = 0; n < data.length; n++) {
            var video = data[n];
            var tags = [];
            for (var i = 0; i < video.tags.length; i++) {
              tags.push(video.tags[i].tag);
            }
            var ind = video.created_time.indexOf('+');
            var thedate = video.created_time.substring(0,ind) + '.000Z';
            var filename = video.name.match(/^\d+\.\d+/) + '.mov';
            console.log('starting upload for video: ' + filename);

            Youtube.videos.insert({
                resource: {
                    snippet: {
                        title: video.name
                      , description: video.description
                      , tags: tags
                    }
                  , status: {
                        privacyStatus: "private"
                  ,     embeddable: "public"
                    }
                  , recordingDetails: {
                        recordingDate: thedate
                  }
                }
                // This is for the callback function
              , part: "snippet,status,recordingDetails"
              , media: {
                    body: Fs.createReadStream(path + filename)
                }
            }, callbackit(filename));
          }
        });
    });
});

function callbackit(filename) {
  return function (err, data) {
    if (err) { 
      return lien.end(err, 400);
    }
    console.log('finished video: ' + filename);
  };
}
