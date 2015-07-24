
var googleauth = require('google-cli-auth');
var ResumableUpload = require('node-youtube-resumable-upload'); 
var google_secrets = require('./client_secrets.json');
var icm = require('./icm.json');

var tokens;
var path = '/Users/danielshiffman/Dropbox/File\ requests/introcompmedia_videos/'

var start = 26;

var uploadNext = function(index) {
  var video = icm[index];
  var tags = [];
  for (var i = 0; i < video.tags.length; i++) {
    tags.push(video.tags[i].tag);
  }
  var ind = video.created_time.indexOf('+');
  var thedate = video.created_time.substring(0,ind) + '.000Z';
  var filename = video.name.match(/^\d+\.\d+/) + '.mov';

  var newname = video.name.replace(/ICM/,'Learning Processing');
  console.log('starting upload for video: ' + filename + ' : ' + newname + ' : ' + index + ' ' + tags);

  var metadata = {
    snippet: { 
      title: newname, 
      description: video.description,
      tags: tags,
      // thumbnails: {
      //   high: {
      //     url: video.pictures.sizes[5].link,
      //     width: video.pictures.sizes[5].width,
      //     height: video.pictures.sizes[5].height
      //   }
      // }
    }, 
    status: {
      privacyStatus: "private",
      embeddable: "public"
    }, 
    // contentDetails: {
      
    // },
    recordingDetails: {
      recordingDate: thedate
    }
  };

  console.log(metadata);

  var resumableUpload = new ResumableUpload(); //create new ResumableUpload
  resumableUpload.tokens  = tokens;
  resumableUpload.filepath  = path + filename;
  resumableUpload.metadata  = metadata;
  resumableUpload.monitor = true;
  resumableUpload.retry   = -1;  //infinite retries, change to desired amount
  resumableUpload.initUpload();
  
  resumableUpload.on('progress', function(progress) {
    var now = new Date().getTime();
    var timepassed = Math.floor((now - starttime)/1000);
    var values = progress.split('/');
    var mbsofar = Math.floor(Number(values[0])/(1024*1024));
    var totalmb = Math.floor(Number(values[1])/(1024*1024));
    var percent = Math.floor(100*mbsofar/totalmb);
    console.log(mbsofar + "mb out of " + totalmb + "mb, " + percent + "%  " + timepassed + " seconds");
  });
  resumableUpload.on('error', function(error) {
    console.log("reusumable upload error");
    console.log(error);
  });
  resumableUpload.on('success', function(success) {
    console.log('finished!');
    console.log(success);
    if (index < icm.length) {
      tokens.refresh(function() {
        uploadNext(index + 1);
      });
    }
  });
}

// var getTokens = function(callback) {
//   googleauth({
//       access_type: 'offline',
//       scope: 'https://www.googleapis.com/auth/youtube.upload' //can do just 'youtube', but 'youtube.upload' is more restrictive
//   },
//   {   client_id: google_secrets.installed.client_id, //replace with your client_id and _secret
//       client_secret: google_secrets.installed.client_secret,
//       timeout: 240 * 60 * 1000, // Give each upload four hours, google might not allow more than an hour?
//       port: 3000
//   },
//   function(err, authClient, tokens) {
//     if (err) {
//       console.log("-------Error!------------");
//       console.log(err);
//       console.log("-------------------------");
//     }
//     callback(tokens);
//     return;
//   });
// };

var starttime;

// getTokens(function(result) {
//   console.log('Executing get tokens to start!');
//   console.log('tokens:' + result);
//   tokens = result;
//   starttime = new Date().getTime();
//   uploadNext(start);
//   return;
// });

var google_secrets = require('./client_secrets.json');

require('google-cli-auth')({
      name: 'you-tube-uploading' // will be used to store the token under ~/.config/my-app/token.json
    , client_id: google_secrets.installed.client_id // enter client id from the developer console
    , client_secret: google_secrets.installed.client_secret // enter client secret from the developer console
    , scope: ['https://www.googleapis.com/auth/youtube.upload'] // add scopes 
}, function (error, result) {
    tokens = result;
    tokens.refresh(function() {
      starttime = new Date().getTime();
      uploadNext(start);
    }); // Refreshes the token
    //console.log(token);
});



