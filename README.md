# nodelcx
nodejs编写的内网穿透工具

## 使用方法：
* 客户机
```bash
node lcxcli.js 内网地址　内网端口　跳板机地址　跳板机服务端口
```
* 跳板机
```bash
node lcxserver.js 跳板机内网地址　跳板机服务端口　跳板机外网地址　跳板机转发端口
```
