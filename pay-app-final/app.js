const express = require('express');
const mongoose = require('mongoose');
const xml2js = require('xml2js');

const {
  signPayParams,
  getJsApiTicket,
  signParams,
  fullUrl,
  appid
} = require('./utils/wx');
const Order = require('./models/order');

const port = 3003;

const app = express();

app.use('/', express.static('./public'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs'); // 设置视图引擎为 EJS
app.set('views', './views'); // 设置视图文件目录

app.get('/wx_pay', async (req, res) => {
  const nonceStr = Math.random().toString(36).slice(2, 17);
  const timestamp = Math.floor(Date.now() / 1000);
  const jsTicket = await getJsApiTicket();
  const signResult = signParams({
    jsapi_ticket: jsTicket,
    noncestr: nonceStr,
    timestamp: timestamp,
    url: fullUrl(req),
  });
  res.render('wx_pay.ejs', {
    appid,
    timestamp,
    nonceStr,
    signResult,
  });
});

app.use('/api/v1/wechats', require('./api/v1/wechats'));

/**
 * 微信支付异步通知
 */
app.post('/pay/notify_wx', async (req, res) => {
  let buf = '';
  req.on('data', (chunk) => {
    buf += chunk;
  });
  req.on('end', async () => {
    const payResult = await xml2js.parseStringPromise(buf, {
      explicitArray: false,
      trim: true,
    });

    try {
      if (payResult.xml.return_code === 'SUCCESS') {
        // 验证签名
        const receivedSign = payResult.xml.sign;
        delete payResult.xml.sign;
        const calculatedSign = signPayParams(payResult.xml);
        if (receivedSign === calculatedSign) {
          console.log('微信支付成功，签名验证通过', payResult.xml);
          const orderNo = payResult.xml.out_trade_no;
          const order = await Order.findOne({ order_no: orderNo });
          if (order) {
            order.paid = true;
            order.paid_time = Date.now();
            await order.save();
            res.send('OK');
          }
        }
      }
      res.send(`<xml>
        <return_code><![CDATA[SUCCESS]]></return_code>
        <return_msg><![CDATA[OK]]></return_msg>
      </xml>`);
    } catch (error) {
      console.error('处理微信支付通知出错', error);
      res.status(500).send('Internal Server Error');
    }
  });
});

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.listen(port, () => {
  console.log(`Pay app listening on port ${port}`);
});

// MongoDB connection
// mongoose
//   .connect('mongodb://localhost:27017/pay', { useNewUrlParser: true })
//   .then(() => console.log('MongoDB Connected...'))
//   .catch((err) => console.log(err));
