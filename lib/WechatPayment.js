'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _urls = require('./urls');

var _urls2 = _interopRequireDefault(_urls);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WechatPayment = function () {
    function WechatPayment(options) {
        (0, _classCallCheck3.default)(this, WechatPayment);

        if (!options.appid || !options.mch_id) {
            throw new Error("Seems that app id or merchant id is not set, please provide wechat app id and merchant id.");
            //throw new Error('haha');
        }
        this.options = options;
    }

    /**
     * create wechat unified order
     * @params order object
     * 
     * spec: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_1
     */

    (0, _createClass3.default)(WechatPayment, [{
        key: 'createUnifiedOrder',
        value: function createUnifiedOrder(order) {
            var _this2 = this;

            return new _promise2.default(function (resolve, reject) {
                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.appid = _this2.options.appid;
                order.mch_id = _this2.options.mch_id;
                order.sign = _utils2.default.sign(order, _this2.options.apiKey);
                var requestParam = {
                    url: _urls2.default.UNIFIED_ORDER,
                    method: 'POST',
                    body: _utils2.default.buildXML(order)
                };
                (0, _request2.default)(requestParam, function (err, response, body) {
                    if (err) {
                        reject(err);
                    }
                    _utils2.default.parseXML(body).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            });
        }

        /**
         * config for payment 
         * 
         * @param prepayId from prepay id
         */

    }, {
        key: 'configForPayment',
        value: function configForPayment(prepayId) {
            var configData = {
                appid: this.options.appid,
                partnerid: this.options.mch_id,
                prepayid: prepayId,
                package: 'Sign=WXPay',
                noncestr: _utils2.default.createNonceStr(),
                timestamp: parseInt(new Date().getTime() / 1000)
            };
            configData.sign = _utils2.default.sign(configData, this.options.apiKey);
            return configData;
        }

        /**
         * query
         * 
         * 
         * spec: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_2
         */

    }, {
        key: 'queryOrder',
        value: function queryOrder(query) {
            var _this3 = this;

            return new _promise2.default(function (resolve, reject) {
                if (!(query.transaction_id || query.out_trade_no)) {
                    reject(new Error('缺少参数'));
                }

                query.nonce_str = query.nonce_str || _utils2.default.createNonceStr();
                query.appid = _this3.options.appid;
                query.mch_id = _this3.options.mch_id;
                query.sign = _utils2.default.sign(query, _this3.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.ORDER_QUERY,
                    method: "POST",
                    body: _utils2.default.buildXML({ xml: query })
                }, function (err, res, body) {
                    _utils2.default.parseXML(body).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            });
        }
    }, {
        key: 'closeOrder',
        value: function closeOrder(order) {
            return new _promise2.default(function (resolve, reject) {
                if (!order.out_trade_no) {
                    reject(new Error('缺少参数'));
                }

                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.appid = WechatPayment.options.appid;
                order.mch_id = WechatPayment.options.mch_id;
                order.sign = _utils2.default.sign(order, WechatPayment.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.CLOSE_ORDER,
                    method: "POST",
                    body: _utils2.default.buildXML({ xml: order })
                }, function (err, res, body) {
                    _utils2.default.parseXML(body).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            });
        }
    }, {
        key: 'refund',
        value: function refund(order) {
            return new _promise2.default(function (resolve, reject) {
                if (!order.transaction_id && !order.out_trade_no || !order.out_refund_no) {
                    reject(new Error('缺少参数'));
                }

                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.appid = WechatPayment.options.appid;
                order.mch_id = WechatPayment.options.mch_id;
                order.op_user_id = order.op_user_id || order.mch_id;
                order.sign = _utils2.default.sign(order, WechatPayment.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.REFUND,
                    method: "POST",
                    body: _utils2.default.buildXML({ xml: order }),
                    agentOptions: {
                        pfx: WechatPayment.options.pfx,
                        passphrase: WechatPayment.options.mch_id
                    }
                }, function (err, response, body) {
                    _utils2.default.parseXML(body).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            });
        }
    }, {
        key: 'queryRefund',
        value: function queryRefund(order) {
            return new _promise2.default(function (resolve, reject) {
                if (!(order.transaction_id || order.out_trade_no || order.out_refund_no || order.refund_id)) {
                    reject(new Error('缺少参数'));
                }

                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.appid = WechatPayment.options.appid;
                order.mch_id = WechatPayment.options.mch_id;
                order.sign = _utils2.default.sign(order, WechatPayment.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.REFUND_QUERY,
                    method: "POST",
                    body: _utils2.default.buildXML({ xml: order })
                }, function (err, response, body) {
                    _utils2.default.parseXML(body).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            });
        }
    }, {
        key: 'transfers',
        value: function transfers(order) {
            return new _promise2.default(function (resolve, reject) {
                if (!(order.partner_trade_no && order.openid && order.check_name && order.amount && order.desc && order.spbill_create_ip)) {
                    reject(new Error('缺少参数'));
                }

                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.mch_appid = WechatPayment.options.appid;
                order.mchid = WechatPayment.options.mch_id;
                order.sign = _utils2.default.sign(order, WechatPayment.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.TRANSFERS,
                    method: "POST",
                    body: _utils2.default.buildXML(order),
                    agentOptions: {
                        pfx: WechatPayment.options.pfx,
                        passphrase: WechatPayment.options.mch_id
                    }
                }, function (err, response, body) {
                    _utils2.default.parseXML(body, fn);
                });
            });
        }
    }, {
        key: 'queryTransferInfo',
        value: function queryTransferInfo(order, fn) {
            return new _promise2.default(function (resolve, reject) {
                if (!order.partner_trade_no) {
                    reject(new Error('缺少参数'));
                }

                order.nonce_str = order.nonce_str || _utils2.default.createNonceStr();
                order.appid = WechatPayment.options.appid;
                order.mch_id = WechatPayment.options.mch_id;
                order.sign = _utils2.default.sign(order, WechatPayment.options.apiKey);

                (0, _request2.default)({
                    url: _urls2.default.TRNSFER_INFO,
                    method: "POST",
                    body: _utils2.default.buildXML({ xml: order }),
                    agentOptions: {
                        pfx: WechatPayment.options.pfx,
                        passphrase: WechatPayment.options.mch_id
                    }
                }, function (err, response, body) {
                    _utils2.default.parseXML(body, fn);
                });
            });
        }
    }, {
        key: 'getBrandWCPayRequestParams',
        value: function getBrandWCPayRequestParams(order) {
            var _this4 = this;

            return new _promise2.default(function (resolve, reject) {
                order.trade_type = "JSAPI";
                _this4.createUnifiedOrder(order).then(function (data) {
                    var reqparam = {
                        appId: _this4.options.appid,
                        timeStamp: _utils2.default.createTimestamp(),
                        nonceStr: data.nonce_str,
                        package: "prepay_id=" + data.prepay_id,
                        signType: "MD5"
                    };
                    reqparam.paySign = _utils2.default.sign(reqparam, _this4.options.apiKey);
                    resolve(reqparam);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'createMerchantPrepayUrl',
        value: function createMerchantPrepayUrl(param) {
            param.time_stamp = param.time_stamp || _utils2.default.createTimestamp();
            param.nonce_str = param.nonce_str || _utils2.default.createNonceStr();
            param.appid = this.options.appid;
            param.mch_id = this.options.mch_id;
            param.sign = _utils2.default.sign(param, this.options.apiKey);

            var query = (0, _keys2.default)(param).filter(function (key) {
                return ['sign', 'mch_id', 'product_id', 'appid', 'time_stamp', 'nonce_str'].indexOf(key) >= 0;
            }).map(function (key) {
                return key + "=" + encodeURIComponent(param[key]);
            }).join('&');

            return "weixin://wxpay/bizpayurl?" + query;
        }
    },
	{
        key: 'wxCallback',
        value: function wxCallback(req, next) {
            var _this5 = this;

             return new _promise2.default(function (resolve, reject) {
                var _this = _this5;
                _utils2.default.pipe(req, function (err, data) {
                    var xml = data.toString('utf8');
                    _utils2.default.parseXML(xml).then(function (notification) {
                        var dataForSign = (0, _assign2.default)({}, notification);
						//console.log(2)
						//console.log(dataForSign)
						//console.log(notification)
                        //delete dataForSign.sign;
                        //var signValue = _utils2.default.sign(dataForSign, apiKey);
						//console.log(3)
						//console.log(signValue)
                        //if (signValue != notification.sign) {
                        //    fn.apply(_this, [null, req, res, next]);
                        //} else {
                            resolve(notification)
                        //}
                    }).catch(function (err) {
                       reject(err)
                    });
                });
            });
        }
    }
	], [{
        key: 'wxCallback',
        value: function wxCallback(fn, apiKey) {
            var _this5 = this;

            return function (req, res, next) {
                var _this = _this5;
                res.success = function () {
                    res.end(_utils2.default.buildXML({ xml: { return_code: 'SUCCESS' } }));
                };
                res.fail = function () {
                    res.end(_utils2.default.buildXML({ xml: { return_code: 'FAIL' } }));
                };
                console.log("hahah");
                _utils2.default.pipe(req, function (err, data) {
                    var xml = data.toString('utf8');
                    _utils2.default.parseXML(xml).then(function (notification) {

                        var dataForSign = (0, _assign2.default)({}, notification);
                        delete dataForSign.sign;
                        var signValue = _utils2.default.sign(dataForSign, apiKey);
                        if (signValue != notification.sign) {
                            fn.apply(_this, [null, req, res, next]);
                        } else {
                            req.wxmessage = notification;
                            fn.apply(_this, [notification, req, res, next]);
                        }
                    }).catch(function (err) {
                        console.log(err);
                        next(err);
                    });
                });
            };
        }
    }]);
    return WechatPayment;
}();

exports.default = WechatPayment;