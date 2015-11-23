var fs = require('fs');
var https = require('https');
var express = require('express');
var socket = require('socket.io')(https, {
    origins: 'yourOrigins.com'
});
var sslOptions = {
    key: fs.readFileSync('ssl/yourKey.key'),
    cert: fs.readFileSync('ssl/yourCert.crt')
};
var gpio = require('rpi-gpio');
var mysql = require('mysql');
var timer = 0;
var inSession = false;
var app = express();
var sys = require('sys');
var proc;

var server = https.createServer(sslOptions, app);
var io = socket.listen(server, {
    "log level": 3,
    "match origin protocol": true
});

server.listen(443, function() {
    console.log('bazinga!');
    doTheThing(); //init
});
gpio.setMode(gpio.MODE_BCM);

app.get('/socket.io.js', function(req, res) {
    res.sendFile(__dirname + '/socket.io.js');
});

io.on('connection', function(socket) {
    console.log('a user connected');
});


function getHighScore() {
    var connection = mysql.createConnection({
        host: 'dbHost',
        user: 'dbUser',
        password: 'dbPassword',
        database: 'dbName',
    });
    var queryString = "SELECT CONCAT(TIMEDIFF(sessionComplete, sessionStart), ' @ ', DATE_FORMAT(sessionComplete, '%r')) AS Score FROM highScore WHERE DATE(sessionComplete) = DATE(NOW()) ORDER BY Score DESC LIMIT 1";
    var scores = [];
    var message = {
        'type': 'highScore',
        'data': scores
    }
    connection.connect();
    connection.query(queryString, function(err, rows, fields) {
        if (err) throw err;
        for (var i in rows) {
            scores.push(rows[i].Score);
        }
        io.emit('message', message);
    });

    connection.end();
}

function getLastScore() {
    var connection = mysql.createConnection({
        host: 'dbHost',
        user: 'dbUser',
        password: 'dbPassword',
        database: 'dbName',
    });
    var queryString = "SELECT CONCAT(TIMEDIFF(sessionComplete, sessionStart), ' @ ', DATE_FORMAT(sessionComplete, '%r')) AS Score FROM highScore WHERE DATE(sessionComplete) = DATE(NOW()) ORDER BY ID DESC LIMIT 1";
    var scores = [];
    var message = {
        'type': 'lastScore',
        'data': scores
    }
    connection.connect();
    connection.query(queryString, function(err, rows, fields) {
        if (err) throw err;
        for (var i in rows) {
            scores.push(rows[i].Score);
        }
        io.emit('message', message);
    });

    connection.end();
}

function startSession() {
    var connection = mysql.createConnection({
        host: 'dbHost',
        user: 'dbUser',
        password: 'dbPassword',
        database: 'dbName',
    });
    var queryString = "INSERT INTO highScore (sessionStart) VALUES (NOW())";
    connection.connect();
    connection.query(queryString, function(err) {
        if (err) throw err;
    });
    connection.end();

    proc = require('child_process').spawn('pianobar'); //play some sick 80's tunes
}

function finishSession() {
    var connection = mysql.createConnection({
        host: 'dbHost',
        user: 'dbUser',
        password: 'dbPassword',
        database: 'dbName',
    });
    var queryString = "UPDATE highScore SET sessionComplete=NOW() WHERE ID = (SELECT ID FROM (SELECT MAX(ID) AS ID FROM highScore ORDER BY ID DESC LIMIT 1 ) h )";
    connection.connect();
    connection.query(queryString, function(err) {
        if (err) throw err;
    });
    connection.end();
    proc.stdin.write('q\n'); //stop the jams
    proc.stdin.end(); //close the shell
}


function doTheThing() { //the actual reading of the gpio and what needs to happen at certain events
    gpio.setup(18, gpio.DIR_OUT, write);

    function write() {
        gpio.write(18, false, function(err) {
            if (err) throw err;
            read();
        });
    }

    function read() {
        gpio.setup(18, gpio.DIR_IN, step2);

        function step2() {
            gpio.read(18, function(err, value) {
                if (value == false && timer < 100) {
                    //console.log(timer);
                    //Should probably change this to record the delta between the last 'true' value instead of ticking away wildly.
                    timer++
                    setTimeout(function() {
                        step2();
                    }, 100);
                } else {
                    var message = {
                        'type': 'status',
                        'data': timer
                    }

                    if (timer < 5) {
                        if (inSession == false) {
                            console.log('light on');
                            startSession();
                            start = new Date();
                        }
                        inSession = true;

                    } else {
                        if (inSession == true) {
                            console.log('light off');
                            end = new Date().getTime();
                            finishSession();
                        }
                        inSession = false;
                    }

                    io.emit('message', message);
                    timer = 0;
                    getHighScore();
                    getLastScore();
                    doTheThing();
                }
            });
        }
    }
}
