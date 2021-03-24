import axios, {CancelTokenSource, AxiosResponse, AxiosRequestConfig, AxiosError} from 'axios';
import Storage from './storage-helper';
import CryptoHelper from './cryptoJs-helper';

const CANCELTTYPE = {
    CACHE: 1,
    REPEAT: 2,
};

interface ICancel {
    data: any;
    type: number;
}

interface Request {
    md5Key: string;
    source: CancelTokenSource;
}
const pendingRequests: Request[] = [];

const http = axios.create();
const storage = new Storage();
const cryptoHelper = new CryptoHelper('cacheKey');

http.interceptors.request.use((config: AxiosRequestConfig) => {
    /**
     * 为每一次请求生成一个cancleToken
     */
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    /**
     * 缓存命中判断
     * 成功则取消当次请求
     */
    const data = storage.get(cryptoHelper.encrypt(
        config.url + JSON.stringify(config.data) + (config.method || ''),
    ));
    if (data && (Date.now() <= data.exppries)) {
        console.log(`接口：${config.url} 缓存命中 -- ${Date.now()} -- ${data.exppries}`);
        source.cancel(JSON.stringify({
            type: CANCELTTYPE.CACHE,
            data: data.data,
        }));
    }
    /**
     * 重复请求判断
     * 同url，同请求类型判定为重复请求
     * 以最新的请求为准
     */
    const md5Key = cryptoHelper.encrypt(config.url + (config.method || ''));
    /**
     * 将之前的重复且未完成的请求全部取消
     */
    const hits = pendingRequests.filter((item) => item.md5Key === md5Key);
    if (hits.length > 0) {
        hits.forEach((item) => item.source.cancel(JSON.stringify({
            type: CANCELTTYPE.REPEAT,
            data: '重复请求，以取消',
        })));
    }
    /**
     * 将当前请求添加进请求对列中
     */
    pendingRequests.push({
        md5Key,
        source,
    });
    return config;
});

http.interceptors.response.use((res: AxiosResponse) => {
    /**
     * 不论请求是否成功，
     * 将本次完成的请求从请求队列中移除
     */
    // 以同样的加密方式(MD5)获取加密字符串
    const md5Key = cryptoHelper.encrypt(res.config.url + (res.config.method || ''));
    const index = pendingRequests.findIndex((item) => item.md5Key === md5Key);
    if (index > -1) {
        pendingRequests.splice(index, 1);
    }
    if (res.data && res.data.type === 0) {
        if (res.config.data) {
            const dataParse = JSON.parse(res.config.data);
            if (dataParse.cache) {
                if (!dataParse.cacheTime) {
                    dataParse.cacheTime = 1000 * 60 * 3;
                }
                storage.set(cryptoHelper.encrypt(res.config.url + res.config.data + (res.config.method || '')), {
                    data: res.data.data,
                    exppries: Date.now() + dataParse.cacheTime,
                });
                console.log(`接口：${res.config.url} 设置缓存，缓存时间: ${dataParse.cacheTime}`);
            }
        }
        return res.data.data;
    } else {
        return Promise.reject('接口报错了！');
    }
});

/**
 * 封装 get、post 请求
 * 集成接口缓存过期机制
 * 缓存过期将重新请求获取最新数据，并更新缓存
 * 数据存储在localstorage
 * {
 *      cache: true
 *      cacheTime: 1000 * 60 * 3  -- 默认缓存3分钟
 * }
 */
const httpHelper = {
    get(url: string, params: any) {
        return new Promise((resolve, reject) => {
            http.get(url, params).then(async (res: AxiosResponse) => {
                resolve(res);
            }).catch((error: AxiosError) => {
                if (axios.isCancel(error)) {
                    const cancle: ICancel = JSON.parse(error.message);
                    if (cancle.type === CANCELTTYPE.REPEAT) {
                        return resolve([]);
                    } else {
                        return resolve(cancle.data);
                    }
                } else {
                    return reject(error);
                }
            });
        });
    },
    post(url: string, params: any) {
        return new Promise((resolve, reject) => {
            http.post(url, params).then(async (res: AxiosResponse) => {
                resolve(res);
            }).catch((error: AxiosError) => {
                if (axios.isCancel(error)) {
                    const cancle: ICancel = JSON.parse(error.message);
                    if (cancle.type === CANCELTTYPE.REPEAT) {
                        return resolve(null);
                    } else {
                        return resolve(cancle.data);
                    }
                } else {
                    return reject(error);
                }
            });
        });
    },
};

export default httpHelper;
