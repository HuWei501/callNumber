const util = require('./utils/js/loginUtil.js');

App({
    globalData: {},
    onLaunch: function (e) {
        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate((res) => {
            // 请求完新版本信息的回调
            if (res.hasUpdate) {
                updateManager.onUpdateReady(function () {
                    wx.showModal({
                        title: '更新提示',
                        content: '新版本已经准备好，是否马上重启小程序？',
                        success: function (res) {
                            if (res.confirm) {
                                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                updateManager.applyUpdate();
                            }
                        }
                    });
                });
                updateManager.onUpdateFailed(function () {
                    // 新的版本下载失败
                    console.log('下载失败');
                });
            }
        });
        // 判断是否存在token,不存在则登录
        wx.getStorage({
            key: 'token',
            success(res) {
                if (res.data) {
                    if (e.scene === 1011 && e.query.admin) wx.reLaunch({ url: '/pages/admin/admin' });
                } else {
                    util.checkAndLogin();
                }
            },
            fail() {
                util.checkAndLogin();
            }
        });
    }
})
