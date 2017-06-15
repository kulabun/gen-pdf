const _ = require('lodash'),
    metrics = require('./metrics'),
    prom = require('prom-client');

const htmlPdfDefaultoptions = {
    'format': {
        'quality': 100
    }
};

function insureRequest(req, res, next) {
    if(!req.body.html) {
        return res.sendStatus(400)
    }
    if (req.body) {
        try {
            var conf = req.body;//JSON.parse(req.body.config);
            var mergedConfig = {};
            _.merge(mergedConfig, htmlPdfDefaultoptions, conf);
            req.body.config = mergedConfig;
        } catch (e) {
            e.code = 415;
            return next(e);
        }
    } else {
        req.body.config = htmlPdfDefaultoptions;
    }
    return next();
}

function promRegisterMetrics(req, res) {
    res.end(prom.register.metrics());
}

function logErrors(err, req, res, next) {
    logger.error(err.message, err.stack, err);
    return next(err)
}

function promUpdateErrorMetrics(err, req, res, next) {
    metrics.httpRequestsTotal.inc({
        code: err.code || 500,
        method: req.method.toLowerCase()
    });
    return next(err);
}

function errorHandler(err, req, res, next) {
    return res.sendStatus(err.code || 500);
}

module.exports = {
    insureRequest: insureRequest,
    promRegisterMetrics: promRegisterMetrics,
    logErrors: logErrors,
    promUpdateErrorMetrics: promUpdateErrorMetrics,
    errorHandler: errorHandler
}
