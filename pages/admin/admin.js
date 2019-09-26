const Ajax = require('../../utils/js/ajax.js');
Page({
    data: {
        list: [],
        name: '',
        time: ''
    },
    onLoad: function (options) {
        const url = options.q ? decodeURIComponent(options.q) : '';
        const name = url ? url.match(/name=(.*)/)[1] : '';
        this.setData({ name });
        wx.setNavigationBarTitle({
            title: name
        });
        this.setTimeInterval();
    },
    setTimeInterval() {
        if (new Date().getTime() - this.data.time >= 10000) this.getList();
        setTimeout(() => {
            this.setTimeInterval();
        }, 1000)
    },
    onPullDownRefresh: function() {
        this.getList();
    },
    getList() {
        wx.showLoading({ title: '加载中' });
        Ajax.get('/customers', { shop: this.data.name }).then((res) => {
            let arr = [];
            if (res.statusCode === 200) arr = res.data;
            this.setData({
                list: arr,
                time: new Date().getTime()
            });
            wx.stopPullDownRefresh();
            wx.hideLoading();
        }).catch((err) => {
            console.log(err);
            wx.stopPullDownRefresh();
            wx.hideLoading();
        })
    },
    changeState(e) {
        const item = e.target.dataset.item;
        const key = e.target.dataset.key;
        Ajax.putJson('/customers/' + item.id, {
            formId: item.formId,
            status: key
        }).then((res) => {
            if (res.statusCode === 200) {
                this.getList();
            }
        }).catch((err) => {
            console.log(err);
        })
    },
    sendMessage(e) {
        const item = e.target.dataset.item;
        const _date = new Date();
        let hour = _date.getHours();
        if (hour < 10) hour = '0' + hour;
        let minute = _date.getMinutes();
        if (minute < 10) minute = '0' + minute;
        const time = `${hour}:${minute}`;
        const query = {
            id: item.id,
            page: 'pages/login/login',
            data: {
                keyword1: { value: this.data.name },
                keyword2: { value: '请您及时过来取餐' },
                keyword3: { value: time }
            }
        };
        Ajax.postJson('/wxaTmplMsgs', query).then((res) => {
            if (res.statusCode === 200) {
                this.getList();
                wx.showToast({
                    title: '通知成功',
                    icon: 'success'
                });
            }
        }).catch((err) => {
            console.log(err)
        });
    }
});
