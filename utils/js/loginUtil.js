const Ajax = require('./ajax');
const Base64 = require('./base64.min').Base64;

const checkAndLogin = () => {
    return new Promise((resolve, reject) => {
        wx.checkSession({
            success: () => {
                wx.getStorage({
                    key: 'openid',
                    success() {
                        resolve();
                    },
                    fail() {
                        wxLogin(resolve);
                    }
                })
            },
            fail: res => {
                wxLogin(resolve);
            }
        })
    })
}

const getJwtInfo = () => {
    let jwt = wx.getStorageSync('jwt');
    return JSON.parse(Base64.atob(jwt.split('.')[1]));
}

const wxLogin = (resolve) => {
    wx.login({
        success: response => {
            Ajax.get('/jwts', {
                code: response.code
            }).then((res) => {
                if (res.statusCode === 200) {
                    const data = res.data;
                    wx.setStorageSync('jwt', data);
                    resolve();
                }
            });
        }
    });
}

module.exports = {
    checkAndLogin,
    getJwtInfo
}
