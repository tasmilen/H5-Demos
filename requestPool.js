/**
 * 它是如何工作的？add(requestFn): 你扔给它的不是一个已经开始的请求，
 * 而是一个“启动器”函数 () => mockApi(i)。它把这个“启动器”放进 queue 数组里排队。
 * _run(): 这是管理员。它会检查：现在有空位吗？（running < limit）有人在排队吗？（queue.length > 0）如果两个条件都满足，就从队首叫一个号（queue.shift()），让它开始工作（执行 requestFn()），并且把正在工作的计数 running 加一。
 * .finally(): 这是最关键的一步。每个请求不管是成功还是失败，最后都会执行 finally 里的代码。它会告诉管理员：“我完事了！”，然后把 running 减一，并再次呼叫管理员 _run() 来看看能不能让下一个人进来。
 */
class RequestPool {
  constructor(limit = 3) {
    this.limit = limit; // 限制并发数
    this.queue = []; // 等待的请求队列
    this.running = 0; // 正在运行的请求数
  }

  add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject})
      this._run(); // 每次添加后，都尝试运行
    })
  }

  _run() {
    // 只有当 正在运行的请求数 < 限制数 且 队列中有等待的请求时，才执行
    while(this.running < this.limit && this.queue.length) {
      this.running ++;
      const { requestFn, resolve, reject } = this.queue.shift();

      requestFn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running --; // 请求完成，空出一个位置
          this._run(); // 尝试运行下一个
        })
    }
  }
}

/**
 * 如何使用？三步搞定!
 */
// 1.模拟一个慢接口
function mockApi(id) {
  const delay = Math.random() * 1000 + 500;
  console.log(`[${id}]请求开始...`)
  return new Promise(() => {
    setTimeout(() => {
      console.log(`[${id}]请求完成！`);
      resolve(`任务${id}完成`);
    }, delay)
  });
}

// 2 创建一个请求池，限制并发为2
const pool = new RequestPool(2)

// 把你的请求葚
for (let i = 1; i <= 6; i++) {
  pool.add(() => mockApi(i))
    .then(res => console.log(res))
}
