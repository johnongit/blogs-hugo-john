// Viewer-request function for the Hugo origin only. Player and Nostr bypass it.
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    if (uri === '/blogs' || uri.indexOf('/blogs/') === 0) {
        var path = uri.slice(6) || '/';
        var query = [];
        var params = request.querystring || {};
        Object.keys(params).forEach(function (key) {
            var values = params[key].multiValue || [params[key]];
            values.forEach(function (item) {
                query.push(key + '=' + item.value);
            });
        });
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                location: { value: 'https://inosta.cc' + path + (query.length ? '?' + query.join('&') : '') },
                'cache-control': { value: 'max-age=3600' }
            }
        };
    }
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } else if (uri.split('/').pop().indexOf('.') === -1) {
        request.uri += '/index.html';
    }
    return request;
}
