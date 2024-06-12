// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import { Layout , message } from 'antd';
import FileUploader from './FileUploader';
import FileTree from './FileTree';
import FileEditorWithBugTable from './FileEditorWithBugTable';
const { Sider, Content } = Layout;

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [bugData, setBugData] = useState([]);
  const [sortedData, setSortedData] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = new WebSocket('ws://localhost:3000');
    socket.current.onopen = () => setMessages((prev) => [...prev, 'Connected to server']);
    socket.current.onmessage = (event) => {
      try {
        let data = JSON.parse(event.data);
        if(data.type === 'bugData'){
          data = JSON.parse(data.content);
          setBugData(data); // save all bug data
          let index = 0;
          const newDataList = data.map(item => {
            index += 1;
            return {
              key: index,
              id: index,
              severity: item.severity,
              type: item.bug_type,
              qualifier: item.qualifier,
              location: 'ln '+item.line+', cl '+item.column
            };
          });
          setTableData(newDataList);
        } else if(data.type === 'download') {
          const fileName = window.prompt('Enter file name:', 'download.txt'); // 弹出对话框获取文件名
          if (fileName) { // 如果用户输入了文件名
            const data = "Hello, world!";
            const blob = new Blob([data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }
        } else if(data.type === 'sortedData') {
          data = JSON.parse(data.content);
          let index = 0;
          const newDataList = data.map(item => {
            index += 1;
            return {
              key: index,
              id: index,
              severity: item.severity,
              type: item.bug_type,
              qualifier: item.qualifier,
              location: 'ln '+item.line+', cl '+item.column
            };
          });
          setSortedData(newDataList);
        }
        setMessages((prev) => [...prev, data.message]);
      } catch (error) {
        console.error('Error parsing message', error);
        setMessages((prev) => [...prev, 'Error parsing message']);
      }
    };
    socket.current.onclose = () => setMessages((prev) => [...prev, 'Disconnected from server']);
    socket.current.onerror = (error) => setMessages((prev) => [...prev, `WebSocket error: ${error.message}`]);

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  const handleFileSelect = (file) => {
    if (file && file.type === 'file') {
      setSelectedFile(file);
      setTableData([]);
    }
  };

  const bugDetection = (newContent) => {
    console.log('sent');
    if (selectedFile) {
        const updatedFile = { ...selectedFile, content: newContent };
        setSelectedFile(updatedFile);
        console.log(updatedFile.content)
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
          const messageContent = JSON.stringify({
            type: 'bugDetection',
            content: updatedFile.content,
          });
          socket.current.send(messageContent);
        }
    }
  };

  const patchGeneration = (bugLabel, bugID) => {
    if (selectedFile) {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        const messageContent = JSON.stringify({
          type: 'patchGeneration',
          bugLabel: bugLabel,
          content: bugData[bugID-1],
        });
        socket.current.send(messageContent);
      }
    }
  };

  const getSortedData = () => {
    if (selectedFile) {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        const messageContent = JSON.stringify({
          type: 'sortData',
        });
        socket.current.send(messageContent);
      }
    }
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light">
        <FileUploader onFileUpload={setFileData}/>
        <FileTree fileData={fileData} onSelectFile={handleFileSelect} />
      </Sider>
      <Layout>
        <Content>
          {selectedFile ? (
            <FileEditorWithBugTable
              selectedFile={selectedFile}
              onBugDetection={bugDetection}
              tableData={tableData}
              onPatchGeneration={patchGeneration}
              getSortedData={getSortedData}
              sortedData={sortedData}
            />
          ) : (
            <div style={{ padding: '20px' }}>选择一个文件以开始编辑</div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
