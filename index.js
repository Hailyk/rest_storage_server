'use strict';

// constants
const db_url = 'mongodb://192.168.99.100',
    storage_location = "mediaStorage/",
    port = process.env.port || 80;

// dependency declaration
var express = require('express'),
    mongoClient = require('mongodb').MongoClient,
    multer = require('multer'),
    utils = require('./utils');

// instance variable
var server = express(),
    upload = multer({storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, storage_location)
        },
        filename: function (req, file, cb) {
            cb(null, Date.now()+utils.getRandomString(6)+utils.getExtension(file.originalname))
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
        var type = req.query.type;
        if(type == "file")
            postFileHandler(req,res);
        else if(type == "data" ){
            postDataHandler(req, res);
        }
        else{
            res.send({
                error: true,
                response: "request type not specified"
            });
        }
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

    if(request.query != {}) {

        var ref = request.query.r;
        var query = request.query.q;
        if(ref != null || query != null) {

            var filter = {};

            if(ref !=null) {
                filter = {
                    reference: ref
                };
            } else {
                filter = query;
            }

            mongoClient.connect(db_url, (err, db)=> {
                db.collection('metadata').find(filter).toArray((err, res)=> {
                    if(err){
                        response.send({
                            error: true,
                            message: "Error on lookup"
                        });
                    } else {
                        var meta = request.query.m;
                        if(meta == null){
                            meta = true;
                        }
                        if(!meta){
                            response.sendfile(storage_location + res[0].filename, (err)=>{
                                if(err){
                                    response.send({
                                        error:true,
                                        response: "failed to send file"
                                    });
                                }
                            });
                        } else {
                            response.send({
                                error: false,
                                response: res
                            });
                        }
                    }
                });
            });
            
        } else {
            response.send({
                error: true,
                response: "no query(q) object"
            });
        }
    } else {
        response.send("you are connected, now give me a reference");
    }
}

// @arg request, object
// @arg response, object
function postFileHandler(request, response){
    var reference = request.query.r;
    
    if(reference == undefined){
        reference = utils.getRandomString(5)+Date.now()+utils.getRandomString(8);
        mongoClient.connect(db_url, (err, db)=>{
            if(err){
                response.send({
                    error:true,
                    response:"failed on db connect(stale file)"
                });
            } else {
                db.collection("metadata").insertOne({
                    reference:reference,
                    filename: request.file.filename,
                    author:null,
                    time:{
                        timestamp:null,
                        year:null,
                        month:null,
                        date:null,
                        day:null,
                        hour:null,
                        minute:null,
                        second:null,
                        offset:null
                    },
                    size:request.file.size,
                    tags:null,
                    description: null
                },(err, data)=>{
                    if(err){
                        response.send({
                            error:true,
                            response: "error entering data(stale file)"
                        });
                    } else {
                        response.send({
                            error:false,
                            response:reference
                        });
                    }
                });
            }
        });
    } else {
        mongoClient.connect(db_url,(err,db)=>{
            if(err){
                response.send({
                    error:true,
                    response:"failed on db connect(stale file)"
                });
            } else {
                db.collection("metadata").updateMany({reference:reference},{
                    $set:{
                        filename:request.file.filename,
                        size:request.file.size
                    }
                },(err,data)=>{
                    if(err){
                        response.send({
                            error:true,
                            response: "failed to merge file with data(stale file)"
                        });
                    } else {
                        response.send({
                            error:false,
                            response: "success"
                        })
                    }
                });
            }
            
        });
        
    }
}

function postDataHandler(request, response){
    var reference = request.query.r;
    
    if(reference == undefined){
        reference = utils.getRandomString(5)+Date.now()+utils.getRandomString(8);
        
        var data = JSON.parse(request.body);
        
        var time = new Date();
        
        var author = data.author || null;
        var tags = data.tags || [];
        var description = data.description || null;
        var timestamp = data.time.timestamp || time.getTime();
        var year = data.time.year || time.getFullYear();
        var month = data.time.month || time.getMonth();
        var date = data.time.date || time.getDate();
        var day = data.time.day || time.getDay();
        var hour = data.time.hour || time.getHours();
        var minute = data.time.minute || time.getMinutes();
        var second =  data.time.second || time.getSeconds();
        var offset = data.time.offset || time.getTimezoneOffset();
        
        var constructedJson = {
            reference: reference,
            filename: null,
            author: author,
            time:{
                timestamp: timestamp,
                year: year,
                month: month,
                date: date,
                day: day,
                hour: hour,
                minute: minute,
                second: second,
                offset: offset
            },
            size: null,
            tags:tags,
            description: description
        };
        
        mongoClient.connect(db_url,(err, db)=>{
            if(err){
                response.send({
                    error:true,
                    response: "failed to connect to db"
                });
            } else {
                db.collection("metadata").insertOne(constructedJson, (err, data)=>{
                    if(err){
                        response.send({
                            error:true,
                            response:"error on inserting data"
                        });
                    } else {
                        response.send({
                            error:false,
                            response:reference
                        });
                    }
                });
            }
        });
        
    } else {
    
        var data = JSON.parse(request.body);
    
        var time = new Date();
    
        var author = data.author || null;
        var tags = data.tags || [];
        var description = data.description || null;
        var timestamp = data.time.timestamp || time.getTime();
        var year = data.time.year || time.getFullYear();
        var month = data.time.month || time.getMonth();
        var date = data.time.date || time.getDate();
        var day = data.time.day || time.getDay();
        var hour = data.time.hour || time.getHours();
        var minute = data.time.minute || time.getMinutes();
        var second =  data.time.second || time.getSeconds();
        var offset = data.time.offset || time.getTimezoneOffset();
        
        mongoClient.connect(db_url, (err, db)=>{
            if(err){
                response.send({
                    error:true,
                    response:"unable to connect to db"
                })
            } else {
                
                var timeJson = {
                    timestamp:timestamp,
                    year:year,
                    month:month,
                    date:date,
                    day:day,
                    hour:hour,
                    minute:minute,
                    second:second,
                    offset:offset
                };
                
                db.collection("metadata").updateMany({reference:reference},{
                    $set:{
                        author:author,
                        tags:tags,
                        description:description,
                        time: timeJson
                    }
                }, (err,data)=>{
                    if(err){
                        response.send({
                            error:true,
                            response:"error updating data"
                        });
                    } else {
                        response.send({
                            error:false,
                            response:"success"
                        });
                    }
                });
            }
        });
        
    }
}

// @arg request, object
// @arg response, object
function putHandler(request, response){
    //---- development
    console.log(request.file);
    console.log(request.body);

    mongoClient.connect(db_url,(err, db)=>{
        db.collection('metadata').updateMany(filter,{$set:data},(err, res)=>{
            
        });
    });

    response.send("hello world");
}

// @arg request, object
// @arg response, object
function delHandler(request, response){

    mongoClient.connect(db_url,(err, db)=>{
        db.collection('metadata').deleteMany(filter, (err, res)=>{
            
        });
    });

}
