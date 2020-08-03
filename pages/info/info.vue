<template>
	<view>
		<!-- 标题 -->
		<view :class="['grace-article-title', graceSkeleton == 'ing' ? 'grace-skeleton' : '']">
			{{article.art_title}}
		</view>
		<!-- 作者信息 -->
		<view class="grace-article-author-line">
			<view :class="['grace-article-author' ,graceSkeleton == 'ing' ? 'grace-skeleton': '']">
				<image :src="article.u_face" mode="widthFix"></image>
				<view class="author-name">
					{{article.u_name}}
				</view>
			</view>
			<view>
				{{article.art_createtime}}
			</view>
		</view>
		<!-- 文章内容 -->
		<view class="grace-article-contents">
			<block v-for="(item, index) in artContents" :key="index">
				<view :class="['img-item', graceSkeleton == 'ing' ? 'grace-skeleton' : '']" v-if="item.type == 'image'">
					<image :src="item.content" data-url = "item.content" mode="widthFix" @tap="showImgs"></image>
				</view>
				<view :class="['text-item', graceSkeleton == 'ing' ? 'grace-skeleton' : '']" v-if="item.type == 'text'">
					{{item.content}}
				</view>
			</block>
		</view>
	</view>
</template>

<script>
	var that;
	export default {
		data() {
			return {
				article: [],  // 文章基础信息
				artContents: [], // 文章项目
				graceSkeleton: 'ing'
			}
		},
		onLoad(options) {
			that = this
			let artid = options.artid
			// 加载文章详情
			uni.showLoading({
				title: '正在加载...'
			})
			uni.request({
				url: this.apiServer + 'art&m=infoWithUser&artid='+artid,
				method: 'GET',
				success: res => {
					let art = res.data.data
					console.log(art)
					// 将文章内容转为数组
					let artContentItems = JSON.parse(art.art_content)
					// 首先规划骨架
					this.artContents = []
					for(let i = 0; i < artContentItems.length; i++) {
						this.artContents.push({'type': artContentItems[i].type})
					}
					// 延迟添加数据
					setTimeout(function() {
						that.article = art
						that.artContents = artContentItems
						that.graceSkeleton = 'end'
						uni.hideLoading()
					}, 500)
				}
			})
		},
		methods: {
			showImgs(e) {
				const currentUrl = e.currentTarget.dataset.url
				let imgsNeedShow = []
				for(let i = 0; i < this.artContents.length; i++) {
					if(this.artContents[i].type == 'image') {
						imgsNeedShow.push(this.artContents[i].content)
					}
				}
				uni.previewImage({
					urls: imgsNeedShow,
					current: currentUrl
				})
			}
		}
	}
</script>

<style>

</style>
