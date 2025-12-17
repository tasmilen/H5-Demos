const express = require('express');
const app = express();
const port = 3001;
const demoRouter = require('./router/demoRouter');
const userRouter = require('./router/userRouter');

const helmet = require('helmet')

app.use(helmet())

app.use((resq, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// 配置静态资源目录
app.use(express.static('public'));
app.use(express.static('files')); // 根目录下取 eg: /1.jpg
app.use('/files', express.static('files')); // eg: /files/1.jpg

// 配置解析 post 请求体
app.use(express.urlencoded({ extended: false })); // 解析 application/x-www-form-urlencoded eg: post参数 key=value&key2=value2
app.use(express.json()); // 解析 application/json  eg: post参数：{ "key": "value" }

app.disable('x-powered-by');

app.get('/about', (req, res) => {
  res.send(`
    <html>
      <h2>Hello World!</h2> 
      <a href="/api">API</a>
      <a href="/api/users">Users</a>
    </html>
  `);
});

app.get('/api', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.use('/demo', demoRouter);
app.use('/user', userRouter);


// custom 404
app.use((req, res, next) => {
  res.status(404).send("404, Sorry can't find that!")
})

// custom error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
