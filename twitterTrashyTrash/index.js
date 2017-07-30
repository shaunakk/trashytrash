const twit = require('twit');
const twitfig = require('./twitfig');
const fs = require('fs');
const request = require('request');
const AWS = require('aws-sdk');
const awsfig = require('./awsfig');
AWS.config.update(awsfig);

var T = new twit(twitfig);
var lambda = new AWS.Lambda();

exports.handler = function(event, context){
    getTweets();
}

var disas = function(object){
    var res = "";
    for(var key in object){
        if(object[key] == '[object Object]'){
            res += key + ":\n" + disas(object[key]);
        } else {
            res += key + ": \"" + object[key] + "\"\n"
        }
    }
    return res;
}

function rekognize(tweet) {

    var media = tweet.entities.media;
    var place = tweet.place;
    var now = new Date();
    var temps = new Date(tweet.created_at);
    // var diff = (now - temps)/60000.0;
    if(!media ||
        media.length == 0 ||
        !place ||
        !place.bounding_box ||
        !place.bounding_box.coordinates
        // ||
        // diff > 240000
    ){
            return;
        }

    var d = {
        "text": tweet.text,
        "image_url": media[0].media_url,
        "lon": place.bounding_box.coordinates[0][0][0].toString(),
        "lat": place.bounding_box.coordinates[0][0][1].toString(),
        "diff": temps.toString()
    };
    var load = JSON.stringify(d)

    var params = {
        FunctionName: 'notTrash', // the lambda function we are going to invoke
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: load
    };

    lambda.invoke(params,
        function(err, data) {
      }
  )
  }


function getTweets(){
    var gotData = function(err, data, response){
        var tweets = data.statuses;
        for(var i = 0; i < tweets.length; i++){
            var tweet = tweets[i];
            rekognize(tweet);
        }
    }

    var params = {
        q: 'trashytrash',
        lang: 'en',
        result_type: 'recent',
        count: 30
    }
    //
    T.get('search/tweets', params, gotData);
  }
