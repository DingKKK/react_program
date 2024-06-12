// src/FileUploader.js
import React from 'react';
import { Button } from 'antd';
import { FolderOutlined } from '@ant-design/icons';

const FileUploader = ({ onFileUpload}) => {

  const handleUploadProgram = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.directory = true;
    input.webkitdirectory = true;
    input.click();

    input.onchange = async () => {
      const folder = input.files;
      if (!folder) return;
      const folderStructure = await parseFolder(folder);
      onFileUpload(folderStructure);
    };
  };

  const parseFolder = async (folder) => {
    const folderStructure = [];
    for (let i = 0; i < folder.length; i++) {
      const file = folder[i];
      const pathSegments = file.webkitRelativePath.trim().split('/');
      let currentLevel = folderStructure;

      for (let index = 0; index < pathSegments.length; index++) {
        let segment = pathSegments[index];
        let existingNode = currentLevel.find((node) => node.title === segment);

        if (!existingNode) {
          const newNode = {
            title: segment,
            key: segment + '_' + index,
            type: segment.includes('.') ? 'file' : 'folder',
            children: [],
            content: null,
            path: null,
            isLeaf: index === pathSegments.length - 1,
          };
          if (newNode.type === 'file') {
            newNode.content = await readFile(file);
            newNode.path = file.webkitRelativePath;
            console.log(newNode.path);
          }
          currentLevel.push(newNode);
          currentLevel = newNode.children;
        } else {
          currentLevel = existingNode.children;
        }
      }
    }
    return folderStructure;
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (event) => reject(event.target.error);
      reader.readAsText(file);
    });
  };

  return (
    <Button icon={<FolderOutlined />} style={{ margin: '8px' }} onClick={handleUploadProgram}>
      上传本地项目
    </Button>
  );
};

export default FileUploader;
