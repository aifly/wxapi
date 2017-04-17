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

	connect() {
	   // 创建websocket
		var ws = new WebSocket("ws://socket.zmiti.com:7272");
		this.ws = ws;
		var s = this;
		this.client_list =  this.client_list || {};
	   ws.onopen = this.onopen.bind(this);
	   // 当有消息时根据消息类型显示不同信息
	   ws.onclose = function() {
	      console.log("连接关闭，定时重连");
	      s.connect();
	   };
	   ws.onerror = function() {
	      console.log("出现错误");
	   };
	   ws.onmessage = function(e){
	   		console.log(e.data);
	   		 var data = JSON.parse(e.data);
               console.log(data);
                switch(data['type']){
                    // 服务端ping客户端
                    case 'ping':
                        console.log(data);
                        ws.send('{"type":"pong"}');
                        break;
                    // 登录 更新用户列表
                    case 'login':
                        //{"type":"login","client_id":xxx,"client_name":"xxx","client_list":"[...]","time":"xxx"}
                         if(data['client_list'])
			                {
			                    s.client_list = data['client_list'];
			                }
			                else
			                {
			                    s.client_list[data['client_id']] = data['client_name']; 
			                }
                        
                        ws.send(JSON.stringify({type:'say',content:"mb",from_client_name:"zmiti",from_client_id:"zmiti",time:'11-11'}));
                        break;
                    // 发言
                    case 'say':
                      s.say(data['from_client_id'], data['from_client_name'], data['content'], data['time']);
                        break;
                    // 用户退出 更新用户列表
                    case 'logout':
                        //{"type":"logout","client_id":xxx,"time":"xxx"}
                        //console.log(data['client_name']+"退出了");
                        alert(data['client_name'] + 'logout')
                       // delete client_list[data['from_client_id']];
                }
	   }
	}

    say(from_client_id, from_client_name, content, time){
    	console.log('from-client-id: '+ from_client_id+" from-client-name: " + from_client_name + ' 说 ：'+ content + ' 时间 ' + time);
    }

    onopen(){
        // 登录
        var login_data = {"type":"login","client_name":'zmiti',"room_id":"1"};
        console.log("websocket握手成功，发送登录数据:"+JSON.stringify(login_data));


        this.ws.send(JSON.stringify(login_data));

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

			    		wx.getLocation({
						    type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
						    success: function (res) {
						        var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
						        var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
						        var speed = res.speed; // 速度，以米/每秒计
						        var accuracy = res.accuracy; // 位置精度
						       /* $.ajax({
						        	url:`http://restapi.amap.com/v3/geocode/regeo?
						        	key=10df4af5d9266f83b404c007534f0001&
						        	location=${longitude},${latitude}&poitype=&radius=100&extensions=base&batch=false&roadlevel=1`
						        })*/

						    }
						});
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

		this.connect();
	}

	clearRender(){
		clearInterval(this.talkTimer);
	}
}

	ReactDOM.render(<App></App>,document.getElementById('fly-main-ui'));
	

