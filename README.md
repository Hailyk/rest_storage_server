# File_Stroage_Rest_Server

Rest server built on Express and MongoDB for storing and retrieving files.

**MIT License**

## Requirement

* MongoDB Instance(use for storing metadata)

## Overview

* Files uploaded are stored on the machine running this middleware and metadata is stored on MongoDB.
* Every file is referenced by a uuid string
* server use multipart/form-data

## Get Request / Retrieving file and metadata
 
### URL Query
 |query|name|comment/definition|
 | --- | --- | --- |
 |r|reference|the uuid returned when posting|
 |t(optional)|type|if it is =="data", request will return the file metadata in json|
 |q(optional)|query|A query object to be use to query metadata, this only returns metadata, if query is defiend remove reference|
 
#### Example:
`http:localhost:/?r=77d74bf9-9e86-4ff6-b425-4c6bd6e796a3&t=data`

`http:localhost:/?q={name:"jiahaok"}`
 
### Returned Example
 metaData returned when type == data
```
 {
    "reference": "77d74bf9-9e86-4ff6-b425-4c6bd6e796a3",
    "filename": "cwjibjiwidv.png",
    "author": "jiahaok",
    "time":{
        "timestamp": 214234232,
        "year": 4232,
        "month": 9,
        "date": 31,
        "day": 0,
        "hour": 23,
        "minute": 42,
        "second": 22,
        "offset": -8
    },
    "size": 323424,
    "tags":["testing", "test", "debugging"],
    "description": "testing"
}
```
 
## Post Request / uploading file and metadata

### URL Query
|query|name|comment/definition|
| --- | --- | --- |
|r(optional)|reference|reference to use for this upload|

### Body
**name: metainfo** 

use multipart/form-data to send data

#### File
**name: media** 
File will be sent with the request as it is using multipart/form-data

####Metadata
```
{
    "author": "jiahaok",
    "time":{ //time and everything child of time is optional, if not defined it will be replaced with current server time
        "timestamp": 214234232,
        "year": 4232,
        "month": 9,
        "date": 31,
        "day": 0,
        "hour": 23,
        "minute": 42,
        "second": 22,
        "offset": -8
    },
    "tags":["testing", "test", "debugging"], // you can put as many tag as you want
    "description": "testing"
}
```

### Returned Example
```
{
2	"error": false, // if somethign whent wrong this will be true and data will be a error message
3	"data": "ff17435a-9041-460c-8086-0cf3d57b3638"
4}
```

## put Request / updating metadata
put request can only update the metadata of the file to update the image simplely save the reference uuid, submit a delete request and post with the uuid as r in url.

### URL Query
|query|name|comment/definition|
| --- | --- | --- |
|r|reference|reference to use for this update|
|q(optional)|query|a query used to look for the data, if query is defiend remove reference|

#### Example:
`http:localhost:/?r=77d74bf9-9e86-4ff6-b425-4c6bd6e796a3`

`http:localhost:/?q={name:"jiahaok"}`

### Body
use multipart/form-data
**name = metainfo** 
```
{
    "author":"jiahaok" // change author to "jiahaok"
}
```

### Returned
```
{
2	"error": false,
3	"data":{
    4	"ok": 1,
    5	"nModified": 1,
    6	"n": 1
7	}
8}
```
## delete Request / Delete file and metadata

### URL Query
|query|name|comment/definition|
| --- | --- | --- |
|r|reference|reference to use for this update|
|q(optional)|query|a query used to look for the data, if query is defiend remove reference|

#### Example:
`http:localhost:/?r=77d74bf9-9e86-4ff6-b425-4c6bd6e796a3`

`http:localhost:/?q={name:"jiahaok"}`

### Returned
```
1{
2	"error": false,
3	"data":{
    4	"ok": 1,
    5	"n": 1
6	}
7}

```
## License
The MIT License (MIT) Copyright (c) 2016 @JiahaoK(Jiahao Kuang)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
