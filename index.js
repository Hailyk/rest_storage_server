'use strict';

// constants
const db_url = 'mongodb://192.168.99.100',
    storage_location = "mediaStorage/",
    port = process.env.port || 80;

// dependency declaration
var express = require('express'),
    mongoClient = require('mongodb').MongoClient,
    multer = require('multer'),
    bodyParser = require('body-parser'),
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

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

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

    if(request.query != {}) {

        var ref = request.query.r;
        if(ref != null) {
            
            mongoClient.connect(db_url, (err, db)=> {
                db.collection('metadata').find(filter).toArray((err, res)=> {
            
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
function postHandler(request, response){
    //---- development
    console.log(request.file);
    console.log(request.body);

    var time = new Date();

    var body = request.json(request.body);

    var reference = utils.getRandomString(5)+ time.getTime()+utils.getRandomString(17);

    var data = {
        time:{
            timestamp: body.time.timestamp || time.getTime(),
            year: body.time.year || time.getFullYear(),
            month: body.time.month || time.getMonth(),
            date: body.time.date || time.getDate(),
            weekDay: body.time.weekDay || time.getDay(),
            hour: body.time.hour || time.getHours(),
            minute: body.time.minute || time.getMinutes(),
            second: body.time.second || time.getSeconds(),
            millisecond: body.time.millisecond || time.getMilliseconds(),
            offset: body.time.offset || time.getTimezoneOffset()
        },
        author: body.author || null,
        tags: body.tag || [],
        size: request.file.size || null,
        fileType: request.file.mimetype || null,
        fileName: request.file.filename || null,
        reference: reference,

    };

    try {
        mongoClient.connect(db_url, (err, db)=> {
            db.collection('metadata').insertOne(data, (err, res)=> {
                if (err) {
                    response.send({
                        error: true,
                        response: "Error creating entries in to database(lost resource)"
                    });
                } else {
                    response.send({
                        error: false,
                        response: res
                    });
                }
                    
            });
        });
    } catch (err) {
        response.send(err);
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
