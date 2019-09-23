// const basicUrl = 'http://192.168.1.30:8443/';
const basicUrl = 'https://api.fangliaoyun.com/';

const ajaxPromise = ({ url, query, params, method, json }) => {
    let header = Object.create(null);
    let token = wx.getStorageSync('token');
    if ((method === 'post' || method === 'put') && !json) {
        header['content-type'] = 'application/x-www-form-urlencoded';
    }
    if (url.indexOf('oauth/') >= 0) {
        header['Authorization'] ='Basic cnRjOnJ0Y3NlY3JldA==';
    } else if (url.indexOf('open/') < 0) {
        if (!token) {
            wx.reLaunch({ url: '/pages/login/login' });
            return;
        }
        header['Authorization'] = 'bearer ' + token;
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
}

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
                if (res.statusCode === 401 && res.data.error === 'invalid_token') {
                    let openid = wx.getStorageSync('openid');
                    Ajax.post('oauth/token', {
                        grant_type: 'password',
                        password: 'rtc-wxa',
                        username: openid
                    }).then((res1) => {
                        if (res1.statusCode === 200) {
                            wx.setStorageSync('token', res1.data.access_token);
                            header['Authorization'] = 'bearer ' + res1.data.access_token;
                            sendRequest(url, query, method, header, resolve, reject);
                        }
                    })
                } else {
                    reject(res);
                }
            }
        },
        fail(res) {
            reject(res);
        }
    })
}

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
