var fs = require('fs');


var path = '/Users/danielshiffman/Dropbox/File\ requests/introcompmedia_videos/'

var files = fs.readdirSync(path);

for (var i = 0; i < files.length; i++) {
  var name = files[i].match(/^\d+\.\d+/);
  fs.renameSync(path+files[i], path+name+".mov");
}



// fs.rename('/path/to/Afghanistan.png', '/path/to/AF.png', function(err) {
//     if ( err ) console.log('ERROR: ' + err);
// });