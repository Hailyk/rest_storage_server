'use strict';

let os = require('os');

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

// get generate uuid
exports.uuid = function() {
    let random = Math.random().toString('2').slice(2,21);
    let time = Date.now().toString('2');

    let mac = getMac();
    time += random;
    time = parseInt(time, 2).toString('16');
    
    let uuid = time.slice(0,13);
    uuid += "6";
    uuid += time.slice(13, 16);
    uuid += "7";
    uuid += Math.random().toString('16').slice(2,5);
    uuid += getMac();
    return uuid;
};

// return mac address of ethernet, wifi if not available
function getMac(){
    let ni = os.networkInterfaces();
    let mac = "";
    if(ni.Ethernet != null){
        mac = ni.Ethernet[0].mac;
    }
    else if(ni.eth0 !== null){
        mac = ni.eth0[0].mac;
    }
    else if(ni['Wi-Fi'] != null){
        mac = ni['Wi-Fi'];
        mac = mac[0].mac;
    }
    else{
        mac = "00:00:00:00:00";
    }
    return mac.replace(/([:])/g, '');
}