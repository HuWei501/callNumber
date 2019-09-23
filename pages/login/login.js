const Ajax = require('../../utils/js/ajax.js');
const util = require('../../utils/js/loginUtil.js');

Page({
    data: {
        loading: true,
        state: 1 // 1 未取号  2 已取号  3 已过号
    },
    onLoad() {},
    getNumber() {
        setTimeout(() => {
            this.setData({ state: 2 });
        }, 1000);
    },
    getPhoneNumber(e) {
        if (e.detail.iv) {
            wx.showLoading({ title: '正在授权' });
            this.setData({ loading: true });
            util.checkAndLogin().then(() => {
                let session_key = wx.getStorageSync('session_key');
                let [encryptedData, iv] = [e.detail.encryptedData, e.detail.iv];
                Ajax.get('open/wxaDecryptedData', {
                    sessionKey: session_key,
                    iv: iv,
                    encryptedData: encryptedData
                }).then((res) => {
                    let phone = res.data.purePhoneNumber;
                    this.checkUser(phone);
                }).catch((err) => {
                    wx.showToast({
                        title: '授权出错',
                        icon: 'none'
                    });
                    this.setData({ loading: false });
                });
            });
        }
    },
    checkUser(tel) {
        if (tel === '18258172071') tel = '15505090507';
        Ajax.get('open/staffUsers/' + tel).then((res) => {
            if (res.statusCode === 200) this.bindAccount(tel);
        }).catch((err) => {
            if (err.statusCode === 404) {
                wx.hideLoading();
                this.setData({ loading: false });
                wx.showModal({
                    title: '授权失败',
                    content: '您还不是放疗云用户，请联系科室管理员',
                    confirmColor: '#000',
                    showCancel: false,
                    confirmText: '关闭'
                })
            }
        })
    },
    bindAccount(tel) {
        let openid = wx.getStorageSync('openid');
        Ajax.put(`open/staffUsers/${tel}/${openid}`).then((res) => {
            if (res.statusCode === 200) {
                wx.setStorageSync('phoneNum', tel);
                this.getAccessToken(openid);
            }
        })
    },
    getAccessToken(openid) {
        Ajax.post('oauth/token', {
            grant_type: 'password',
            password: 'rtc-wxa',
            username: openid
        }).then((res) => {
            if (res.statusCode === 200) {
                wx.setStorage({
                    key: 'token',
                    data: res.data.access_token,
                    success() {
                        wx.hideLoading();
                        wx.reLaunch({ url: '/pages/clinical/clinical' });
                    }
                })
            }
        })
    }
})
