
var googleauth = require('google-auth-cli');
var ResumableUpload = require('node-youtube-resumable-upload'); 
var google_secrets = require('./client_secrets.json');

var tokens;
var path = '/Users/danielshiffman/Dropbox/File\ requests/introcompmedia_videos/'

var upload = function() {
  var metadata = {
    snippet: { 
      title: 'New Upload 2', 
      description: 'Uploaded with ResumableUpload' 
    },
    status: { 
      privacyStatus: 'private' 
    }
  };

  var resumableUpload = new ResumableUpload(); //create new ResumableUpload
  resumableUpload.tokens  = tokens;
  resumableUpload.filepath  = path + '3.2.mov';
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
    var percent = Math.floor(mbsofar/totalmb)*100;
    console.log(mbsofar + "mb out of " + totalmb + "mb, " + percent + "%  " + timepassed + " seconds");
  });
  resumableUpload.on('error', function(error) {
    console.log(error);
  });
  resumableUpload.on('success', function(success) {
    console.log('finished!');
    console.log(success);
  });
}

var getTokens = function(callback) {
  googleauth({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/youtube.upload' //can do just 'youtube', but 'youtube.upload' is more restrictive
  },
  {   client_id: google_secrets.installed.client_id, //replace with your client_id and _secret
      client_secret: google_secrets.installed.client_secret,
      timeout: 240 * 60 * 1000, // Give each upload four hours, google might not allow more than an hour?
      port: 3000
  },
  function(err, authClient, tokens) {
    if (err) {
      console.log("-------Error!------------");
      console.log(err);
      console.log("-------------------------");
    }
    callback(tokens);
    return;
  });
};

var starttime;

getTokens(function(result) {
  console.log('Executing get tokens to start!');
  console.log('tokens:' + result);
  tokens = result;
  starttime = new Date().getTime();
  upload();
  return;
});