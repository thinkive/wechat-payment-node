'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _jssha = require('jssha');

var _jssha2 = _interopRequireDefault(_jssha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var utils = function () {
    function utils() {
        (0, _classCallCheck3.default)(this, utils);
    }

    (0, _createClass3.default)(utils, null, [{
        key: 'sign',
        value: function sign(object, key) {
            var querystring = utils.createQueryString(object);
            if (key) querystring += "&key=" + key;
            console.log(querystring, 'hahahahahahh');
            return (0, _md2.default)(querystring).toUpperCase();
        }
    }, {
        key: 'shaSign',
        value: function shaSign(object) {
            var querystring = utils.createQueryString(object);

            var shaObj = new _jssha2.default("SHA-1", 'TEXT');
            shaObj.update(querystring);
            return shaObj.getHash('HEX');
        }
    }, {
        key: 'createNonceStr',
        value: function createNonceStr(length) {
            length = length || 24;
            if (length > 32) length = 32;

            return (Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)).substr(0, length);
        }
    }, {
        key: 'createTimestamp',
        value: function createTimestamp() {
            return parseInt(new Date().getTime() / 1000) + '';
        }
    }, {
        key: 'createQueryString',
        value: function createQueryString(options) {
            return (0, _keys2.default)(options).filter(function (key) {
                return options[key] !== undefined && options[key] !== '' && ['pfx', 'apiKey', 'sign', 'key'].indexOf(key) < 0;
            }).sort().map(function (key) {
                return key + '=' + options[key];
            }).join("&");
        }
    }, {
        key: 'buildXML',
        value: function buildXML(json) {
            var builder = new _xml2js2.default.Builder();
            return builder.buildObject(json);
        }
    }, {
        key: 'parseXML',
        value: function parseXML(xml, fn) {
            return new _promise2.default(function (resolve, reject) {
                var parser = new _xml2js2.default.Parser({ trim: true, explicitArray: false, explicitRoot: false });
                parser.parseString(xml, function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        }
    }, {
        key: 'parseRaw',
        value: function parseRaw() {
            return function (req, res, next) {
                var buffer = [];
                req.on('data', function (trunk) {
                    buffer.push(trunk);
                });
                req.on('end', function () {
                    req.rawbody = Buffer.concat(buffer).toString('utf8');
                    next();
                });
                req.on('error', function (err) {
                    next(err);
                });
            };
        }
    }, {
        key: 'pipe',
        value: function pipe(stream, fn) {
            var buffers = [];
            stream.req.on('data', function (trunk) {
                buffers.push(trunk);
            });
            stream.req.on('end', function () {
                fn(null, Buffer.concat(buffers));
            });
            stream.req.once('error', fn);
        }
    }, {
        key: 'buildQueryStringWithoutEncode',
        value: function buildQueryStringWithoutEncode(obj) {
            return obj ? (0, _keys2.default)(obj).sort().map(function (key) {
                var val = obj[key];
                key = key.toLowerCase();
                if (Array.isArray(val)) {
                    return val.sort().map(function (val2) {
                        return key + '=' + val2;
                    }).join('&');
                }
                return key + '=' + val;
            }).join('&') : '';
        }
    }]);
    return utils;
}();

exports.default = utils;