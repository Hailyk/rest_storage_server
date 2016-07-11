'use strict';

// constants
const db_url = 'mongodb://192.168.99.100',
    storage_location = "mediaStorage/",
    port = process.env.port || 80,
    db_collection = 'mediaData';

// dependency declaration
var express = require('express'),
    mongoClient = require('mongodb').MongoClient,
    multer = require('multer'),
    utils = require('./utils'),
    async = require('async'),
    fs = require('fs');

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
        if (err) {
            throw err
        } else {
            var collection = db.collection(db_collection);


            //get request
            server.get('/', (req, res)=> {
                var reference = req.query.r;
                var query = req.query.q;
                var type = req.query.t;

                if(reference != undefined){
                    if(type == "data"){
                        collection.find({reference:reference}).toArray((err,docs)=>{
                            if(err){
                                res.send({
                                    error:true,
                                    data:"failed to query reference"
                                });
                            } else {
                                res.send({
                                    err:false,
                                    data:docs[0]
                                });
                            }
                        });
                    } else {
                        collection.find({reference:reference}).toArray((err,docs)=>{
                            if(err){
                                res.send({
                                    error:true,
                                    data:"failed to query reference"
                                });
                            } else {
                                var file = docs[0].filename;
                                res.sendFile(__dirname+"/"+storage_location+file, (err)=>{
                                   if(err){
                                       console.log(err);
                                   }
                                });
                            }
                        });
                    }
                } else if (query != undefined){
                    collection.find().toArray((err,docs)=>{
                        if(err){
                            res.send({
                                error:true,
                                data:"failed to query reference"
                            });
                        } else {
                            res.send({
                                error:false,
                                data:docs
                            });
                        }
                    });
                } else {
                    res.send({
                        error: true,
                        data: "reference or query not set"
                    });
                }

            });


            // post request
            server.post('/', upload.single('media'), (req, res)=> {
                var body = JSON.parse(req.body.metainfo);
                if (req.file == {} || req.file == null) {
                    res.send({
                        error: true,
                        data: "no file found"
                    });
                } else {
                    var reference = Date.now() + utils.getRandomString(18);
                    var insertData = schemaConstructor(body, req.file, reference);

                    collection.insertOne(insertData, (err)=> {
                        if (err) {
                            res.send({
                                error: true,
                                data: "failed to insert reference to record"
                            });
                        } else {
                            res.send({
                                error: false,
                                data: reference
                            });
                        }
                    });

                }
            });

            // put request
            server.put('/', upload.single('media'), (req,res)=>{
                var reference = req.query.r;
                var query = req.query.q;

                var body = JSON.parse(req.body.metainfo);

                var filter = {};

                var c = false;

                if(reference != undefined){
                    filter = {reference:reference};
                    c = true;
                } else if(query != undefined){
                    filter = query;
                    c = true;
                } else {
                    res.send({
                        error:true,
                        data: "reference or query not set"
                    });
                }

                if(c){
                    collection.updateMany(filter, {$set: body}, (err, docs)=>{
                        if(err){
                            res.send({
                                error: true,
                                data: "error on updating docs"
                            });
                        } else {
                            res.send({
                                error: false,
                                data: docs
                            });
                        }
                    });
                }
            });

            // del request
            server.delete('/',(req,res)=>{
                var reference = req.query.r;
                var query = req.query.q;

                var filter = {};

                var c = false;

                if(reference != undefined){
                    filter = {reference:reference};
                    c = true;
                } else if(query != undefined){
                    filter = query;
                    c = true;
                } else {
                    res.send({
                        error:true,
                        data: "reference or query not set"
                    });
                }

                if(c){
                    collection.find(filter).toArray((err, docs)=>{
                        if(err){
                            res.send({
                                error:true,
                                data: "error on querying info"
                            });
                        } else {
                            var file ="";

                            try{
                                file = docs[0].filename;
                                async.parallel([
                                    function(callback){
                                        fs.unlink(__dirname+'/'+storage_location+file, (err, result)=>{
                                            callback(err, result);
                                        });
                                    },
                                    function(callback){
                                        collection.deleteMany(filter,(err, docs)=>{
                                            callback(err, docs);
                                        });
                                    }
                                ],(err,result)=>{
                                    if(err){
                                        res.send({
                                            error:true,
                                            data: err
                                        });
                                    } else {
                                        res.send({
                                            error:false,
                                            data: result[1]
                                        });
                                    }
                                });
                            } catch(err){
                                res.send({
                                    error:true,
                                    data:"file location not found"
                                });
                            }
                        }
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

function schemaConstructor(body,file, reference){
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