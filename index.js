'use strict';

// constants
const db_url = 'mongo://192.168.99.100',
    storage_location = "mediaStorage/",
    port = process.env.port || 80;

// dependency declaration
var express = require('express'),
    mongo = require('mongodb').MongoClient(),
    multer = require('multer');

// instance variable
var server = express(),
    upload = multer({dest: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, storage_location)
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + "-"+ getRandomString(5) + getExtension(file.fieldname))
        }
    })});

run();

function run(){

    //get request
    server.get('/',(req, res, next)=>{
        getHandler(req, res);
        next();
    });

    // post request
    server.post('/', upload.single('media'), (req, res, next)=>{
        postHandler(req,res);
        next();
    });

    // put request
    server.put('/', upload.single('media'), (req, res, next)=>{
        putHandler(req,res);
        next();
    });

    // delete request
    server.delete('/',(req, res, next)=>{
        delHandler(req,res);
        next();
    });

    server.listen(port, (err)=>{
        if(err) throw err;
        console.log("server listening on port: "+port);
    });
}

// @arg request, object
// @arg response, object
function getHandler(request, response){

    mongo.connect(db_url,(err, db)=>{
        db.collection('metadata').find(filter).toArray((err,res)=>{
            
        });
    });

}

// @arg request, object
// @arg response, object
function postHandler(request, response){
    //---- development
    console.log(request.file);
    console.log(request.body);

    mongo.connect(db_url,(err, db)=>{
        db.collection('metadata').insertOne( data ,(err,res)=>{
            if (err) console.log(err);


        });
    });
    
    response.send("hello world");
}

// @arg request, object
// @arg response, object
function putHandler(request, response){
    //---- development
    console.log(request.file);
    console.log(request.body);

    mongo.connect(db_url,(err, db)=>{
        db.collection('metadata').updateMany(filter,{$set:data},(err, res)=>{
            
        });
    });

    response.send("hello world");
}

// @arg request, object
// @arg response, object
function delHandler(request, response){

    mongo.connect(db_url,(err, db)=>{
        db.collection('metadata').deleteMany(filter, (err, res)=>{
            
        });
    });

}

// @arg fileName, String
// @return String extension
function getExtension(fileName){
    fileName.split(".");
    return "."+fileName[fileName.length--];
}

// @arg length, int
// @return, string
function getRandomString(length){
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
}