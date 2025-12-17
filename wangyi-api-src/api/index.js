import login from './login'
import shop from './shop'

import myServer from '../request/getRequest'

// require.context webpack 批量引入
myServer.parseRouter('shop', shop)
myServer.parseRouter('login', login)


export default myServer;