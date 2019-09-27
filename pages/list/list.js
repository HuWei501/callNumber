const Ajax = require('../../utils/js/ajax');
Page({
    data: {
        list: []
    },
    onLoad: function (options) {},
    onShow() {
        wx.showLoading({ title: '加载中' });
        let inter = setInterval(() => {
            const jwt = wx.getStorageSync('jwt');
            if (jwt) {
                clearInterval(inter);
                this.getList();
            }
        }, 300);
    },
    onPullDownRefresh: function() {
        this.getList();
    },
    getList() {
        Ajax.get('/me').then((res) => {
            if (res.statusCode === 200) {
                const data = res.data;
                this.setData({ list: data });
            }
            wx.stopPullDownRefresh();
            wx.hideLoading();
        }).catch((err) => {
            console.error(err);
            wx.stopPullDownRefresh();
            wx.hideLoading();
        });
    },
    goinDetail(e) {
        const name = e.currentTarget.dataset.name;
        wx.navigateTo({
            url: '/pages/login/login?name=' + name
        });
    }
});
