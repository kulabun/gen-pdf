# gen-pdf
> service to generate pdf from html using phantomjs, credit goes to [node-html-pdf](https://github.com/marcbachmann/node-html-pdf) package.

[![Docker Hub](https://img.shields.io/badge/docker-ready-blue.svg)](https://registry.hub.docker.com/u/waleedsamy/gen-pdf/)

#### How does it work
 - provide a wrapper around [node-html-pdf](https://github.com/marcbachmann/node-html-pdf) package.

 - accept required post body param `html`, which contains your html

 - accept optional post body param `config`, which is a string contain a valid json of configuration available at [node-html-pdf#options](configuration from https://github.com/marcbachmann/node-html-pdf#options)

#### Run locally
```bash
  $ npm install
  $ npm test
  $ npm start

  $ HTML=$(base64 -w 0 charts.html) && curl -o chart.pdf -X POST -H "Content-Type: application/json" -d "{\"html\":\"$HTML\"}" "http://localhost:3000/"
  # you could provide custom configuration to generate the pdf look Next javascript Example
  # all configuration from https://github.com/marcbachmann/node-html-pdf#options is possible configuration
  # prometheus metrics
  $ curl "http://localhost:3000/metrics"
  # http_requests_total{code="400",method="post"} 1
```

#### Example
```javascript
    let config = {
      orientation: 'landscape',
      border: {
        top: '19mm'
      },
      footer: {
        height: '28mm',
        contents: {
          '2': 'Second page',
          'first': 'Cover page',
          'default': '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
          'last': 'Last Page'
        }
      }
    };
    let settings = {
      "url": "http://localhost:3000/",
      "method": "POST",
      "headers": {
        "content-type": "application/x-www-form-urlencoded"
      },
      "data": {
        "html": "<div>hi</div>",
        "config": JSON.stringify(config)
      }
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
    });
```
#### Build and run with docker
```bash
  $ docker build -t waleedsamy/gen-pdf . # or docker pull waleedsamy/gen-pdf
  $ docker run -d -e LOG_FORMAT=pretty -p 3000:3000 waleedsamy/gen-pdf
```

#### Kubernetes friendly
```bash
  # prometheus will scrape pdfgenerator service automatically
  $ kubect create -f ./deploy/
```
