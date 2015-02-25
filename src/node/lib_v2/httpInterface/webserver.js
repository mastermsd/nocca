'use strict';

var $http = require('http');
var $url = require('url');
var $scenarioRecorder = require('../scenarioRecorder');
var $scenario = require('../scenario');

module.exports = {};
module.exports.createServer = createServer;

// Configured routes will be collected in this map
var routes = {};

// Configure routes
addRoute('GET:/caches', getCaches);
addRoute('POST:/caches/package', addCachePackage);
addRoute('POST:/scenarios/startRecording', startRecordingScenario);
addRoute('POST:/scenarios/finishRecording', stopRecordingScenario);


// Setup the HTTP server and use the request router to handle all traffic
function createServer (config) {

    return $http.createServer(createRequestRouter(config))
        .listen(config.server.port, function () {
            console.log('HTTP server listening on port ' + config.server.port);
        });

}

// Wraps the request router in a closure to provide access to the configuration
function createRequestRouter (config) {

    var router = requestRouter;
    router.config = config;

    return router;

    // Selects handlers from the routes map (routes are defined below)
    function requestRouter (req, res) {

        var route = req.method.toUpperCase() + ':' + $url.parse(req.url).pathname;

        if (routes.hasOwnProperty(route)) {
            routes[route](req, res, config);
        }
        else {
            res.writeHead(404, 'Not found', {
                'Access-Control-Allow-Origin': '*'
            });
            res.write('Could not open ' + req.url, function() {
                res.end();
            });
        }

    }

}

// --- Route definitions

// Adds a handler to the routes map using one or more route definitions (first argument can be an array)
// Route definitions are of the form METHOD:/p/a/t/h
// Further specialization on query parameters or headers is not provided
function addRoute (routeStrings, handler) {

	// force array
    if (!_.isArray(routeStrings)) {
		routeStrings = [routeStrings];
	}

    routeStrings.forEach(function(routeDefinition) {
		routes[routeDefinition] = handler;
	});

}

//
//route('POST:/caches', function addCaches(req, res, config) {
//    res.write('ayeee you gave me caches to add!', function () {
//        res.end();
//    });
//});
//
//route('PUT:/caches', function replaceCaches(req, res, config) {
//    res.write('ayeee you gave me fresh caches!', function () {
//        res.end();
//    });
//});



function getCaches (req, res, config) {
	res.write(JSON.stringify(config.playback.exporter(), null, 2), function () {
		res.end();
	});
}

function addCachePackage (req, res, config) {
	var body = '';

	req.on('data', function (chunk) {
		body += chunk;
	});

	req.on('end', function () {

		if (body !== '') {
			try {
				body = JSON.parse(body);
			}
			catch (e) {
				res.writeHead(400, 'Bad request', {
					'Access-Control-Allow-Origin': '*'
				});
				res.write('Request body could not be parsed, is it a valid JSON string?');
				res.end();
			}
		}

		// if no req body was sent in body is not an object but empty string
		if (body === '') {
			body = {};
		}

		var recordings = router.config.playback.exporter();

		// extract from recordings
		var downloadObj = {};

		if (typeof body.requestKeys !== 'undefined') {
			body.requestKeys.forEach(function (value) {
				downloadObj[value] = recordings[value];
			});
		}
		else {
			// if no keys specified just download all recorded
			downloadObj = recordings;
		}


		res.writeHead(200, {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json'
		});

		res.write(JSON.stringify(downloadObj), function () {
			res.end();
		});

	});
}

function startRecordingScenario (req, res, config) {
	try {
		var parsedUrl = $url.parse(req.url);
		var title = (parsedUrl.query && parsedUrl.query.title) ? parsedUrl.query.title : undefined;

		$scenarioRecorder.startRecordingScenario(title);
		res.write('Started recording', function() {
			res.end();
		});
	} catch (e) {
		res.writeHead(409, 'Already Recording');
		res.write('Recording is already active', function() {
			res.end();
		});
	}
}

function stopRecordingScenario (req, res, config) {
	try {
		var parsedUrl = $url.parse(req.url, true);
		var scenario = $scenarioRecorder.finishRecordingScenario();

		console.log($scenario.Serializer(scenario));

		if (parsedUrl.query && parsedUrl.query['save'] == 'true') {
			console.log(scenario);
			config.playback.scenarioRecorder(scenario.player());
		}

		res.write(JSON.stringify(scenario), function() {
			res.end();
		});
	} catch (e) {
		res.writeHead(409, 'Finish Recording Failed');
		res.write(e.message, function() {
			res.end();
		});
	}
}
