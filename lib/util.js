'use strict';

let network = require('os');

// get time in a yyyymmddhhmmssmm
exports.timestamp = function(){
    let timenow = new Date();

    let year = timenow.getFullYear();
    let month = timenow.getMonth() + 1;
    let day = timenow.getDate() + 1;
    let hour = timenow.getHours();
    let minute = timenow.getMinutes();
    let second = timenow.getSeconds();

    let time = year.toString();
    time += month.toString();
    time += day.toString();
    time += hour.toString();
    time += minute.toString();
    time += second.toString();

  return time;
};

exports.uuid = function() {
    getMac();
};

// return mac address of ethernet, wifi if not available
function getMac(){
    let ni = network.networkInterfaces();
    let mac = "";
    if(ni.Ethernet != null){
        mac = ni.Ethernet.mac;
    }
    else if(ni.Wi-Fi != null){
        mac = ni.Wi-Fi.mac;
    }
    return mac.replace(/([:])/g, '');
}