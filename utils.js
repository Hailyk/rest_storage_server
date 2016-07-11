'use strict';
// @arg fileName, String
// @return String extension
exports.getExtension = function(fileName){
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(fileName)[1];
    if(ext == undefined) return "";
    else return "."+ext;
};

// @arg length, int
// @return, string
exports.getRandomString = function(length){
    var directory = ["0","1","2","3","4","5","6","7","8","9",
        "a","b","c","d","e","f","g","h","i","j","k","l","m","n",
        "o","p","q","r","s","t","u","v","w","x","y","z","A","B",
        "C","D","E","G","H","I","J","K","L","M","N","O","P","Q",
        "R","S","T","U","V","W","X","Y","Z"];

    var randomString = "";

    for(var i=0;i<length;i++){
        var n = Math.floor(Math.random() * (directory.length));
        randomString+=directory[n];
    }

    return randomString;
};
