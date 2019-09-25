const Ajax = require('../../utils/js/ajax');
Page({
    data: {
        list: [
            {
                name: '意大利披萨',
                myNumber: 15,
                queueNumber: 4
            }
        ]
    },
    onLoad: function (options) {},
    onShow() {
        this.getList();
    },
    getList() {
        Ajax.get('/me').then((res) => {
            if (res.statusCode === 200) {
                const data = res.data;
                this.setData({ list: data });
            }
        }).catch((err) => {
            console.error(err);
        })
    },
    goinDetail(e) {
        const name = e.currentTarget.dataset.name;
        wx.navigateTo({
            url: '/pages/login/login?name=' + name
        });
    }
});
