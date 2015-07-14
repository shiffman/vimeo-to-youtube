var google_secrets = require('./client_secrets.json');

var tokens;

require('google-cli-auth')({
      name: 'you-tube-uploading' // will be used to store the token under ~/.config/my-app/token.json
    , client_id: google_secrets.installed.client_id // enter client id from the developer console
    , client_secret: google_secrets.installed.client_secret // enter client secret from the developer console
    , scope: ['https://www.googleapis.com/auth/youtube.upload'] // add scopes 
}, function (error, token) {
    token.access_token // your token 
    token.token_type // token type
    token.expires_at // timestamp when this token will be expired
    token.refresh(huh) // Refreshes the token
    tokens = token;
    console.log(token);
});

function huh() {
  console.log('shiffman refresh');
}

setTimeout(function() {
  console.log('1 second later.');
  tokens.refresh(huh);
}, 1000);