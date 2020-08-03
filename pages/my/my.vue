<template>
	<view class="grace-padding">
		<view class="myface">
			<image :src="myFace" mode="widthFix"></image>
		</view>
		<view class="text-align:center; margin: 10px 0">
			{{user.u_name}}
			<text style="color: #888;" @tap="logout">注销</text>
		</view>
		<view class="grace-box-banner" style="margin: 30rpx 0;">
			<view class="garce-items">
				<view class="line1">{{user.artCount}}</view>
				<view class="line2">文章</view>
			</view>
			<view class="garce-items">
				<view class="line1">
					{{user.u_integral}}
				</view>
				<view class="line2">
					积分
				</view>
			</view>
			<view class="garce-items">
				<view class="line1">
					{{user.u_remainder}}
				</view>
				<view class="line2">
					余额
				</view>
			</view>
			<view class="garce-items">
				<view class="line1">
					0
				</view>
				<view class="line2">
					消息
				</view>
			</view>
		</view>
		<view class="garce-title grace-nowrap grace-space-between">
			<view class="grace-h5 grace-blod">
				我的文章
			</view>
		</view>
		<view class="myart-list" v-for="(item, index) in arts" :key="index">
			<view class="title">
				{{item.art_title}}
			</view>
			<view class="btns">
				<view :data-artid="item.art_id" @tap="editArt">
					编辑
				</view>
				<view :data-artid="item.art_id" :data-index="index" @tap="removeArt">
					删除
				</view>
			</view>

		</view>
		<view class="loadMore" @tap="getArtList">
			{{loadMore}}
		</view>
	</view>
</template>

<script>
	var loginRes, that, page;
	export default {
		data() {
			return {
				myFace: '',
				user: {},
				arts: [],
				loadMore: '点击加载更多'
			}
		},
		onLoad() {
			that = this
			loginRes = this.checkLogin('../my/my', 2)
			if (!loginRes) {
				return false;
			}
			this.myFace = loginRes[3]
		},
		onShow() {
			loginRes = this.checkLogin('../my/my', 2)
			if (!loginRes) {
				return false;
			}
			// 加载我的文章
			this.arts = []
			page = 1
			this.getArtList()
			// 加载会员信息
			uni.request({
				url: this.apiServer + 'my&m=info',
				method: 'POST',
				header: {
					'content-type': "application/x-www-form-urlencoded"
				},
				data: {
					uid: loginRes[0],
					random: loginRes[1]
				},
				success: res => {
					if (res.data.status == 'ok') {
						this.user = res.data.data
					}
				},

			})
		},
		methods: {
			// 编辑文章
			editArt(e) {
				const artId = e.currentTarget.dataset.artid
				uni.navigateTo({
					url: '../editArt/editArt?artId=' + artId
				})
			},
			// 移除文章
			removeArt(e) {
				const artId = e.currentTarget.dataset.artid
				const index = e.currentTarget.dataset.index
				uni.showModal({
					title: '提示',
					content: '确定要删除吗?',
					success(e) {
						if (e.confirm) {
							uni.request({
								url: that.apiServer + 'my&m=removeArt',
								method: 'POST',
								header: {
									'content-type': 'application/x-www-form-urlencoded'
								},
								data: {
									uid: loginRes[0],
									random: loginRes[1],
									artId: artId
								},
								success: res => {
									if (res.data.status == 'ok') {
										uni.showToast({
											title: '已删除',
											icon: 'none'
										})
										that.arts.splice(index, 1)
									} else {
										uni.showToast({
											title: '删除失败',
											icon: 'none'
										})
									}
								}
							})
						}
					}
				})
			},
			// 获取文章列表
			getArtList() {
				if (this.loadMore != '点击加载更多') {
					return false;
				}
				this.loadMore = '加载中...'
				uni.request({
					url: this.apiServer + 'my&m=arts&page=' + page,
					method: 'POST',
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					data: {
						uid: loginRes[0],
						random: loginRes[1]
					},
					success: res => {
						if (res.data.status == 'ok') {
							this.arts = this.arts.concat(res.data.data)
							page++
							this.loadMore = '点击加载更多'
						} else if (res.data.status == 'empty') {
							this.loadMore = '已经加载全部'
						} else {
							this.loadMore = '点击加载更多'
						}
					}
				})
			},
			// 注销
			logout() {
				// console.log('logout')
				uni.removeStorageSync('SUID')
				uni.removeStorageSync('SRAND')
				uni.showToast({
					title: '您已经退出悦读',
					icon: 'none'
				})
				setTimeout(function() {
					uni.switchTab({
						url: '../index/index'
					})
				}, 1000)
			}
		}
	}
</script>

<style style="less" scoped>
	.myface {
		width: 88px;
		height: 88px;
		border: 5px solid f1f2f3;
		border-radius: 100%;
		margin: 15px auto;
	}

	.myface image {
		width: 100%;
		border-radius: 100%;
	}

	.myart-list {
		display: flex;
		flex-direction: row;
		width: 100%;
		margin: 8px 0;
		overflow: hidden;
		border-bottom: 1px dashed #d7d8d9;
	}

	.myart-list .title {
		line-height: 2em;
		width: 100%;
	}

	.myart-list .btns {
		line-height: 2em;
		width: 100%;
	}

	.myart-list .btns view {
		float: right;
		padding: 0 6px;
		margin: 0 5px;
		color: #00b26a;
	}

	.myart-list .btns view:last-child {
		color: #f76260;
	}

	.loadMore {
		width: 100%;
		padding: 8px 0;
		text-align: center;
		color: #ccc;
	}
</style>
