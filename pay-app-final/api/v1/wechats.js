const router = require('express').Router();
const Order = require('../../models/order');
const { wxPay } = require('../../utils/wx');

router.get('/test', (req, res) => {
  res.send('This is a test route from demo router.');
});

router.post('/pay-mock', async (req, res) => {
  console.log('pay-mock body', req.body);
  const nonceStr = Math.random().toString(36).substr(2, 15);
  // mock
  res.json({
      code: 200,
      data: {
        nonceStr: nonceStr,
        prepayId: `ID${Date.now()}`, // 微信返回的 prepay_id
        paySign: `SIGN${Date.now()}`, // 微信返回的签名
        codeUrl: `werxin://${Date.now()}`, // 二维码链接
        orderNo: `ORDER${Date.now()}`,
      },
      message: 'success',
    });

});

router.post('/pay', async (req, res) => {
  const order = new Order();
  order.order_no = `ORDER${Date.now()}`;
  order.fee = req.body.fee || 1;
  await order.save();

  const nonceStr = Math.random().toString(36).substr(2, 15);

  const sign = await wxPay({
    body: 'Test Product',
    order_no: order.order_no,
    totalFee: order.fee * 100, // 转为分
    ip: req.ip.replace('::ffff:', ''),
    nonceStr,
  });

  if (
    sign.xml.return_code === 'SUCCESS' &&
    sign.xml.result_code === 'SUCCESS'
  ) {
    res.json({
      code: 200,
      data: {
        nonceStr: nonceStr,
        prepayId: sign.xml.prepay_id, // 微信返回的 prepay_id
        paySign: sign.xml.sign, // 微信返回的签名
        codeUrl: sign.xml.code_url, // 二维码链接
        orderNo: order.order_no,
      },
      message: 'success',
    });
  } else {
    res.json({
      code: 500,
      data: {},
      message: 'fail',
    });
  }
});

module.exports = router;
