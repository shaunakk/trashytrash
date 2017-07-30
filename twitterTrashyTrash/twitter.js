const twit = require('twit');
const twitfig = require('./twitfig');
const awsfig = require('./awsfig');
const fs = require('fs');
const request = require('request');
const AWS = require('aws-sdk');
AWS.config.update(awsfig);

var T = new twit(twitfig)
var write = function(err){
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}
var lambda = new AWS.Lambda();

var disas = function(object){
        var res = "";
        for(var key in object){
            if(object[key] == '[object Object]'){
                res += "----------\n" + key + ":\n" + disas(object[key]) + "----------\n";
            } else {
                res += key + ": \"" + object[key] + "\"\n"
            }
        }
        return res;
}



function getTweets() {



    var gotData = function(err, data, response){
        fs.writeFile("tweet.json", "Tweets:\n", write);
        var tweets = data.statuses;
        // fs.writeFile("response.json", disas(response), write);
        for(var i = 0; i < tweets.length; i++){
            console.log("Tweet nb " + i + ": " + tweets[i].text);
            var medias = tweets[i].entities.media;
            var t = (new Date(tweets[i].created_at)).getTime();
            var now = (new Date()).getTime();
            var diff = (now - t)/60000;
            if(medias && medias.length > 0 && diff < 500){
                var text = "\nTweet nb " + i + ": \n" +
                    tweets[i].text + "\n" +
                    diff + "\n"
                    // tweets[i].place.bounding_box.coordinates[0][0][0] + "\n" +
                    // tweets[i].place.bounding_box.coordinates[0][0][1];
            } else {
                var text = "No images added"
            }
            fs.appendFile("tweet.json", text, write);
        }
    }

    var params = {
        q: 'trashytrash',
        // lang: 'en',
        result_type: 'recent',
        count: 5
    }
    // console.log(params);
    T.get('search/tweets', params, gotData)
}


function getJSON(){
    request.get(url(), function(error, response, body){
            var d = JSON.parse(body);
            fs.writeFile("test.js", d, write);
        });
}

function url(){
    return "https://a2z3kzaxi3.execute-api.us-east-1.amazonaws.com/prod/PythonTest"
}

// talkToPython();
// getTweets();

function talkToPython(){
    var params = {
        FunctionName: 'PythonTest', // the lambda function we are going to invoke
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: '{ "name" : "Alex" }'
    };

    lambda.invoke(params, function(err, data) {
        if (err) {
            console.log("failed: " + err);
        } else {
          console.log("succeed: " + disas(data));
        }
      })
}

getTweets();
