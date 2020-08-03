<template>
	<!-- 写作页面 -->
	<view class="wrap">
		<!-- 标题 -->
		<view class="write_title">
			<input type="text" placeholder="请输入标题" v-model="title" />
		</view>
		<!-- 内容展示区 -->
		<view class="artList">
			<block v-for="(item, index) in artList" :key="index">
				<view class="item" v-if="item.type == 'image'">
					<image :src="item.content" :data-index="index" mode="widthFix" @tap="removeImg"></image>
				</view>
				<view class="item" v-if="item.type == 'text'">
					<textarea placeholder="" v-model="artList[index].content" />
					<view :data-index="index" class="deleteText" @tap="deleteText">删除</view>
				</view>
			</block>
		</view>
		<!-- 输入区 -->
		<form @submit="submit">
			<view class="inputArea">
				<view class="addImg" @tap="addImg">+图片</view>
				<view class="addText">
					<textarea name="artText" maxlength="-1" v-model="inputContent" placeholder="请输入文本" />
					<button type="primary" form-type="submit">添加</button>
				</view>
			</view>
		</form>
		<!-- 选则分类 -->
		<view class="art-cate">
			<view>文章分类</view>
			<view>
				<picker mode="selector" :range="caties" @change="cateChange">
					<view>{{caties[currentCateIndex]}}</view>
				</picker>
			</view>
		</view>
		<!-- 提交按钮 -->
		<view class="submitNow" v-if="artList.length > 0" @tap="submitNow">
			<button type="primary">编辑文章</button>
		</view>
	</view>
</template>

<script>
	var that, loginRes, artId;
	const signModel = require('../../commons/sign.js') 
	export default {
		data() {
			return {
				title: '',
				artList: [],
				inputContent: '',
				needUploadImg : [],
				uploadIndex: 0,
				// 分类
				caties: ['点击选择'],
				// 当前选择分类的索引
				currentCateIndex: 0,
				// 所有分类
				catiesFromApi: [],
				// 记录真实选择的api 接口数据的分类id
				sedCateIndex: 0
			}
		},
		onLoad(options) {
			artId = options.artId
			console.log(options)
			that = this
			loginRes = this.checkLogin('../my/my', '2')
			if(!loginRes) { return false }
			// 签名
			signModel.sign(that.apiServer)
			// 加载文章默认值
			uni.request({
				url: that.apiServer+'art&m=info&artid='+artId,
				method: 'GET',
				success: res => {
					if(res.data.status == 'ok') {
						const art = res.data.data
						console.log('art', art)
						let artContent = art.art_content
						artContent = JSON.parse(artContent)
						that.artList = artContent
						// 默认值赋值
						this.title = art.art_title
						// 加载文章分类并设置默认值
						uni.request({
							url: that.apiServer + 'category&m=index',
							method: 'GET',
							success: res => {
								if(res.data.status == 'ok') {
									// 把数据格式整理为picker支持的格式 ['分类名', ...]
									const categories = res.data.data
									for(let k in categories) {
										that.caties.push(categories[k])
									}
									// 记录分类信息
									that.catiesFromApi = categories
									// 获取当前分类的默认值
									that.sedCateIndex = art.art_cate
									// 对应的查找picker的默认值
									const cateName = that.catiesFromApi[that.sedCateIndex]
									for(let i = 0; i < that.caties.length; i++) {
										if(cateName == that.caties[i]) {
											that.currentCateIndex = i
											break;
										}
									}
								}
							}
						})
					}
				},
				fail: (e) => {
					console.log(JSON.stringify(e))
				}
			})
		},
		// 每次展示该页面, 进行登录验证
		onShow() {
			loginRes = this.checkLogin('../write/write', '2')
			if(!loginRes) { return false }
			// 重新签名
			signModel.sign(that.apiServer)
		},
		onPullDownRefresh() {
			console.log('onPullDownRefresh')
		},
		onReachBottom() {
			console.log('onReachBottom')
		},
		methods: {
			// 改变文章分类
			cateChange(e) {
				// sedIndex 点击的picker对应的 index
				const sedIndex = e.detail.value
				this.currentCateIndex = sedIndex
				// 获取选择的分类名称
				if(sedIndex < 1) { return false; }
				// 选中的分类名
				const cateName = this.caties[sedIndex]
				for(let k in this.catiesFromApi) {
					if(cateName == this.catiesFromApi[k]) {
						// 当点击的index 对应的分类名 与展示分类分组中分类名一致
						// 记录分类名对于的索引
						this.sedCateIndex = k
						break;
					}
				}
			},
			// 移除图片
			removeImg(e) {
				// 对image设置属性data-index 获取index 
				const index = e.currentTarget.dataset.index
				uni.showModal({
					content: '确定要删除此图片吗?',
					title: '提示',
					success(e) {
						if(e.confirm) {
							that.artList.splice(index, 1)
						}
					}
				})
			},
			// 删除
			deleteText(e) {
				const index = e.currentTarget.dataset.index
				uni.showModal({
					content: '确定要删除吗?',
					title: '提示',
					success(e) {
						if(e.confirm) {
							that.artList.splice(index, 1)
						}
					}
				})
			},
			// 添加图片
			addImg() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					success(res) {
						that.artList.push({"type": "image", "content": res.tempFilePaths[0]})
					}
				})
			},
			submit(e) {
				const content = e.detail.value.artText
				if(content.length < 1) {
					uni.showToast({
						title: "请输入内容",
						icon: 'none'
					})
					return false;
				}
				this.artList.push({
					"type": "text",
					"content": content
				})
			},
			submitNow() {
				// 数据验证
				if(this.title.length < 2) {
					uni.showToast({
						title: '请输入标题',
						icon: 'none'
				})
				return false;
				}
				if(this.artList.length < 1) {
					uni.showToast({
						title: '请填写文章内容',
						icon: 'none'
				})
					return false;
				}
				if(this.sedCateIndex < 1) {
					uni.showToast({
						title: '请选择分类',
						icon: 'none'
					})
					return false;
				}
				// 上传图片 一次一个多次上传 [递归函数]
				// 上传完成后 整体提交数据
				// 首先整理一下需要上传的图片
				// this.needUploadImg = [{tmpurl: 临时地址, index: 数据索引}]
				this.needUploadImg = []
				for(let i = 0; i < this.artList.length; i++) {
					if(this.artList[i].type == 'image') {
						if(this.artList[i].content.indexOf('192.168.1.51') == -1) {
							this.needUploadImg.push({
								'tmpurl': this.artList[i].content,
								'indexID': i
							})
						}
					}
				}
				console.log(this.needUploadImg)
				this.uploadImg()
			},
			uploadImg() {
				// 如果没有图片 或者已经上传完成 则执行提交
				if(this.needUploadImg.length < 1 || this.uploadIndex >= this.needUploadImg.length) {
					uni.showLoading({
						title: '正在提交'
					})
					const sign = uni.getStorageSync('sign')
					uni.request({
						url: this.apiServer + 'art&m=edit&artid='+artId,
						method: 'POST',
						header: {
							'content-type': 'application/x-www-form-urlencoded'
						},
						data: {
							title: that.title,
							content: JSON.stringify(that.artList),
							uid: loginRes[0],
							random: loginRes[1],
							cate: that.sedCateIndex,
							sign: sign
						},
						success: (res) => {
							if(res.data.status == 'ok') {
								uni.showToast({
									title: '提交成功',
									icon: 'none'
								})
								that.artList = []
								signModel.sign(that.apiServer)
								// 防止数据缓存
								that.currentCateIndex = 0
								that.sedCateIndex = 0
								that.needUploadImg = []
								that.title = ''
								setTimeout(function(){
									uni.switchTab({
										url: '../my/my'
									})
								}, 1000)
							} else {
								uni.showToast({
									title: res.data.data,
									icon: 'none'
								})
							}
						}
					})
				} else {
					// 上传图片
					uni.showLoading({
						title: '上传图片'
					})
					const uploader = uni.uploadFile({
						url: that.apiServer + 'uploadImg&m=index',
						filePath: that.needUploadImg[that.uploadIndex].tmpurl,
						name: 'file',
						success: (uploadFileRes) => {
							uploadFileRes = JSON.parse(uploadFileRes.data)
							if(uploadFileRes.status != 'ok') {
								uni.showToast({
									title: '上传图片失败,请重试',
									icon: 'none'
								})
								return false;
							}
							// 将已经上传的文件地址赋值给文章数据
							const index = that.needUploadImg[that.uploadIndex].indexID
							that.artList[index].content = that.staticServer + uploadFileRes.data
							that.uploadIndex ++ 
							// 递归上传
							setTimeout(function(){that.uploadImg()}, 1000)
						},
						fail: (e) => {
							console.log(e)
							uni.showToast({
								title: '上传图片失败,请重试',
								icon: 'none'
							})
						}
					})
				}
			}
			
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}
	.text-area {
		display: flex;
		justify-content: center;
	}
	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
	.submitNow {
		margin-top: 10px;
	}
</style>
