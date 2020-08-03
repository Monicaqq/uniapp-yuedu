<template>
	<view>
		Login
		<!-- #ifdef MP-WEIXIN -->
		<button type="primary" open-type="getUserInfo" @getuserinfo="getUserInfo">使用微信登录</button>
		<!-- #endif -->
	</view>
</template>

<script>
	var pageOptions, openid, session_key
	var sign = require('../../commons/sign.js')
	export default {
		data() {
			return {
			}
		},
		onLoad (options) {
			sign.sign(this.apiServer)
			const that = this
			pageOptions = options
			// 通过options 获取上一个页面的传值
			// #ifdef MP-WEIXIN
			uni.login({
				// uni.login()获取code,通过code、appid、secret 拿到openid
				success: (res) => {
					if(res.code) {
						uni.request({
							url: 'https://api.weixin.qq.com/sns/jscode2session',
							data: {
								appid: that.appid,
								secret: that.secret,
								grant_type: 'authorization_code',
								js_code: res.code
							},
							method: 'GET',
							header: {
								'content-type' : "application/x-www-form-urlencoded"
							},
						    success: (res) => {
								session_key = res.data.session_key
								openid = res.data.openid
								},
						     fail: (error) => {
								console.info("获取用户openId失败")
						     }
						})
					}
				}
			})
			// #endif
			// app
			// #ifdef APP-PLUS
			uni.login({
				provider: 'weixin',
				success: (res) => {
					console.log('h5+ app', res)
					var sign = uni.getStorageSync('sign')
					uni.getUserInfo({
						success: (info) => {
							console.log(info)
							uni.request({
								url: this.apiServer+'member&m=login',
								method: 'POST',
								header: {
									'content-type' : "application/x-www-form-urlencoded"
								},
								data: {
									 openid: info.userInfo.openId,
									 name: info.userInfo.nickName,
									 face: info.userInfo.avatarUrl,
									 sign: sign
								},
								success: res => {
									// console.log(JSON.stringify(res))
									res = res.data
									// 登录成功
									if(res.status == 'ok') {
										uni.showToast({
											title: '登录成功'
										})
										// 登录成功,记录用户id random name face ,字符串展示
										uni.setStorageSync('SUID', res.data.u_id + '')
										uni.setStorageSync('SRAND', res.data.u_random + '')
										uni.setStorageSync('SNAME', res.data.u_name + '')
										uni.setStorageSync('SFACE', res.data.u_face + '')
										if (options.backtype == 1) {
											uni.redirectTo({
												url: pageOptions.backpage
											})
										}
										else {
											uni.switchTab({
												url: pageOptions.backpage
											})
										}
									} else {
										// 登录失败 
										uni.showToast({
											title: res.data
										})
									}
								},
								fail: (e) => {
									console.log(JSON.stringify(e))
								}
							})
						},
						fail: () => {
							uni.showToast({title: '微信登录授权失败'})
					}
				})
			},
			fail: (res) => {
				uni.showToast({title: '微信登录授权失败'})
			}
		})
		// #endif
		},
		methods: {
			 // #ifdef MP-WEIXIN
			 // 点击getInfo 获取用户信息
			getUserInfo(userinfo) {
				const that = this
				userinfo = userinfo.mp.detail.userInfo
				var sign = uni.getStorageSync('sign')
				uni.request({
					url: that.apiServer+'member&m=login',
					method: 'POST',
					header: {'content-type': 'application/x-www-form-urlencoded'},
					data: {
						openid: that.openid,
						name: userinfo.nickName,
						face: userinfo.avatarUrl,
						sign: sign
					},
					success: (res) => {
						res = res.data
						if(res.status == 'ok') {
							uni.showToast({
								title: '登录成功'
							})
							uni.setStorageSync('SUID', res.data.u_id + '')
							uni.setStorageSync('SRAND', res.data.u_random + '')
							uni.setStorageSync('SNAME', res.data.u_name + '')
							uni.setStorageSync('SFACE', res.data.u_face + '')
							if (pageOptions.backtype == 1) {
								uni.redirectTo({
									url: pageOptions.backpage
								})
							}
							else {
								uni.switchTab({
									url: pageOptions.backpage
								})
							}
						} else {
							uni.showToast({
								title: '登录失败'
							})
						}
					},
					fail() {
						console.log('获取用户信息失败')
					}
				})
			}
			// #endif
		}
	}
</script>

<style>

</style>
