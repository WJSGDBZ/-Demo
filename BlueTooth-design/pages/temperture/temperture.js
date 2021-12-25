import * as echarts from '../ec-canvas/echarts';
const app = getApp();

function initChart_tem(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  var option = {
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
setInterval(function(){
  option.series[0].data = app.globalData.scanData.temperature;
  chart.setOption(option);
},1000*62)
  chart.setOption(option);
  return chart;
}
function initChart_hum(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  var option = {
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
setInterval(function(){
  option.series[0].data = app.globalData.scanData.humidity;
  chart.setOption(option);
},1000*62)
  chart.setOption(option);
  return chart;
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
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})