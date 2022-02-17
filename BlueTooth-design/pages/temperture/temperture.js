import * as echarts from '../ec-canvas/echarts';
import mqtt from '../mqtt/mqtt.min';//加载mqtt库
const app = getApp();
var temchart;
var humchart;
var temopt;
var humopt;

function initChart_tem(canvas, width, height) {
  temchart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(temchart);

  temopt = {
    title:{
      text: '温度',
      left: 'center'
    },
    xAxis: {
        type: 'category',
        data: ['6分钟前', '5分钟前', '4分钟前', '3分钟前', '2分钟前', '1分钟前', '当前']
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        data: app.globalData.scanData.temperature,
        type: 'line'
    }]
  };

  temchart.setOption(temopt);
  return temchart;
}
function initChart_hum(canvas, width, height) {
  humchart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(humchart);

  humopt = {
    title:{
      text: '湿度',
      left: 'center'
    },
    xAxis: {
        type: 'category',
        data: ['6分钟前', '5分钟前', '4分钟前', '3分钟前', '2分钟前', '1分钟前', '当前']
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        data: app.globalData.scanData.humidity,
        type: 'line'
    }]
};
  humchart.setOption(humopt);
  return humchart;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec_tem:{
      onInit:initChart_tem,
    },
    ec_hum:{
      onInit:initChart_hum,
    },
    uid:"3565a5b10389b652ab54f0ba0e8107f2",//用户密钥，巴法云控制台获取
    dhttopic:"DHT11",//传输温湿度的主题，控制台创建
    wendu:"",//温度值，默认为空
    shidu:"",//湿度值，默认为空
    client: null,//mqtt客户端，默认为空
    device_status:"离线",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //连接mqtt
    this.mqttConnect()
  },

  onShow: function (options){
  },
  mqttConnect(){
    var that = this
    
    //MQTT连接的配置
    var options= {
      keepalive: 60, //60s ，表示心跳间隔
      clean: true, //cleanSession不保持持久会话
      protocolVersion: 4, //MQTT v3.1.1
      clientId:this.data.uid
    }
    //初始化mqtt连接
     this.data.client = mqtt.connect('wxs://bemfa.com:9504/wss',options)
     // 连接mqtt服务器
     this.data.client.on('connect', function () {
      console.log('连接服务器成功')
      //订阅dht11温湿度主题
      that.data.client.subscribe(that.data.dhttopic, function (err) {
        if (err) {
            console.log(err)
        }
        //检查设备是否在线并获取当前温度
         that.getOnline()
      })
    })
    //接收消息
    that.data.client.on('message', function (topic, message) {
      console.log(topic)
      var  msg = message.toString()
      if(topic == that.data.dhttopic){//如果是温湿度主题的消息
        //假设上传的数据为#23#45#off，其中温度是23，湿度45
        if(msg.indexOf("#") != -1){
          //如果有#号就进行字符串分割
          var array = msg.split("#"); //分割数据，并把分割后的数据放到数组里。
          console.log(array)//打印数组
          for (var i = 0; i <= 5; i++) {
            app.globalData.scanData.temperature[i] = app.globalData.scanData.temperature[i + 1];
            app.globalData.scanData.humidity[i] = app.globalData.scanData.humidity[i + 1];
          }
          app.globalData.scanData.temperature[6] = array[1];
          app.globalData.scanData.humidity[6] = array[2];
        }
        temopt.series[0].data = app.globalData.scanData.temperature;
        humopt.series[0].data = app.globalData.scanData.humidity;
        temchart.setOption(temopt);
        humchart.setOption(humopt);
      }
      //打印消息
      console.log('收到消息：'+msg)
    })

    //断线重连
    this.data.client.on("reconnect", function () {
      that.mqttConnect()
      console.log("重新连接")
    });


  },
  getOnline(){
    var that = this
    //请求设备状态,检查设备是否在线
     //api 接口详细说明见巴法云接入文档
    wx.request({
      url: 'https://api.bemfa.com/mqtt/status/', //状态api接口，详见巴法云接入文档
      data: {
        uid: that.data.uid,
        topic: that.data.dhttopic,
      },
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success (res) {
        console.log(res.data)
        if(res.data.status === "online"){
          that.setData({
            device_status:"在线"
          })
          that.getdht11()
        }else{
          that.setData({
            device_status:"离线"
          })
          wx.showToast({
            title: '温湿度器离线',
            icon: "error"
          })
        }
        console.log(that.data.device_status)
      }
    })    
  },
  getdht11(){
    if(this.data.device_status == "离线"){
      return;
    }
    var that = this
    wx.request({
      url: 'https://api.bemfa.com/api/device/v1/data/3/get/', //状态api接口，详见巴法云接入文档
      data: {
        uid: that.data.uid,
        topic: that.data.dhttopic,
        num:1
      },
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success (res) {
        console.log(res)
        if("undefined" != typeof res.data.data){//判断是否获取到温湿度
          console.log(res.data.data[0].msg)
          if(res.data.data[0].msg.indexOf("#") != -1){//如果数据里包含#号，表示获取的是传感器值，因为单片机上传数据的时候用#号进行了包裹
            //如果有#号就进行字符串分割
            var array = res.data.data[0].msg.split("#"); //分割数据，并把分割后的数据放到数组里。
            console.log(array)//打印数组
            for (var i = 0; i <= 5; i++) {
              app.globalData.scanData.temperature[i] = app.globalData.scanData.temperature[i + 1];
              app.globalData.scanData.humidity[i] = app.globalData.scanData.humidity[i + 1];
            }
            app.globalData.scanData.temperature[6] = array[1];
            app.globalData.scanData.humidity[6] = array[2];

            temopt.series[0].data = app.globalData.scanData.temperature;
            humopt.series[0].data = app.globalData.scanData.humidity;
            console.log("更新温度")
            temchart.setOption(temopt);
            humchart.setOption(humopt);
          }
        }

      }
    })    
  }
})