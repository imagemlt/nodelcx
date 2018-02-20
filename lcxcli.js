var net=require('net');

var LOCALHOST=process.argv[2]
var LOCALPORT=parseInt(process.argv[3])
var REMOTEHOST=process.argv[4]
var REMOTEPORT=parseInt(process.argv[5])

var linksock=new net.Socket();
linksock.connect(REMOTEPORT,REMOTEHOST,()=>{
    console.log('linksock established');
})

linksock.on('data',(data)=>{
    if(data.toString().substr(0,7)!='connect'){
        linksock.end();
    }
    var linkid=data[7];
    var transfersock=new net.Socket();
    var forwardsock=new net.Socket();
    var info=Buffer(1);
    info[0]=linkid;
    transfersock.connect(REMOTEPORT,REMOTEHOST,()=>{
        console.log('begin a transfer');
        transfersock.write(Buffer('connect')+info);
    })
    forwardsock.connect(LOCALPORT,LOCALHOST,()=>{
        console.log('begin forward socket');
    })
    transfersock.on('error',(err)=>{
        console.log('error accured during transfer:'+err.message);
        forwardsock.end();
    })
    forwardsock.on('error',(err)=>{
        console.log('error accured linking to forward:'+err.message);
        transfersock.end();
    })
    transfersock.on('data',(data)=>{
        forwardsock.write(data);
    })
    forwardsock.on('data',(data)=>{
        transfersock.write(data);
    })
    transfersock.on('end',(data)=>{
        forwardsock.end();
    })
    forwardsock.on('end',(data)=>{
        transfersock.end();
    })
})

console.log('begin forward!!!')