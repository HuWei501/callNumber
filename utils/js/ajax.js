// const basicUrl = 'http://192.168.31.238:8443';
const basicUrl = 'https://apit.fangliaoyun.com';

const ajaxPromise = ({ url, query, params, method, json }) => {
    let header = Object.create(null);
    let jwt = wx.getStorageSync('jwt');
    if ((method === 'post' || method === 'put') && !json) {
        header['content-type'] = 'application/x-www-form-urlencoded';
    }
    if (url.indexOf('jwts') === -1) {
        header['Authorization'] = jwt;
    }
    if (params) {
        let str = '';
        for (let key in params) {
            str += `${key}=${params[key]}&`;
        }
        url += '?' + str.slice(0, -1);
    }
    return new Promise((resolve, reject) => {
        sendRequest(url, query, method, header, resolve, reject);
    });
};

const sendRequest = (url, query, method, header, resolve, reject) => {
    wx.request({
        url: basicUrl + url,
        data: query,
        method,
        header,
        success(res) {
            if (200 <= res.statusCode && res.statusCode < 300) {
                resolve(res);
            } else {
                if (res.statusCode === 403 && res.data.message === 'Invalid JWT') {
                    wx.login({
                        success: response => {
                            Ajax.get('/jwts', {code: response.code}).then((res1) => {
                                if (res1.statusCode === 200) {
                                    let data = res1.data;
                                    wx.setStorageSync('jwt', data);
                                    header['Authorization'] = data;
                                    sendRequest(url, query, method, header, resolve, reject);
                                }
                            });
                        }
                    });
                } else {
                    reject(res);
                }
            }
        },
        fail(res) {
            reject(res);
        }
    })
};

const Ajax = {
    get(url, query) {
        return ajaxPromise({ url, query });
    },
    put(url, query) {
        return ajaxPromise({ url, query, method: 'put', json: false });
    },
    putJson(url, query) {
        return ajaxPromise({ url, query, method: 'put', json: true });
    },
    post(url, query) {
        return ajaxPromise({ url, query, method: 'post', json: false });
    },
    postJson(url, query, params) {
        return ajaxPromise({ url, query, params, method: 'post', json: true });
    },
    delete(url, query) {
        return ajaxPromise({ url, query, method: 'delete' });
    }
};
module.exports = Ajax;
