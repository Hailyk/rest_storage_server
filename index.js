'use strict';

// constants
const db_url = 'mongodb://192.168.99.100',
    storage_location = "mediaStorage/",
    port = process.env.port || 80,
    db_collection = 'metaData';

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
            cb(null, Date.now()+utils.getRandomString(9)+utils.getExtension(file.originalname))
        }
    })});

run();

function run(){
    
    mongoClient.connect(db_url, (err, db)=> {
        if(err){
            throw err
        } else {
            var collection = db.collection(db_collection);
            //get request
            server.get('/', (req, res, next)=> {

            });
    
            // post request
            server.post('/', upload.single('media'), (req, res)=> {
                console.log(req.file);
                var body = JSON.parse(req.body.metainfo);
                if(req.file != {} || req.file != undefined || req.file != null) {

                    var insertData = schemaConstructor(body,req.file, 18);

                    collection.insertOne(insertData,(err, result)=>{
                        if(err){
                            res.send({
                                error:true,
                                data:"failed to insert reference to record"
                            });
                        } else {
                            res.send({
                                error:false,
                                data:result
                            });
                        }
                    });

                } else {
                    res.send({
                        error: true,
                        data: "no file found"
                    });
                }
            });
        }
    });
    server.listen(port, (err)=>{
        if(err) throw err;
        console.log("server listening on port: "+port);
    });
}

function schemaConstructor(body,file, randomStringLength){
    var reference = Date.now() + utils.getRandomString(randomStringLength);
    var time = new Date();
    return {
        reference: reference,
        filename: file.filename,
        author: body.author || null,
        time: {
            timestamp: body.time.timestamp || time.getTime(),
            year: body.time.year || time.getFullYear(),
            month: body.time.month || time.getMonth(),
            date: body.time.date || time.getDate(),
            day: body.time.day || time.getDay(),
            hour: body.time.hour || time.getHours(),
            minute: body.time.minute || time.getMinutes(),
            second: body.time.second || time.getSeconds(),
            offset: body.time.offset || time.getTimezoneOffset()
        },
        size: file.size,
        tags: body.tags || [],
        description: body.description || null
    }
}