const Ajax = require('../../utils/js/ajax.js');
const util = require('../../utils/js/loginUtil.js');

Page({
    data: {
        state: 0, // 1 未取号  2 已取号  3 已过号
        mes: null,
        name: '',
        create: false
    },
    onLoad(options) {
        let name;
        if (options.name) {
            name = options.name
        } else {
            const url = options.q ? decodeURIComponent(options.q) : '';
            name = url ? url.match(/name=(.*)/)[1] : '';
        }
        wx.setNavigationBarTitle({
            title: name
        });
        this.setData({ name });
    },
    onShow() {
        let inter = setInterval(() => {
            const jwt = wx.getStorageSync('jwt');
            if (jwt) {
                clearInterval(inter)
                this.whetherTakeNumber();
            }
        }, 300);
    },
    onPullDownRefresh: function() {
        this.whetherTakeNumber();
    },
    whetherTakeNumber() {
        wx.showLoading({ title: '加载中' });
        Ajax.get('/me', { shop: this.data.name }).then((res) => {
            if (res.statusCode === 200) {
                const data = res.data;
                let state = 2;
                if (data.status === '已过号') state = 3;
                if (data.status === '已到达') state = 1;
                this.setData({
                    state,
                    mes: data
                });
            }
            wx.stopPullDownRefresh();
            wx.hideLoading();
        }).catch((err) => {
            console.error(err);
            wx.stopPullDownRefresh();
            wx.hideLoading();
            this.setData({ state: 1, create: true });
        })
    },
    getNumber(e) {
        const formId = e.detail.formId;
        const info = util.getJwtInfo();
        if (this.data.create) {
            Ajax.postJson('/customers', {
                wechatOpenid: info.openid,
                shop: this.data.name,
                formId
            }).then((res) => {
                if (res.statusCode === 200) {
                    this.whetherTakeNumber();
                }
            }).catch((err) => {
                console.error(err)
            });
        } else {
            Ajax.putJson('/customers/' + this.data.mes.id, {
                status: '排队中',
                formId
            }).then((res) => {
                if (res.statusCode === 200) {
                    this.whetherTakeNumber();
                }
            }).catch((err) => {
                console.error(err)
            });
        }
    },
    returnList() {
        wx.reLaunch({ url: '/pages/list/list' });
    }
});
