// src/FileEditorWithBugTable.js
import React, { useRef, useState, useEffect } from 'react';
import { Button, Table, message } from 'antd';
import Editor from '@monaco-editor/react';

const FileEditorWithBugTable = ({ selectedFile, onBugDetection ,tableData, onPatchGeneration, getSortedData , sortedData}) => {
  const editorRef = useRef(null);
  const [tableHeight, setTableHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [filted, setFilted] = useState(false);
  const [filtedData, setFiltedData] = useState(null);
  const [sorted, setSorted] = useState(false);
  const [bugLabel, setBugLabel] = useState(null);
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleCellClick = (location) => {
    const [lineNumber, colNumber] = location.match(/\d+/g).map(Number);
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(lineNumber);
      editorRef.current.setPosition({ lineNumber, column: colNumber });
      editorRef.current.focus();
    }
  };

  const handleIDClick = (id) => {
    if (filted === true) {
      console.log(id);
      console.log(bugLabel);
      onPatchGeneration(bugLabel, id);
      setFilted(false);
    }
  };
  const startResizing = (e) => {
    setIsResizing(true);
    document.body.style.cursor = 'ns-resize';
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.body.style.cursor = 'default';
  };

  const resizeTable = (e) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      setTableHeight(newHeight);
    }
  };

  React.useEffect(() => {
    window.addEventListener('mousemove', resizeTable);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resizeTable);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      onCell: (record) => ({
        onClick: () => handleIDClick(record.id),
      }),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Qualifier',
      dataIndex: 'qualifier',
      key: 'qualifier',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      onCell: (record) => ({
        onClick: () => handleCellClick(record.location),
      }),
    },
  ];
  const handleBugDetectionClick = () => {
    if (editorRef.current) {
      setFilted(false);
      setSorted(false);
      const editorValue = editorRef.current.getValue();
      onBugDetection(editorValue);
    } else {
      message.error('Editor is not ready');
    }
  };
  const handle1 = () => {
    setShowDialog(false);
    setFilted(true);
    setBugLabel('INDEX_ERROR'); // 数组越界
    let flag = 0
    let newDataList = tableData.map(item => {
      if (item.type === 'INDEX_ERROR') {
        flag =1;
        return item;
      }
    });
    if (flag === 0) {
      newDataList = [];
    }
    setFiltedData(newDataList);
  };
  const handle2 = () => {
    setShowDialog(false);
    setFilted(true);
    setBugLabel('MEMORY_LEAK'); // 内存泄漏
    let flag = 0;
    let newDataList = tableData.map(item => {
      if (item.type === 'MEMORY_LEAK') {
        flag =1;
        return item;
      }
    });
    if (flag === 0) {
      newDataList = [];
    }
    setFiltedData(newDataList);
    console.log(newDataList);
  };
  const handlePatchGenerationClick = () => {
    setShowDialog(true);
  };
  const dialogStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  const dialogContentStyles = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  };

  const dialogButtonStyles = {
    margin: '0 10px',
  };

  const handleSort = () => {
    if (filted === false && tableData.length > 0) {
      if (sorted === false) {
        setSorted(true);
        getSortedData();
      } else {
        setSorted(false);
      }
    }
    
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <p style={{ marginRight: '10px' }}>{selectedFile.title}</p>
        <Button onClick={handleBugDetectionClick}>漏洞检测</Button>
        <Button onClick={handlePatchGenerationClick}>补丁修复</Button>
        {showDialog && (
          <div style={dialogStyles}>
            <div style={dialogContentStyles}>
              <p>选择漏洞类别</p>
              <button onClick={handle1} style={dialogButtonStyles}>数组越界</button>
              <button onClick={handle2} style={dialogButtonStyles}>内存泄漏</button>
            </div>
          </div>
        )}
      </div>
      <Editor
        height={`calc(100vh - ${tableHeight + 50}px)`}
        defaultLanguage="cpp"
        value={selectedFile.content}
        onMount={handleEditorDidMount}
      />
      <div style={{ height: `${tableHeight}px`, overflow: 'auto', marginTop: '20px', position: 'relative' }}>
        <Button onClick={handleSort}>按置信度排序</Button>
        <Table columns={columns} dataSource={filted ? filtedData : (sorted ? sortedData : tableData)} pagination={false} />
        <div
          style={{
            height: '5px',
            backgroundColor: 'gray',
            cursor: 'ns-resize',
            position: 'absolute',
            top: 0,
            width: '100%',
          }}
          onMouseDown={startResizing}
        />
      </div>
    </div>
  );
};

export default FileEditorWithBugTable;
