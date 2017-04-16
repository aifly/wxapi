import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import $ from 'jquery';
injectTapEventPlugin();
import IScroll from 'iscroll';
import './assets/css/index.css';

import ZmitiLoadingApp from './loading/index.jsx';
export class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			msg:'等待录音……',
			audioSrc:''
		}
		
	}
	render() {
		return (
			<div className='zmiti-main-ui'>
				<div className='zmiti-msg'>{this.state.msg}</div>
				<div className='zmiti-msg'>{this.state.audioSrc}</div>
				<section className='zmiti-btn' onTouchTap={this.startRecord.bind(this)}>开始录音</section>
				<section className='zmiti-btn' onTouchTap={this.stopRecord.bind(this)}>结束录音</section>
				<section className='zmiti-btn' onTouchTap={this.playVoice.bind(this)}>播放录音</section>
				<section className='zmiti-btn' onTouchTap={this.pauseVoice.bind(this)}>暂停播放录音</section>
				<section className='zmiti-btn' onTouchTap={this.stopVoice.bind(this)}>结束播放录音</section>
				<section className='zmiti-btn' onTouchTap={this.translateVoice.bind(this)}>识别录音</section>

				<section className='zmiti-msg'>
					{this.state.result}
				</section>
			</div>
		);
	}

	startRecord(){
		wx.startRecord();
		this.setState({
			msg:'开始录音...'
		});

	}

	translateVoice(){//识别录音
		var s = this;
		wx.translateVoice({
		    localId: s.localId, // 需要识别的音频的本地Id，由录音相关接口获得
		    isShowProgressTips: 1, // 默认为1，显示进度提示
		    success: function (res) {
		    	s.setState({
		    		result:res.translateResult
		    	});
		    }
		});
	}
	stopRecord(){
		var s = this;
		
		wx.stopRecord({
			fail(){
			},
			success: function (res) {
				s.localId =	res.localId;
				s.setState({
					msg:'结束录音...',
					audioSrc:s.localId
				});
			} 
		});
			
	}
	playVoice(){
		var s = this;
		wx.playVoice({
		    localId: s.localId
		});
		this.setState({
			msg:'开始播放录音'
		})
	}
	pauseVoice(){
		var s = this;
		wx.pauseVoice({
		    localId: s.localId
		});
		this.setState({
			msg:'暂停播放录音'
		})
	}
	stopVoice(){
		var s = this;
		wx.stopVoice({
		    localId: s.localId
		});
		this.setState({
			msg:'停止播放录音'
		});
	}

	wxConfig(title,desc,img,appId='wxfacf4a639d9e3bcc',worksid){
		   var durl = location.href.split('#')[0]; //window.location;
		        var code_durl = encodeURIComponent(durl);
			$.ajax({
				type:'get',
				url: "http://api.zmiti.com/weixin/jssdk.php",
				data:{
					type:'signature',
					durl:durl,
					worksid:worksid
				},
				dataType:'jsonp',
				jsonp: "callback",
			    jsonpCallback: "jsonFlickrFeed",
			    success(data){

			    	wx.config({
							    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
							    appId:appId, // 必填，公众号的唯一标识
							    timestamp:'1488558145' , // 必填，生成签名的时间戳
							    nonceStr: 'Wm3WZYTPz0wzccnW', // 必填，生成签名的随机串
							    signature: data.signature,// 必填，签名，见附录1
							    jsApiList: [ 'checkJsApi',
											'onMenuShareTimeline',
											'onMenuShareAppMessage',
											'onMenuShareQQ',
											'onMenuShareWeibo',
											'hideMenuItems',
											'showMenuItems',
											'hideAllNonBaseMenuItem',
											'showAllNonBaseMenuItem',
											'translateVoice',
											'startRecord',
											'stopRecord',
											'onRecordEnd',
											'playVoice',
											'pauseVoice',
											'stopVoice',
											'uploadVoice',
											'downloadVoice',
											'chooseImage',
											'previewImage',
											'uploadImage',
											'downloadImage',
											'getNetworkType',
											'openLocation',
											'getLocation',
											'hideOptionMenu',
											'showOptionMenu',
											'closeWindow',
											'scanQRCode',
											'chooseWXPay',
											'openProductSpecificView',
									] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
							});

			    	wx.ready(()=>{


			    			 		//朋友圈
	                    wx.onMenuShareTimeline({
	                        title: title, // 分享标题
	                        link: durl, // 分享链接
	                        imgUrl: img, // 分享图标
	                        desc: desc,
	                        success: function () { },
	                        cancel: function () { }
	                    });
	                    //朋友
	                    wx.onMenuShareAppMessage({
	                        title: title, // 分享标题
	                        link: durl, // 分享链接
	                        imgUrl: img, // 分享图标
	                        type: "link",
	                        dataUrl: "",
	                        desc: desc,
	                        success: function () {
	                        },
	                        cancel: function () { 
	                        }
	                    });
	                    //qq
	                    wx.onMenuShareQQ({
	                        title: title, // 分享标题
	                        link: durl, // 分享链接
	                        imgUrl: img, // 分享图标
	                        desc: desc,
	                        success: function () { },
	                        cancel: function () { }
	                    });
			    	});
			    }
			});
		 
	}
 

 
	isWeiXin(){
	    var ua = window.navigator.userAgent.toLowerCase();
	    if(ua.match(/MicroMessenger/i) == 'micromessenger'){
	        return true;
	    }else{
	        return false;
	    }
    }

    getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return (r[2]);
        return null;
    }


	componentDidMount() {
		var s = this;
		this.wxConfig('微信API测试','微信API测试','http://h5.zmiti.com/public/wxapi/assets/images/300.jpg');

		wx.onVoicePlayEnd({
		    success: function (res) {
		    	s.setState({
		    		msg:'录音停止。'
		    	})
		        //var localId = res.localId; // 返回音频的本地ID
		    }
		});
	}

	clearRender(){
		clearInterval(this.talkTimer);
	}
}

	ReactDOM.render(<App></App>,document.getElementById('fly-main-ui'));
	

