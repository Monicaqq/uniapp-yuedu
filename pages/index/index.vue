<template>
	<view>
		<view class="grace-header-cate">
			<scroll-view class="grace-tab-title grace-center" scroll-x="true" id="grace-tab-title">
				<view v-for="(cate, index) in categories" :key="index" 
				:data-cateid="cate.cateId" :data-index="index" 
				:class="[cateCurrentIndex == index ? 'grace-tab-current': '']" @tap="tabChange">{{cate.name}}</view>
			</scroll-view>
		</view>
		<view style="height: 50px;"></view>
		<!-- 文章内容区 -->
		<view class="grace-news-list">
			<block v-for="(item, index) in artList" :key="index">
				<!-- 一张图 -->
				<navigator v-if="item.art_content.length < 3" open-type="navigate" :url="'../info/info?artid='+item.art_id">
					<view class="grace-news-list-img-news">
						<view class="grace-news-list-title-main">
							{{item.art_title}}
						</view>
						<view class="grace-news-list-img-big">
							<image :src="item.art_content[0]" mode="widthFix">
						</view>
					</view>
				</navigator>
				<!-- 三张图 -->
				<navigator v-if="item.art_content.length >= 3" :url="'../info/info?artid='+item.art_id">
					<view class="grace-news-list-img-news">
						<view class="grace-news-list-title-main">
							{{item.art_title}}
						</view>
						<view class="grace-news-list-imgs">
							<view class="imgs">
								<image :src="item.art_content[0]" mode="widthFix">
							</view>
							<view class="imgs">
								<image :src="item.art_content[1]" mode="widthFix"></image>
							</view>
							<view class="imgs">
								<image :src="item.art_content[2]" mode="widthFix"></image>
							</view>
						</view>
					</view>
				</navigator>
			</block>
		</view>
	</view>
</template>
<script>
	var that, cate = 0, page = 1;
	const signModel = require('../../commons/sign.js')
	export default {
		data() {
			return {
				categories: [{cateId: 0, name: '全部'}],
				cateCurrentIndex: 0,
				artList: []
			}
		},
		onLoad() {
			that = this
			signModel.sign(this.apiServer)
			// 加载文章分类
			uni.request({
				url: this.apiServer+ 'category&m=index',
				method: 'GET',
				success: res => {
					if(res.data.status == 'ok') {
						let categories = res.data.data
						for(let k in categories) {
							that.categories.push({cateId: k, name: categories[k]})
						}
					}
				}
			})
			this.getNewsList()
		},
		// 上拉刷新
		onPullDownRefresh() {
			page = 1
			this.artList = []
			this.getNewsList()
		},
		// 下拉刷新
		onReachBottom() {
			this.getNewsList()
		},
		methods: {
			tabChange(e) {
				const cateid = e.currentTarget.dataset.cateid
				const index = e.currentTarget.dataset.index
				page = 1
				this.cateCurrentIndex = index
				cate = cateid
				this.artList = []
				this.getNewsList()
			},
			getNewsList() {
				uni.showLoading({
					title: '加载中...'
				})
				uni.request({
					url: this.apiServer + 'art&m=getList&cate=' + cate + '&page='+page,
					method: 'GET',
					success: res => {
						if(res.data.status == 'empty') {
							uni.showToast({
								title: '已经加载全部新闻',
								icon: 'none'
							})
						} else if(res.data.status == 'ok') {
							let newList = res.data.data
							for(var i = 0; i < newList.length; i++) {
								// 把图片分离出来
								let content = newList[i].art_content
								content = JSON.parse(content)
								let imgs = []
								for(let ii = 0; ii < content.length; ii++) {
									if(content[ii].type == 'image') {
										imgs.push(content[ii].content)
									}
								}
								newList[i].art_content = imgs
							}
							that.artList = that.artList.concat(newList)
							uni.hideLoading()
							page++
						}
					},
					complete() {
						uni.stopPullDownRefresh()
					}
					
				})
			}
		}
	}
</script>
<style>
	
</style>