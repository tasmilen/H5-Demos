const promiseCache = new Map()

getWares() {
  const key = 'wares'
  let promise = promiseCache.get(key)

  if (!promise) {
    promise = request.get('/getWares').then(res => {
      // 对 res 做处理
    }).catch(error => {
      // 在请求回来后，如果出现问题，把promise从catch中删除，以避免第二次请求继续出错
      promiseCache.delete(key)
      return Promise.reject(error)
    })

    promiseCache.set(api, promise)
  }

  return promise
}