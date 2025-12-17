
import server from './server'

// 二次封装 axios 
// 接口api化
// 请求自动绑定
// 防止重复提交
function myServer() {
  this.server = server;
  this.curHandler = null
}

myServer.prototype.v = function(vueObj) {
  this.curHandler = vueObj; // vue 组件实例
}

myServer.prototype.parseRouter = function (moduleName, urlObj) {
  this[moduleName] = {};

  Object.keys(urlObj).forEach((apiName) => {
    this[moduleName][apiName] = this.sendMes.bind(this, moduleName, apiName, urlObj[apiName])
    this[moduleName][apiName].state = 'ready';
  })
}

// 思想=》 我给你最大的便利，我也给你自定义的机会，流出一个接口让别人能够扩展 config
myServer.prototype.sendMes = function(moduleName, apiName, url, config) {
  const config = config || {};
  const type = config.type || 'get';
  const data = config.data || {};
  const bindName = config.bindName || apiName;
  const self = this;
  // 可扩展 =》 分模块：效果模块，数据模块
  const before = function(res) {
    self[moduleName][apiName].state = 'ready';
    return Promise.resolve(res)
  }

  const defaultFn = function(res) {
    self.curHandler[bindName] = res.data;
  }

  const success = config.success || defaultFn;
  if (this[moduleName][apiName].state === 'ready') {
    self.server[type](url, data).then(before).then(success);
    // 同一api 防止重复提交，每一个api 有一个状态
    self[moduleName][apiName].state = 'waiting';
  }

}

export default new myServer();