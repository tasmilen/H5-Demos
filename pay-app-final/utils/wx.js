// WeChat utility functions
const axios = require('axios').default;
const crypto = require('crypto');
const qs = require('qs'); // 使用 qs 库来处理查询字符串
const xml2js = require('xml2js'); // 用于解析 XML 字符串
const sha1 = require('sha1');
const url = require('url');
const WechatToken = require('../models/wechat_token'); // 引入微信 token 模型
const moment = require('moment');

const appid = 'your-app-id'; // 微信公众号的 appid
const mchId = 'your-mch-id'; // 微信商户号
const notifyUrl = 'https://your-notify-url.com/notify'; // 支付结果通知地址
const mchKey = 'your-mch-key'; // 微信商户密钥
const appSecret = 'your-app-secret'; // 微信公众号的 appSecret

/**
 * 获取微信 access_token
 * @returns {Promise<string>} 微信 access_token
 */
async function getAccessToken() {
  const token = await WechatToken.findOne({
    name: 'access_token',
  });
  let timeDiff = 0;
  // 检查 token 是否存在且未过期
  if (token) {
    timeDiff = moment(Data.now()).diff(moment(token.createdAt), 'seconds');
    if (timeDiff < 7000) {
      return token.value;
    } else {
      // 删除过期的 token
      await WechatToken.deleteOne({ name: 'access_token' });
    }
  }

  // 获取新的 access_token
  const result = await axios.get(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appSecret}`
  );
  const wt = new WechatToken({
    name: 'access_token',
    value: result.data.access_token,
  });
  await wt.save();
  return result.data.access_token;
}


/**
 * 获取微信 JSAPI 的 ticket
 * @returns {Promise<string>} 微信 JSAPI 的 ticket
 */
async function getJsApiTicket() {
  const jsApiTicket = await WechatToken.findOne({
    name: 'jsapi_ticket',
  });
  let timeDiff = 0;
  // 检查 token 是否存在且未过期
  if (jsApiTicket) {
    timeDiff = moment(Data.now()).diff(
      moment(jsApiTicket.createdAt),
      'seconds'
    );
    if (timeDiff < 7000) {
      return jsApiTicket.value;
    } else {
      // 删除过期的 token
      await WechatToken.deleteOne({ name: 'jsapi_ticket' });
    }
  }

  // 获取新的 ticket
  const accessToken = await getAccessToken();
  const result = await axios.get(
    `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
  );
  const wt = new WechatToken({
    name: 'jsapi_ticket',
    value: result.data.ticket,
  });
  await wt.save();
  return result.data.ticket;
}

function fullUrl(req) {
  // return (
  //   req.protocol +
  //   '://' +
  //   req.get('host') +
  //   req.originalUrl
  // );
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl,
  });
}

/**
 * 签名算法
 * @param {*} params 
 * @returns 
 */
function signParams(params) {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});

  const signResult = sha1(qs.stringify(sortedParams, { encode: false }))
  return signResult;
}

/**
 * 签名微信支付参数
 * @param {Object} params 微信支付参数
 * @returns {string} 签名结果
 */
function signPayParams(params) {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});
  sortedParams.key = mchKey;

  const signResult = crypto
    .createHash('MD5')
    .update(qs.stringify(sortedParams, { encode: false }))
    .digest('hex')
    .toUpperCase();
  return signResult;
}

/**
 * 微信支付
 * @param {Object} payload 微信支付参数
 * @returns {Promise<Object>} 微信支付结果
 */
async function wxPay(payload) {
  const { body, totalFee, ip, outTradeNo, nonceStr } = payload;
  const paramsNeedSign = {
    appid: appid,
    body,
    mch_id: mchId,
    nonce_str: nonceStr,
    notify_url: notifyUrl,
    out_trade_no: outTradeNo,
    spbill_create_ip: ip,
    total_fee: totalFee,
    trade_type: 'NATIVE',
  };
  const sign = signPayParams(paramsNeedSign);
  const xmlData = `<xml>
    <appid>${appid}</appid>
    <body>${body}</body>
    <mch_id>${mchId}</mch_id>
    <nonce_str>${nonceStr}</nonce_str>
    <notify_url>${notifyUrl}</notify_url>
    <out_trade_no>${outTradeNo}</out_trade_no>
    <spbill_create_ip>${ip}</spbill_create_ip>
    <total_fee>${totalFee}</total_fee>
    <trade_type>NATIVE</trade_type>
    <sign>${sign}</sign>
  </xml>`;

  try {
    const response = await axios.post(
      'https://api.mch.weixin.qq.com/pay/unifiedorder',
      xmlData,
      {
        headers: { 'Content-Type': 'application/xml' },
      }
    );

    console.log('WeChat Pay response:', response.data);
    return xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      cdata: true,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { wxPay, signPayParams, getAccessToken, getJsApiTicket, signParams, fullUrl, appid, };

// wxPay({
//   body: 'Test Product',
//   totalFee: 1,
//   ip: '127.0.0.1',
//   outTradeNo: 'TEST' + Date.now(),
//   nonceStr: 'randomstring12345',
// })
