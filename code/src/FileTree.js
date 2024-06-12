// src/FileTree.js
import React from 'react';
import { Tree } from 'antd';
import { FileOutlined, FolderOutlined } from '@ant-design/icons';

const { TreeNode } = Tree;

const FileTree = ({ fileData, onSelectFile }) => {
  const renderTreeNodes = (data) => {
    return data.map(({ title, key, children, type, content, path }) => (
      <TreeNode
        key={key}
        title={title}
        type={type}
        content={content}
        path={path}
        icon={type === 'file' ? <FileOutlined /> : <FolderOutlined />}
        selectable={type === 'file'}
      >
        {children && renderTreeNodes(children)}
      </TreeNode>
    ));
  };

  return (
    <Tree showIcon defaultExpandAll onSelect={(selectedKeys, { node }) => onSelectFile(node)}>
      {renderTreeNodes(fileData)}
    </Tree>
  );
};

export default FileTree;
