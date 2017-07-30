var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/web'));

// views is directory for all template files
app.set('views', __dirname + '/');

app.get('/', function(request, response) {
  response.sendFile('web/index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is now running on port', app.get('port'));
});

