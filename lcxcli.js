var net=require('net');

var LOCALHOST=process.argv[2]
var LOCALPORT=parseInt(process.argv[3])
var REMOTEHOST=process.argv[4]
var REMOTEPORT=parseInt(process.argv[5])

var linksock=new net.Socket();
linksock.on('error',function(err){
	console.error('[-]error accured:'+err.message);
})
linksock.connect(REMOTEPORT,REMOTEHOST,function(){
    console.log('[+]linksock established');
})

linksock.on('data',function(data){
    if(data.toString().substr(0,7)!='connect'){
        linksock.end();
    }
    var linkid=data[7];
    var transfersock=new net.Socket();
    var forwardsock=new net.Socket();
    var info=Buffer(1);
    info[0]=linkid;
    transfersock.connect(REMOTEPORT,REMOTEHOST,function(){
        console.log('[+]begin a transfer');
        transfersock.write(Buffer('connect')+info);
        console.log('transfer data sended')
        forwardsock.connect(LOCALPORT,LOCALHOST,function(){
            console.log('[+]begin forward socket');
        })
    })
    transfersock.on('error',function(err){
        console.error('[-]error accured during transfer:'+err.message);
        forwardsock.end();
    })
    forwardsock.on('error',function(err){
        console.error('[-]error accured linking to forward:'+err.message);
        transfersock.end();
    })
    transfersock.on('data',function(data){
        forwardsock.write(data);
    })
    forwardsock.on('data',function(data){
        transfersock.write(data)
    })
    transfersock.on('end',function(data){
        console.log('[-]remote client ended transfer')
        forwardsock.end();
    })
    forwardsock.on('end',function(data){
        console.log('[-]local server ended transfer')
        transfersock.end();
    })
})

console.log('[+]begin forward!!!')
