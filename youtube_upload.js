/**
 * This script uploads a video (specifically `video.mp4` from the current
 * directory) to YouTube,
 *
 * To run this script you have to create OAuth2 credentials and download them
 * as JSON and replace the `credentials.json` file. Then install the
 * dependencies:
 *
 * npm i r-json lien opn bug-killer
 *
 * Don't forget to run an `npm i` to install the `youtube-api` dependencies.
 * */

// Depende3ncies
var Youtube = require("youtube-api");
var Fs = require("fs");
var ReadJson = require("r-json");
var Lien = require("lien");
var Logger = require("bug-killer");
var Opn = require("opn");
var ReadLine = require('readline');



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
        if (err) { lien(err, 400); return Logger.log(err); }
        oauth.setCredentials(tokens);

        ReadJson('./icm.json', function(error, data){

          for (var n = 0; n < 1; n++) {
            var video = data[n];
            console.log(video.name);
            console.log(video.description);
            var tags = [];
            for (var i = 0; i < video.tags.length; i++) {
              tags.push(video.tags[i].tag);
            }
            console.log(tags);

            Youtube.videos.insert({
                resource: {
                    snippet: {
                        title: video.name
                      , description: video.description
                      , tags: tags
                    }
                  , status: {
                        privacyStatus: "public"
                        embeddable: "public"
                    }
                  , recordingDetails: {
                        recordingDate: video.created_time 
                  }
                }
                // This is for the callback function
              , part: "snippet,status,recordingDetails"
              , media: {
                    body: Fs.createReadStream("transit.mov")
                }
            }, function (err, data) {
                if (err) { return lien.end(err, 400); }
                lien.end(data);
            });

          });
        }
    });
});