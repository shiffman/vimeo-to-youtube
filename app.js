"use strict";
/**
 *   Copyright 2013 Vimeo
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

var fs = require('fs');
var Vimeo = require('vimeo').Vimeo;
var config = require('./config.json');
var lib = new Vimeo(config.client_id, config.client_secret);

if (config.access_token) {
  lib.access_token = config.access_token;
  searchChannel('introcompmedia');
} 

function makeVideoList(videos) {
  var list = [];
  for (var i = 0; i < videos.data.length; i++) {
    var uri = videos.data[i].uri;
    var id = uri.substring(8,uri.length); 
    download(id);

    list.push(id);
    //list.push(videos.data[i].name);
  }
  console.log(list);

  var out = JSON.stringify(videos.data, null, 2);
  fs.writeFile('data.json', out, function (err) {
    if (err) return console.log(err);
  });
}

function download(id) {
  // Make an API request
  lib.request({
    path : '/videos/' + id,
    query : {
      per_page : 1,
    }
  }, function (error, body, status_code, headers) {
    if (error) {
      console.log(error);
    } else {
      console.log(body);
    }
  });
}


function searchChannel(name) {
  // Make an API request
  lib.request({
    path : '/channels/' + name + '/videos',
    query : {
      per_page : 1,
      sort: 'alphabetical',
      order: 'asc'
    }
  }, function (error, body, status_code, headers) {
    if (error) {
      console.log(error);
    } else {
      makeVideoList(body);
    }
  });
}