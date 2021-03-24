/**
 * 隐藏指定所有指定的元素
 * @param  {...any} el 目标元素
 */
const hide = (...el) => [...el].forEach(e => (e.style.display = 'none'));

/**
 * 页面DOM里的每个节点上都有一个classList对象，可以使用里面的方法新增、删除、修改节点上的CSS类。使用classList，
 * 还可以用它来判断某个节点是否被赋予了某个CSS类。
 * javascript里的contains用法是可以来判断DOM元素的包含关系
 * @param {*} el 目标元素
 * @param {String} className class名称
 */
const hasClass = (el, className) => el.classList.contains(className);
console.log('hasClass ', hasClass(document.querySelector('#app'), 'wrapper'));

/**
 * 切换一个元素的类
 * @param {*} el 目标元素
 * @param {String} className
 */
const toggleClass = (el, className) => el.classList.toggle(className);

console.log('here is toggleClass');
toggleClass(document.querySelector('.special'), 'special2');
setTimeout(() => {
  toggleClass(document.querySelector('.special'), 'special2');
}, 2000);
//

/**
 * 获取当前页面的滚动位置
 * @param {*} el 目标元素
 */
const getScrollPosition = (el = window) => ({
  x: el.pageXOffset !== undefined ? el.pageXOffset : el.screenLeft,
  y: el.pageYOffset !== undefined ? el.pageYOffset : el.screenTop
});

console.log('get scroll Position', getScrollPosition());

/**
 * 平滑滚动到页面顶部,缓动效果
 */
const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
};

/**
 * 检查父元素是否包含子元素？
 * @param {*} parent 父元素
 * @param {*} child 子元素
 */
const elementContains = (parent, child) =>
  parent !== child && parent.contains(child);

/**
 * 检查指定元素在窗口中是否可见
 * @param {*} el
 * @param {*} partiallyVisible
 */
const elementIsVisibleInViewport = (el, partiallyVisible = false) => {
  const { top, left, bottom, right } = el.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  return partiallyVisible
    ? ((top > 0 && top < innerHeight) ||
        (bottom > 0 && bottom < innerHeight)) &&
        ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
    : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};

/**
 * 获取元素中的所有图像
 * @param {} el 目标元素
 * @param {*} includeDuplicates 是否去重
 */
const getImages = (el, includeDuplicates = false) => {
  const images = [...el.getElementsByTags('img')].map(img =>
    img.getAttribute('src')
  );
  return includeDuplicates ? images : [...new Set(images)];
};

/**
 * 确定设备是移动设备还是台式机/笔记本电脑？
 */
const detectDeviceType = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
    ? 'Mobile'
    : 'Desktop';

console.log('device detect: ', detectDeviceType());

/**
 * 获取当前URL
 */
const currentURL = () => window.location.href;

console.log('cur url: ', currentURL());

/**
 * 获取url中的参赛，以对象的形式返回
 * @param {} url
 */
const getURLParameters = url =>
  (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce(
    // (a, v) => ((a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a),
    (a, v) => ({
      ...a,
      [v.slice(0, v.indexOf('='))]: v.slice(v.indexOf('=') + 1)
    }),
    {}
  );
console.log(
  'ur  l paras: ',
  getURLParameters('http://url.com/page?n=Adam&s=Smith')
);
console.log(
  'url paras: ',
  'http://url.com/page?n=Adam&s=Smith'.match(/([^?=&]+)(=([^&]*))/g)
);

/**
 * 将一组表单元素转化为对象
 * @param {*} form
 */
const formToObject = form =>
  Array.from(new FormData(form)).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value
    }),
    {}
  );

/**
 * 从对象检索给定选择器指示的一组属性
 * @param {*} from 给定对象
 * @param {String} selectors 选择
 */
const get = (from, ...selectors) =>
  [...selectors].map(s =>
    s
      .replace(/\[([^\[\]]*)/g, '.$1.')
      .split('.')
      .filter(t => t !== '')
      .reduce((prev, cur) => prev && prev[cur], from)
  );

// eg
const obj = {
  selector: {
    to: {
      val: 'val to select'
    }
  },
  target: [
    1,
    2,
    {
      a: 'test'
    }
  ]
};
console.log(get(obj, 'selector.to.val', 'target[0]', 'target[2].a'));

/**
 * 在等待指定时间后调用提供的函数
 * @param {Function} fn 等待调用的函数
 * @param {Number} wait 等待时长（毫秒）
 * @param {...any} args 参数
 */
const delay = (fn, wait, ...args) => setTimeout(fn, wait, ...args);

delay(
  function(text) {
    console.log(text);
  },
  1000,
  'later'
);

/**
 * 在给定元素上触发特定事件且能选择地传递自定义数据
 * @param {*} el 目标元素
 * @param {String} eventType 事件类型
 * @param {Object} detail
 */
const triggerEvent = (el, eventType, detail) =>
  el.dispatchEvent(new CustomEvent(eventType, { detail }));

// eg
delay(function() {
  console.log('通过自定义事件派发点击事件');
  console.log(typeof document.querySelector('.btn'));
  triggerEvent(document.querySelector('.btn'), 'click');
}, 2000);

// 向window派发一个resize内置事件
window.dispatchEvent(new Event('resize'));

// 直接自定义事件，使用Event构造函数
let event = new Event('build');
var elem = document.querySelector('.test');

// 监听事件
elem.addEventListener(
  'build',
  function(e) {
    console.log(e);
  },
  false
);
// 触发事件
delay(function() {
  console.log('派发自定义 build 事件');
  elem.dispatchEvent(event);
}, 3000);

//CustomEvent 可以创建一个更高度自定义事件，还可以附带一些数据，具体用法如下：
// let myEvent = new CustomEvent(eventType, options);
// //其中 options 可以是：
// {
//   detail: {
//     ...
//   },
//   bubbles: true, // 是否冒泡
//   cancelable: false // 是否取消默认事件
// }

// 使用自定义事件注意兼容性
// 而使用jQuery就简单多了
// 绑定事件
// $(element).on('myCustomEvent', function(){});
// $(element).trigger('myCustomEvent')

/**
 * 从元素中移除事件监听器
 * @param {Object} el
 * @param {String} evt
 * @param {Function} fn
 * @param {Object} opts
 */
const off = (el, evt, fn, opts = false) =>
  el.removeEventListener(evt, fn, opts);

const fn = () => console.log('remove evt test');
document.body.addEventListener('click', fn);
off(document.body, 'click', fn);

/**
 * 获得给定毫秒数的可读格式
 * @param {Number} ms 时间戳
 */
const formatDuration = ms => {
  if (ms < 0) ms = -ms;
  const time = {
    day: Math.floor(ms / 86400000),
    hour: Math.floor(ms / 3600000) % 24,
    minute: Math.floor(ms / 60000) % 60,
    second: Math.floor(ms / 1000) % 60,
    millisecond: Math.floor(ms) % 1000
  };

  return Object.entries(time)
    .filter(val => val[1] !== 0)
    .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
    .join(', ');
};

// eg
console.log(formatDuration(1001));
console.log(formatDuration(165654654654655));

/**
 * 获得两个日期之间的差异（以天为单位
 * @param {Number} dateInitial
 * @param {Number} dateFinal
 */
const getDaysDiffBetweenDates = (dateInitial, dateFinal) =>
  (dateInitial - dateFinal) / (1000 * 2600 * 24);

/**
 * 向传递的URL发出GET请求
 * @param {Function} url
 * @param {Function} callback
 * @param {Function} err
 */
const httpGet = (url, callback, err = console.error) => {
  const request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = () => callback(request.responseText);
  request.onerror = () => err(request);
  request.send();
};

// eg
httpGet('https://jsonplaceholder.typicode.com/posts/1', console.log);

/**
 * 对传递的URL发出POST请求
 * @param {String} url
 * @param {Object} data
 * @param {Function} callback
 * @param {Function} err
 */
const httpPost = (url, data, callback, err = console.error) => {
  const request = new XMLHttpRequest();
  request.open('POST', url, true);
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.onload = () => callback(request.responseText);
  request.onerror = () => err(request);
  request.send(data);
};

// eg
const newPost = {
  userId: 1,
  id: 1337,
  titile: 'Foo',
  body: 'bala bala'
};
const data = JSON.stringify(newPost);
httpPost('https://jsonplaceholder.typicode.com/posts', data, console.log);

/**
 * 为指定选择器创建具有指定范围，步长和持续时间的计数器
 * @param {*} selector
 * @param {Number} start
 * @param {Number} end
 * @param {Number} step
 * @param {Number} duration
 */
const counter = (selector, start, end, step = 1, duration = 2000) => {
  let current = start;
  let _step = (end - start) * step < 0 ? -step : step;
  let timer = setInterval(() => {
    current += _step;
    document.querySelector(selector).innerHTML = current;
    if (current >= end) document.querySelector(selector).innerHTML = end;
    if (current >= end) clearInterval(timer);
  }, Math.abs(Math.floor(duration / (end - start))));

  return timer;
};

//
counter('#counter', 1, 10000, 50, 20000);

/**
 * 将字符串复制到剪贴板
 * @param {String} str
 */
const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  if (document.execCommand('copy')) {
    document.execCommand('copy');
  }
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
};

/**
 * 优化的节流的防抖
 * @param {function} fn 回调函数
 * @param {Number} time 时长
 */
const debounce = (fn, time) => {
  let oldTime = 0;
  let timer = null;
  return () => {
    const nowTime = new Date();
    if (nowTime - oldTime < time) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        oldTime = nowTime;
        fn();
      }, time);
    } else {
      // 用户重复触发，到达事件节点 还是会去执行事件
      oldTime = nowTime;
      fn();
    }
  };
};
