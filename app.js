var express = require('express');
var app = express();
var http = require("http").Server(app);
var Twit = require('twit');
var request = require('request').defaults({strictSSL: false});

var twitter = new Twit({
  consumer_key: process.env.KONOJUNYA_BOT_APIKEY,
  consumer_secret: process.env.KONOJUNYA_BOT_APISECRET,
  access_token: process.env.KONOJUNYA_BOT_TOKEN,
  access_token_secret: process.env.KONOJUNYA_BOT_TOKEN_SECRET
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send('This is Twitter-bot application. @konojunya_bot')
});

// ------------------------------
// docomo api start
// ------------------------------
var api = "https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue?APIKEY=";
var token = process.env.KONOJUNYA_BOT_DOCOMOAPI_TOKEN;
// context用
var status = {};
// ------------------------------
// docomo api end
// ------------------------------
var botId = "konojunya_bot";
var stream = twitter.stream('user');
stream.on('tweet', function(data) {
  var userId = data.user.screen_name; //相手の名前
  var replyStr = data.text.replace(new RegExp('^@' + botId + ' '), '');
  var isMention = (data.in_reply_to_user_id !== null);
  if(!isMention || userId === botId) return;
  status.utt = replyStr;
  status.nickname = userId;
  var param = { body: JSON.stringify(status) }
  request.post(api + token, param, function(err, res, data) {
    body = JSON.parse(data);

    status.context = body.context;
    status.mode = body.mode;
    var msg = "@" + userId + " " + body.utt;
    twitter.post('statuses/update', {
      "in_reply_to_status_id": data.id_str,
       "status": msg
    }, function(err, data, response) {});
  });
});

app.listen(1115, function() {
  console.log("Node app is running at konojunya.com:1115")
});
