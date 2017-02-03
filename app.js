var
  apiai = require('apiai'),
  Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.EN_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.EN_TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.EN_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.EN_TWITTER_ACCESS_TOKEN_SECRET
})

var app = apiai(process.env.APIAI_BEARER_TOKEN_DEV);

client.stream("user",function(strm_user){

  var BOT_ID = "konojunya_EN"

  strm_user.on("data",function(data){
    var id = ('user' in data && 'screen_name' in data.user) ? data.user.screen_name : null;
    var text = ('text' in data) ? data.text.replace(new RegExp('^@' + BOT_ID + ' '), '') : '';
    var ifMention = ('in_reply_to_user_id' in data) ? (data.in_reply_to_user_id !== null) : false;

    if (!ifMention || id == BOT_ID) return;

    if(data.lang != "en"){
      text = "fox says"
    }

    var request = app.textRequest(text, {
      sessionId: '123456789'
    });
     
    request.on('response', function(response) {

      if(data.lang != "en"){
        response.result.fulfillment.speech += (" Please speak in English.")
      }

      var msg = '@' + id + ' ' + response.result.fulfillment.speech;
      var params = {
        "status": msg,
        "in_reply_to_status_id": data.id_str
      }

      client.post("statuses/update", params, function(err,tweet,res){
        if (err) throw err
      });
    });
     
    request.on('error', function(error) { throw error; });
     
    request.end();
  })
  strm_user.on('error', function(error) {
    throw error;
  });
})