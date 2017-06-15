var express = require('express'),
    prom = require('prom-client'),
    conversion = require("phantom-html-to-pdf")(),
    bodyParser = require('body-parser'),
    exwml = require('exwml'),
    app = express(),
    insureRequest = require('./middleware').insureRequest,
    promRegisterMetrics = require('./middleware').promRegisterMetrics,
    logErrors = require('./middleware').logErrors,
    promUpdateErrorMetrics = require('./middleware').promUpdateErrorMetrics,
    errorHandler = require('./middleware').errorHandler,
    metrics = require('./metrics'),
    jsonParser = bodyParser.json({
        limit: '5mb'
    });

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/help.html');
});

app.post('/', jsonParser, insureRequest, function (req, res, next) {
    var settings = req.body;
    if (settings.html) {
        settings.html = new Buffer(req.body.html, 'base64').toString();
    }
    if (settings.header) {
        settings.header = new Buffer(req.body.header, 'base64').toString();
    }
    if (settings.footer) {
        settings.footer = new Buffer(req.body.footer, 'base64').toString();
    }

    conversion(settings, function (err, result) {
        if (err || !result) {
            console.log(err);
            metrics.httpRequestsTotal.inc({
                code: 500,
                method: 'post'
            });
            return res.sendStatus(500);
        }

        metrics.httpRequestsTotal.inc({
            code: 200,
            method: 'post'
        });
        result.stream.pipe(res);
    });
});

app.get('/metrics', promRegisterMetrics);

app.use(logErrors);
app.use(promUpdateErrorMetrics);
app.use(errorHandler);

app.listen(3000, function () {
    logger.alert('Service starting', {
        host: 'localhost',
        port: 3000
    });
})
