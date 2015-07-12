
//require('shelljs/global');

var path = '/Users/danielshiffman/Dropbox/File\ requests/introcompmedia_videos/'
var fullpath = path + '2.0.mov';
var cmd = 'python upload.py --file="' + fullpath + '" --title="2.0" --privacyStatus="private"';

// if (exec(cmd).code !== 0) {
//   console.log('Error: something went wrong');
//   exit(1);
// }

var exec = require('child_process').exec;
exec(cmd, function(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error);
    }
});