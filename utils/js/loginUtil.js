const Ajax = require('./ajax.js');

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

const wxLogin = (resolve) => {
    wx.login({
        success: response => {
            Ajax.get('open/wxaSessionKeys', {code: response.code}).then((res) => {
                let data = res.data;
                wx.setStorageSync('openid', data.openid);
                wx.setStorageSync('session_key', data.session_key);
                resolve();
            });
        }
    });
}

module.exports = {
    checkAndLogin
}
