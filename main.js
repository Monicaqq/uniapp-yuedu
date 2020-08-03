import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'
// 登录检查
Vue.prototype.checkLogin = function(backpage, backtype) {
	var SUID= uni.getStorageSync('SUID')
	var SRAND = uni.getStorageSync('SRAND')
	var SNAME = uni.getStorageSync('SNAME')
	var SFACE = uni.getStorageSync('SFACE')
	if(SUID == '' || SRAND == '' || SNAME == '' || SFACE == '') {
		uni.redirectTo({
			url: '../login/login?backpage='+backpage+'&backtype='+backtype
		})
		return false
	}
	return [SUID, SRAND, SNAME, SFACE]
}

// 定义全局APi 接口地址及token
const APITOKEN = 'api2018'
const base_url = 'http://192.168.1.51'
Vue.prototype.apiServer = `${base_url}/index.php?token=${APITOKEN}&c=` 
Vue.prototype.staticServer = 'http://192.168.1.51/'
const appid = 'wxdcd14f79412dcb13'
const secret = '7a0b031d569c51aaceb48ef377c5f985'
const app = new Vue({
    ...App
})
app.$mount()
