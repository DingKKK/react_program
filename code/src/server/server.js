const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const { exec } = require('child_process');
const { notification } = require('antd');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { StaticRouter } = require('react-router-dom/server');
const App = require('../App').default;

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.static('./build'));

app.get('/*', (req, res) => {
  fs.readFile('./build/index.html', 'utf-8', (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Some error happened');
    }

    const context = {};
    const appHtml = ReactDOMServer.renderToString(
      <StaticRouter location={req.url} context={context}>
        <App />
      </StaticRouter>
    );

    if (context.url) {
      res.redirect(context.url);
    } else {
      return res.send(
        data.replace(
          '<div id="root"></div>',
          `<div id="root">${appHtml}</div>`
        )
      );
    }
  });
});
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
  res.send('WebSocket Server is running.');
});

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => {
    // 接收到消息后执行命令
    const parsedMessage = JSON.parse(message);
    console.log('Parsed message:', parsedMessage);
    if (parsedMessage.type === 'sortData') {
      // TODO: the command to get sorted data
      /*const command = '?';
      exec(command, (error, stdout, stderr) => {
        if (error) {
          ws.send(JSON.stringify({
            type:notification,
            content: error.message}));
        } else {
          ws.send(JSON.stringify({
            type: 'notification',
            content: stdout}));
            // TODO: get sorted data path
            fs.readFile('?', 'utf8', (err, jsonString) => {
            if (err) {
              console.log("File read failed:", err);
              return;
            }
            try {
              const data = JSON.parse(jsonString);
              ws.send(JSON.stringify({
                type: 'sortedData',
                content: jsonString
              }));
              // 解析后的数据
              console.log(data);
            } catch(err) {
              console.log('Error parsing JSON:', err);
            }
          });


        }
      });*/
    }
    if (parsedMessage.type === 'patchGeneration') {
      const fileContent = JSON.stringify(parsedMessage.content);
      const filePath = './intermediate_result/bug.json';
      const bugType = parsedMessage.bugLabel;
      fs.writeFile(filePath, fileContent, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
          ws.send(JSON.stringify({
            type: 'notification',
            content: `写入文件时出错: ${err.message}` }));
        } else {
          console.log('File written successfully');
          ws.send(JSON.stringify({
            type: 'notification',
            content: '文件写入成功' }));
        }
      });
      // TODO: 补丁修复指令
      /*const command = '?';
      exec(command, (error, stdout, stderr) => {
        if (error) {
          ws.send(JSON.stringify({
            type:notification,
            content: error.message}));
        } else {
          // TODO: 发送type为download的消息给前端,读取补丁修复文件的内容传给前端供用户下载
          fs.readFile('?', 'utf8', (err, fileContent) => {
            if (err) {
              console.log("File read failed:", err);
              return;
            }
            try {
              ws.send(JSON.stringify({
              type: 'download',
              content: fileContent }));
              // 解析后的数据
              console.log(data);
            } catch(err) {
              console.log('Error parsing JSON:', err);
            }
          

        }
      });*/
      
    }
    if (parsedMessage.type == 'bugDetection') {
      const fileContent = parsedMessage.content;
      const filePath = './intermediate_result/example.c';
      fs.writeFile(filePath, fileContent, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
          ws.send(JSON.stringify({
            type: 'notification',
            content: `写入文件时出错: ${err.message}` }));
        } else {
          console.log('File written successfully');
          ws.send(JSON.stringify({
            type: 'notification',
            content: '文件写入成功' }));
        }
      });
      const command = '../infer-linux64-v1.1.0/bin/infer run --pulse -- clang -c ' + filePath;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          ws.send(JSON.stringify({
            type:notification,
            content: error.message}));
        } else {
          ws.send(JSON.stringify({
            type: 'notification',
            content: stdout}));
          // 读取JSON文件
          fs.readFile('./infer-out/report.json', 'utf8', (err, jsonString) => {
            if (err) {
              console.log("File read failed:", err);
              return;
            }
            try {
              const data = JSON.parse(jsonString);
              ws.send(JSON.stringify({
                type: 'bugData',
                content: jsonString
              }));
              // 解析后的数据
              console.log(data);
            } catch(err) {
              console.log('Error parsing JSON:', err);
            }
          });

        }
      });
    }
    
    

  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log('WebSocket Server is listening on port 3000.');
});
