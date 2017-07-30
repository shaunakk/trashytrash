const twit = require('twit');
const twitfig = require('./twitfig');
const fs = require('fs');
const request = require('request');

var T = new twit(twitfig)

function getTweets() {

    var write = function(err){
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    }

    var disas = function(object){
        var res = "";
        for(var key in object){
            if(object[key] == '[object Object]'){
                res += "" + disas(object[key]);
            } else {
                res += key + ": \"" + object[key] + "\"\n"
            }
        }
        return res;
    }

    var gotData = function(err, data, response){
        fs.writeFile("tweet.js", "Tweets:\n", write);
        var tweets = data.statuses;
        for(var i = 0; i < tweets.length; i++){
            console.log("Tweet nb " + i + ": " + tweets[i].text);
            var text = "\nTweet nb " + i + ": \n" +
                // tweets[i].text + "\n" +
                // tweets[i].geo + "\n" +
                // disas(tweets[i].place)
                disas(tweets[i])
            fs.appendFile("tweet.js", text, write);
        }
    }

    var params = {
        q: 'trashytrash',
        // lang: 'en',
        result_type: 'recent',
        count: 2
    }
    // console.log(params);
    T.get('search/tweets', params, gotData)
}

function talkToPython(){

}

getTweets();
