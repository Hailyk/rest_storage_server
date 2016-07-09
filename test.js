/**
 * Created by jiahao on 7/9/2016.
 */
var express = require('express');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var app = express();

app.post('/', upload.single('avatar'), function (req, res, next) {
    console.log(req.file);
    console.log(req.body);
    res.sendStatus(200);
    next();
});

app.listen(process.env.port||80,(err)=>{
    if(err) throw err;
    console.log("server started");
});