var net = require('net');

var LOCALHOST = process.argv[2]
var LOCALPORT = parseInt(process.argv[3])
var REMOTEHOST = process.argv[4]
var REMOTEPORT = parseInt(process.argv[5])


var linksock = null;
var sockpairs = [];


var remotehost = net.createServer(function (sock) {
    if (linksock == null) return sock.end();
    for (var key = 0; key < sockpairs.length; key++) {
        if (sockpairs[key].left == null) {
            sockpairs[key].left = sock;
            break;
        }
    }
    if (key == sockpairs.length) {
        sockpairs.push({ left: sock, right: null });
    }
    var data = Buffer(1);
    data[0] = key;
    linksock.write(Buffer('connect') + data);
    sock.on('end', function () {
        for (var key in sockpairs) {
            if (sockpairs[key].left == sock) {
                if (sockpairs[key].right != null)
                    sockpairs[key].right.end();
                sockpairs[key].right = null;
                sockpairs[key].left = null;
                break;
            }
        }
    })
})

var linkhost = net.createServer(function (sock) {
    console.log('send link request');
    if (linksock == null) {
        linksock = sock;
    }
    else {
        sock.on('error', function (err) {
            console.log('error accured during a transfer:' + err.message);
            for (var key in sockpairs) {
                if (sockpairs[key].right == sock) {
                    if (sockpairs[key].left != null)
                        sockpairs[key].left.end();
                    sockpairs[key].left = null;
                    sockpairs[key].right = null;
                    break;
                }
            }
        })
        sock.on('end', function (data) {
            for (var key in sockpairs) {
                if (sockpairs[key].right == sock) {
                    if (sockpairs[key].left != null)
                        sockpairs[key].left.end();
                    sockpairs[key].left = null;
                    sockpairs[key].right = null;
                    break;
                }
            }
        })
        sock.established = false;
        sock.on('data', function (data) {
            if (!sock.established) {
                if (data.toString().substr(0, 7) == 'connect') {
                    var key = data[7];
                    if (sockpairs[key] && sockpairs[key].left!=null && sockpairs[key].right!=null) {
                        sock.established=true;
                        sockpairs[key].right = sock;
                        sockpairs[key].left.on('data', function (data) {
                            sock.write(data);
                        })
                        sockpairs[key].left.on('end', function () {
                            sock.end();
                        })
                        sockpairs[key].left.on('error', function (err) {
                            console.log('error accured:' + err.message);
                            sock.end();
                        })
                    }
                    else {
                        sock.end();
                    }
                }
                else {
                    sock.end();
                }
            }
            else {
                for (var key in sockpairs) {
                    if (sockpairs[key].right == sock) {
                        sockpairs[key].left.write(data);
                        break;
                    }
                }
            }
        })

    }
})

remotehost.listen(REMOTEPORT, REMOTEHOST);
linkhost.listen(LOCALPORT, LOCALHOST);
console.log('forward started on ' + LOCALHOST + ':' + LOCALPORT + ' to ' + REMOTEHOST + ':' + REMOTEPORT)


