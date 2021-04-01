import * as echarts from '../../ec-canvas/echarts';
var url = "http://192.168.43.139";
const app = getApp();
var Chart = null;
var option = {
  color: ["#37A2DA", "#32C5E9", "#67E0E3", "#91F2DE", "#FFDB5C", "#FF9F7F"],
  animationDurationUpdate: 1500,
  animationEasingUpdate: 'quinticInOut',
  series: [{
    type: 'graph',
    layout: 'force',
    draggable: true,
    symbolSize: 50,
    roam: true,
    force: {
      repulsion: 100, //节点之间的斥力因子。支持数组表达斥力范围，值越大斥力越大。
      gravity: 0.03, //节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
      edgeLength: 80, //边的两个节点之间的距离，这个距离也会受 repulsion。[10, 50] 。值越小则长度越长
      layoutAnimation: false
    },
    label: {
      normal: {
        show: true
      }
    },
    // edgeSymbol: ['circle', 'arrow'],
    // edgeSymbolSize: [4, 10],
    edgeLabel: {
      normal: {
        textStyle: {
          fontSize: 20
        }
      }
    },
    data: [],
    // links: [],
    links: [{
      symbolSize: [5, 20],
      label: {
        normal: {
          show: true
        }
      },
      lineStyle: {
        normal: {
          width: 4,
          curveness: 0.2
        }
      }
    }, ],
    lineStyle: {
      normal: {
        opacity: 0.9,
        width: 2,
        curveness: 0
      }
    }
  }]
};

// function initChart(canvas, width, height, dpr) {
//   const chart = echarts.init(canvas, null, {
//     width: width,
//     height: height,
//     devicePixelRatio: dpr // new
//   });
//   canvas.setChart(chart);
//   // setInterval(function () {
//   //   if(app.globalData.isreflash){
//   //   option.series[0].data = app.globalData.device;
//   //   chart.setOption(option, true);
//   //   }
//   // }, 2000)
//   chart.setOption(option, true);
//   return chart;
// }
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ec: {
      lazyLoad: true
    },
    bg_img: null,
    blueToothNav: false,
    deviceName: "YK678LE10",
    isConnected: false,
    isFailed: true,
    isFinded: false,
    command: '',
    device: {},
    fixed: false,
    quick:false
  },
  quickConnection(){
    if(this.data.WIFI){
      this.setData({
        isConnected:true
      })
    }
    if(this.data.command == "1234"){
      this.setData({
        quick:true
      })
      this.onConnect();
      if(this.data.device.length >1){
        var event = {
          currentTarget:{
            dataset:{
              name:wx.getStorageSync('bt_name'),
              id:wx.getStorageSync('bt_id')
            }
          }
        }
        this.isConnection(event);
      }
      this.checkConnection();
    }else{
      this.checkConnection();
    }
  },
  checkConnection() {
    wx.showLoading({
      title: '正在校验中',
    })
    if (this.data.command == "1234" && this.data.isConnected) {
      setTimeout(() => {
        wx.hideLoading();
        wx.showModal({
          title: '校验成功',
          content: '谢谢你使用这个小破程序',
          confirmText: "朕知道了",
          success: (res) => {
            if (res.confirm) {
              this.getData();
            } else if (res.cancel) {
              this.getData();
            }
          }
        })
      }, 1000)
    } else {
      setTimeout(() => {
        wx.hideLoading();
        wx.showModal({
          title: 'sorry',
          content: '未识别校验码或暂无设备连接',
          confirmText: "朕再试试",
        })
      }, 1000)
    }
  },
  isfixed() {
    this.setData({
      fixed: !this.data.fixed
    })
  },
  onbgback() {
    this.setData({
      bg_img: null
    })
  },
  hidden() {
    this.setData({
      blueToothNav: false,
    })
  },
  onbg() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        console.log(tempFilePaths);
        this.setData({
          bg_img: tempFilePaths
        })
      }
    })
  },
  onConnect() {
    let that = this;
    wx.openBluetoothAdapter({
      success: function (res) {
        that.startBluetoothDevicesDiscovery();
        wx.showLoading({
          title: '搜索中',
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '请先开启蓝牙',
          icon: 'none',
          duration: 1000
        })
      }
    });
  },
  startBluetoothDevicesDiscovery: function () {
    var that = this;
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("discovery", res);
        if (res.errCode == 0) {
          that.setData({
            isFinded: true
          })
          that.getConnect();
        }
      },
    });
  },
  getConnect: function () {
    var that = this;
    var timer = setInterval(function () {
        wx.getBluetoothDevices({
          success: function (res) {
            var devices = [];
            console.log("devices", res);
            wx.hideLoading();
            for (var i = 0; i < res.devices.length; i++) {
              if (res.devices[i].name != '未知设备' && res.devices[i].RSSI != 0) {
                clearInterval(timer);
                devices.push(res.devices[i]);
              }
              if(that.data.quick){
                that.setData({
                  device: devices
                })
              }else{
                that.setData({
                  blueToothNav: true,
                  device: devices
                })
              }
            }
          }
        });
      },
      3000);
    setTimeout(function () {
      if (!that.data.isFinded) {
        clearInterval(timer);
        that.setData({
          isFailed: false
        });
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '搜索蓝牙超时',
          showCancel: false
        })
      }
    }, 12000);
  },
  buf2string(buffer) {
    var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
    return arr.map((char, i) => {
      return String.fromCharCode(char);
    }).join('');
  },
  string2buf: function (str) {
    // 首先将字符串转为16进制
    let val = ""
    for (let i = 0; i < str.length; i++) {
      if (val === '') {
        val = str.charCodeAt(i).toString(16)
      } else {
        val += ',' + str.charCodeAt(i).toString(16)
      }
    }
    // 将16进制转化为ArrayBuffer
    return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    })).buffer
  },
  ab2hex(buffer) {
    var hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    })
    return hexArr.join('');
  },

  onCommand(e) {
    this.setData({
      command: e.detail.value
    })
  },
  onSendCommand(value, params, Chart) {
    let that = this;
    console.log(typeof value);
    var buffer = new ArrayBuffer(1);
    let dataView = new DataView(buffer);
    dataView.setUint8(0, value);
    console.log("发送的数据为：", buffer);
    if (that.data.serviceId && that.data.characteristicId) {
      wx.writeBLECharacteristicValue({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.characteristicId,
        value: buffer,
        success: function (res) {
          if (value != '0')
            option.series[0].data[params.dataIndex].itemStyle.color = "#00BFFF";
          else
            option.series[0].data[params.dataIndex].itemStyle.color = "#D3D3D3";
          Chart.setOption(option);
          console.log("发送指令成功");
        },
        fail: function (res) {
          console.warn("发送指令失败", res)
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请先获取设备信息',
        showCancel: false
      })
    }
  },
  onGetuuid() {
    let that = this;
    if (that.data.isConnected && that.data.isFailed) {
      wx.showLoading({
        title: '获取serviceId',
      })
      console.log("开始获取设备信息");
      wx.getBLEDeviceServices({
        deviceId: that.data.deviceId,
        success(getServicesRes) {
          console.log("getServicesRes", getServicesRes);
          let service = getServicesRes.services[2]
          let serviceId = service.uuid
          wx.showLoading({
            title: '获取characteristicId',
          })
          wx.getBLEDeviceCharacteristics({
            deviceId: that.data.deviceId,
            serviceId: serviceId,
            success(getCharactersRes) {
              console.log("getCharactersRes", getCharactersRes);
              let characteristic = getCharactersRes.characteristics[0]
              let characteristicId = characteristic.uuid
              that.setData({
                serviceId: serviceId,
                characteristicId: characteristicId
              })
              console.log('成功获取uuId', that.data.serviceId, that.data.characteristicId);
              wx.notifyBLECharacteristicValueChange({
                state: true,
                deviceId: that.data.deviceId,
                serviceId: serviceId,
                characteristicId: getCharactersRes.characteristics[0].uuid,
                success() {
                  wx.readBLECharacteristicValue({
                    characteristicId: getCharactersRes.characteristics[0].uuid,
                    deviceId: that.data.deviceId,
                    serviceId: serviceId,
                  })
                  console.log('开始监听特征值')
                },
                fail: (res) => {
                  console.warn("监听特征值失败");
                }
              })
            },
            fail: (res) => {
              console.warn("获取特征值信息失败", res);
            },
            complete: (res) => {
              console.log('获取服务信息完成', res);
              wx.hideLoading();
            }
          })
          wx.onBLECharacteristicValueChange(function (onNotityChangeRes) {
            console.log('监听到特征值更新', onNotityChangeRes);
            var text = that.buf2string(onNotityChangeRes.value);
            console.log("蓝牙消息为：",text);
            if(text.length<6 && text.length>1 &&text < 50){
              wx.showModal({
                title: '蓝牙消息',
                content: "湿度:"+text+"% 主人，该浇水啦",
                showCancel: false
              })
            }else if(text.length<6 && text.length>1 && text > 50){
              wx.showModal({
                title: '蓝牙消息',
                content: "湿度:"+text+"% 水分充足",
                showCancel: false
              })
            }
            // that.setData({
            //   message: characteristicValue
            // })
          })
        },
        fail: (res) => {
          console.warn("获取服务信息失败", res);
        },
        complete: () => {
          wx.hideLoading();
        }
      })
    } else {
      wx.showToast({
        title: '请先连接蓝牙',
      })
    }
  },
  onCloseConnect() {
    wx.showLoading({
      title: '正在断开连接',
    })
    this.setData({
      isConnected: false,
      isFinded: false
    })
    setTimeout(() => {
      if(app.globalData.device[0].name == "温度监控"){
        app.globalData.device.splice(1, app.globalData.device.length + 1);
      }else{
        app.globalData.device.splice(0, app.globalData.device.length + 1);
      }
      this.getData();
      wx.hideLoading();
    }, 1000)

    wx.closeBLEConnection({
      deviceId: this.data.deviceId,
      success: function (res) {
        console.log("成功断开连接");
        wx.showToast({
          title: '成功断开连接',
        })
      },
    })
  },
  isConnection(event) {
    wx.showLoading({
      title: '正在连接',
    })
    setTimeout(() => {
      wx.hideLoading();
      this.setData({
        blueToothNav: false
      })
    }, 1000)
    var that = this;
    var device_name = event.currentTarget.dataset.name;
    var device_id = event.currentTarget.dataset.id;
    if (event.currentTarget.dataset.id != undefined) {
      console.log("当前点击的设备名称为：" + device_name);
      console.log("当前点击的设备id为：" + device_id);
      wx.createBLEConnection({
        deviceId: device_id,
        timeout: 10000,
        success: function (res) {
          wx.hideLoading();
          console.log(res);
          if (res.errCode == 0) {
            console.log('连接成功')
            wx.showToast({
              title: '连接成功',
              duration: 1000,
            })
            that.setData({
              isConnected: true,
              deviceId: device_id,
            });
            that.onGetuuid();
            wx.stopBluetoothDevicesDiscovery();
            if(device_name == "HC-08"){
              var device1 = {
                name: "台灯",
                itemStyle: {
                  color: '#D3D3D3'
                }
              }
              var device2 = {
                name: "花盆",
                itemStyle: {
                  color: '#D3D3D3'
                }
              }
              app.globalData.device.push(device1);
              app.globalData.device.push(device2);
            }else{
              var device = {
                name: device_name,
                itemStyle: {
                  color: '#D3D3D3'
                }
              }
              app.globalData.device.push(device);
            }
            console.log("全局device", app.globalData.device);
            wx.setStorageSync('bt_name', device_name);
            wx.setStorageSync('bt_id', device_id);
          } else {
            wx.showModal({
              title: '提示',
              content: '不能正常对蓝牙设备进行连接',
              showCancel: false
            })
          }
        },
        fail: (res) => {
          wx.hideLoading();
          if (res.errCode == 10012) {
            wx.showModal({
              title: '提示',
              content: '连接超时',
              showCancel: false
            })
          } else if (res.errCode == -1) {
            wx.showModal({
              title: '提示',
              content: '已经连接',
              showCancel: false,
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '连接失败',
              showCancel: false
            })
          }
          console.warn("fail", res);
        },
        complete: () => {}
      })
    }
  },
  getData: function () {
    if (!Chart) {
      this.init_echarts(); //初始化图表
    } else {
      this.setOption(Chart); //更新数据
    }
  },

  init_echarts: function () {
    var that = this;
    this.echartsComponnet.init((canvas, width, height) => {
      Chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      this.setOption(Chart);
      Chart.on('click', function (params) {
        if (params.data.name == "温度监控") {
          that.WifiOption(params, Chart);
        } else {
          that.BlueToothOption(params, Chart);
        }
        console.log(params);

      });
      return Chart;
    });
  },
  WifiOption(params, Chart) {
    console.log(params);
    if (params.data.itemStyle.color == "#808000") {
      wx.request({
        url: url + '/buzzer/0',
        type: 'get',
        success: function (msg) {
          console.log(msg);
          option.series[0].data[params.dataIndex].itemStyle.color = "#D3D3D3";
          Chart.setOption(option);
        }
      })
    } else {
      wx.request({
        url: url + '/buzzer/1',
        type: 'get',
        success: function (msg) {
          console.log(msg);
          option.series[0].data[params.dataIndex].itemStyle.color = "#808000";
          Chart.setOption(option);
        }
      })
      //params.data.itemStyle.color = "#008000"
    }
  },
  BlueToothOption(params, Chart) {
    console.log(params);
    if (params.data.itemStyle.color == "#00BFFF"){
      var value = '0';
      if(params.data.name == "花盆"){
        option.series[0].data[params.dataIndex].itemStyle.color = "#D3D3D3";
        Chart.setOption(option);
        return;
      }
      console.log("发送消息为：",value);
      this.onSendCommand(value, params, Chart);
    }
    else{
      var value = '1';
      if(params.data.name == "花盆"){
        value = '3';
      }
      console.log("发送消息为：",value);
      this.onSendCommand(value, params, Chart);
    }
    //params.data.itemStyle.color = "#008000"
  },
  setOption: function (Chart) {
    Chart.clear(); // 清除
    Chart.setOption(this.getOption()); //获取新数据
  },
  getOption: function () {
    if (!this.data.isConnected) {
      console.log("清空option");
      option.series[0].data = [];
    } else {
      console.log("填充option");
      option.series[0].data = app.globalData.device;
    }
    return option;
  },
  getScanData() {
    var that = this;
    wx.request({
      url: url + '/scan',
      type: 'get',
      success: (res) => {
        this.setData({
          isConnected: true,
          WIFI: true,
        })
        var device = {
          name: "温度监控",
          itemStyle: {
            color: '#D3D3D3'
          }
        }
        app.globalData.device.push(device);
        console.log("device为", app.globalData.device);
      },
      fail: (res) => {
        this.setData({
          WIFI: false,
        })
      }
    })
    setInterval(function () {
      wx.request({
        url: url + '/scan',
        type: 'get',
        success: function (res) {
          console.log(res)
          var array = res.data.split("&");
          for (var i = 0; i <= 5; i++) {
            app.globalData.scanData.temperature[i] = app.globalData.scanData.temperature[i + 1];
            app.globalData.scanData.humidity[i] = app.globalData.scanData.humidity[i + 1];
          }
          if (res.data.length > 5) {
            app.globalData.scanData.temperature[6] = 0;
            app.globalData.scanData.humidity[6] = 0;
          } else {
            app.globalData.scanData.temperature[6] = array[0];
            app.globalData.scanData.humidity[6] = array[1];
          }
        },
        fail: function () {
          that.setData({
            WIFI: false,
          })
          console.log("未接入网络");
        }
      })
    }, 1000 * 60)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.echartsComponnet = this.selectComponent('#mychart-dom-pie');
    console.log(option);
    this.getScanData();
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


})