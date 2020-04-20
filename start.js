"use strict";

let fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path");

let root = path.resolve("game");
let server = http.createServer(
    function(request,respone){

        let relPath = url.parse(request.url).pathname;

        let filePath = path.join(root,relPath);

        console.log(filePath);
        
        fs.stat(
            filePath
            ,function(err,data){

                if(err)
                {

                    console.log("404");

                    respone.writeHead(404,{"Content-Type":"text/html;charset=utf-8"});

                    respone.end("找不到文件");

                }else if(data.isFile()){

                    console.log("200");

                    respone.writeHead(200);

                    fs.createReadStream(filePath).pipe(respone);
                }else{

                    filePath = path.join(filePath,"index.html");

                    console.log(filePath);

                    fs.stat(
                        filePath
                        ,function(err,data){

                            if(!err){

                                console.log("200");
            
                                respone.writeHead(200);
            
                                fs.createReadStream(filePath).pipe(respone);
                            }else{
                                console.log("404");

                                respone.writeHead(404,{"Content-Type":"text/html;charset=utf-8"});

                                respone.end("找不到文件");
                            }
                        }
                    );

                }
            }
        );
    }
);

server.listen(8989);

console.log("服务已在本地端口8989启动！");