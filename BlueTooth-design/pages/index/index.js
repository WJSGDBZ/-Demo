import * as echarts from '../ec-canvas/echarts';
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

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  // setInterval(function () {
  //   if(app.globalData.isreflash){
  //   option.series[0].data = app.globalData.device;
  //   chart.setOption(option, true);
  //   }
  // }, 2000)
  chart.setOption(option, true);
  return chart;
}
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
    if(this.data.command == "1234"){
      this.setData({
        quick:true
      })
      this.onConnect();
      if(this.data.device.length > 0){
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
    setTimeout(() => {
      wx.hideLoading();
      if(this.data.command == "1234" && this.data.isConnected){
        return;
      }
      wx.showModal({
        title: 'sorry',
        content: '未识别校验码或暂无设备连接',
        confirmText: "朕再试试",
      })
      return;
    }, 10000)
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
            }
            if(devices.length > 0){
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
  onSendCommandByText(value){
    let that = this;
    var buffer = new ArrayBuffer(value.length);
    let dataView = new DataView(buffer);
    for(var i = 0; i < value.length; i++){
      dataView.setUint8(i, value[i]);
    }
    console.log("发送的数据为：", buffer);
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.characteristicId,
      value: buffer,
      success: function (res) {
        console.log("发送指令成功", value);
      },
      fail: function (res) {
        console.warn("发送指令失败", res)
      }
    })
  },
  onSendCommand(value, params, Chart) {
    let that = this;
    console.log("params:", params);
    var buffer = new ArrayBuffer(value.length);
    let dataView = new DataView(buffer);
    for(var i = 0; i < value.length; i++){
      dataView.setUint8(i, value[i]);
    }
    console.log("发送的数据为：", buffer);
    if (params.dataIndex < app.globalData.device.length) {
      var device =  app.globalData.device[params.dataIndex];
      console.log("发送数据给： ", device)
      wx.writeBLECharacteristicValue({
        deviceId: device.deviceId,
        serviceId: device.serviceId,
        characteristicId: device.characteristicId,
        value: buffer,
        success: function (res) {
          var color = option.series[0].data[params.dataIndex].itemStyle.color;
          if (color == '#D3D3D3')
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
  //获取service和uuid
  onGetuuid() {
    let that = this;
    if (that.data.isConnected) {
      // wx.showLoading({
      //   title: '获取serviceId',
      // })
      console.log("开始获取设备信息");
      wx.getBLEDeviceServices({
        deviceId: that.data.deviceId,
        success(getServicesRes) {
          console.log("getServicesRes", getServicesRes);
          let service = getServicesRes.services[2] //找一个能读能写的service
          let serviceId = service.uuid
          // wx.showLoading({
          //   title: '获取characteristicId',
          // })
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
                  that.onSendCommandByText("0"); // 向蓝牙请求数据 format : deviceNum%name1&name2...
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
              //wx.hideLoading();
            }
          })
          wx.onBLECharacteristicValueChange(function (onNotityChangeRes) {
            console.log('监听到特征值更新', onNotityChangeRes);
            var msg = that.buf2string(onNotityChangeRes.value);
            console.log("蓝牙消息为：",msg);
            if(msg.length == 0){
              return;
            }
            if(msg.indexOf("%") != -1){
              var arrayNum = msg.split("%");
              var num = 0;
              for(var i = 0; i < arrayNum[0].length; i++){
                num = num* 10 + (arrayNum[0][i] - '0');
              }
              console.log("连接设备数量为：", num);
              var arrayType = arrayNum[1].split("&");
              console.log("类型为：", arrayType);
              if(arrayType.length != num) { 
                wx.showModal({
                  title: '协议格式错误',
                  content: msg,
                  showCancel: false
                })
                return;
              }
              for(var i = 0; i < num; i++){
                var type = arrayType[i].split("/");
                var color = type[1] == "00" ? "#D3D3D3" : "#00BFFF"; 
                var device = {
                  deviceId: that.data.deviceId,
                  serviceId: that.data.serviceId,
                  characteristicId: that.data.characteristicId,
                  name: type[0],
                  itemStyle: {
                    color: color
                  }
                }
                app.globalData.device.push(device);
              }
              
              console.log("device: ", app.globalData.device);
              that.getData();
            }else {
              wx.showModal({
                  title: '蓝牙消息',
                  content: msg,
                  showCancel: false
              })
            }
            // if(text.length<6 && text.length>1 && text < 50){
            //   wx.showModal({
            //     title: '蓝牙消息',
            //     content: "湿度:"+text+"% 主人，该浇水啦",
            //     showCancel: false
            //   })
            // }else if(text.length<6 && text.length>1 && text > 50){
            //   wx.showModal({
            //     title: '蓝牙消息',
            //     content: "湿度:"+text+"% 水分充足",
            //     showCancel: false
            //   })
            // }
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
      app.globalData.device.splice(0, app.globalData.device.length + 1);
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
  //开始连接选中的设备
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
              deviceName: device_name,
            });
            that.onGetuuid();
            wx.stopBluetoothDevicesDiscovery();
            // if(device_name == "HC-08"){
            //   var device1 = {
            //     name: "台灯",
            //     itemStyle: {
            //       color: '#D3D3D3'
            //     }
            //   }
            //   var device2 = {
            //     name: "花盆",
            //     itemStyle: {
            //       color: '#D3D3D3'
            //     }
            //   }
            //   app.globalData.device.push(device1);
            //   app.globalData.device.push(device2);
            // }else{
            // }
            //console.log("全局device", app.globalData.device);
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
        complete: () => {
          wx.hideLoading();
        }
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
        that.BlueToothOption(params, Chart);
        console.log(params);
      });
      return Chart;
    });
  },
  BlueToothOption(params, Chart) {
    console.log(params);
    var value = '';
    switch(params.data.name){
      case "door":
        if (params.data.itemStyle.color == "#00BFFF") value = '2';
        else value = '1'; break;
      case "light":
        if (params.data.itemStyle.color == "#00BFFF") value = '4';
        else value = '3'; break;
    }
    this.onSendCommand(value, params, Chart);
    console.log("发送消息为：",value);
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.echartsComponnet = this.selectComponent('#mychart-dom-pie');
    console.log(option);
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