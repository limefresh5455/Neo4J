import React, { useState, useEffect } from "react";
import FileUpload from "./FileUpload";
import Tree from "react-d3-tree";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [documents, setDocuments] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const normalizeText = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

  const buildTreeData = () => {
    const lenders = new Set();
    const borrowers = new Set();

    documents.forEach(({ lender, borrower }) => {
      lenders.add(normalizeText(lender));
      borrowers.add(normalizeText(borrower));
    });

    const rootNodes = Array.from(lenders).filter(
      (lender) => !borrowers.has(normalizeText(lender))
    );

    const findChildren = (lender) => {
      const children = documents
        .filter((doc) => normalizeText(doc.lender) === normalizeText(lender))
        .map((doc) => ({
          name: doc.borrower,
          file_number: doc.file_number || "N/A",
          security: doc.security || "N/A",
          underlying_security: doc.underlying_security || "N/A",
          underlying_security2: doc.underlying_security2 || "N/A",
          link: doc.link || "N/A",
          children: findChildren(doc.borrower),
        }));

      return children.length ? children : null;
    };

    const tree = rootNodes.map((root) => {
      const rootDoc = documents.find(
        (doc) => normalizeText(doc.lender) === root
      );

      return {
        name: root,
        file_number: rootDoc ? rootDoc.file_number : "N/A",
        security: rootDoc ? rootDoc.security : "N/A",
        underlying_security: rootDoc ? rootDoc.underlying_security : "N/A",
        underlying_security2: rootDoc ? rootDoc.underlying_security2 : "N/A",
        link: rootDoc ? rootDoc.link : "N/A",
        children: findChildren(root),
      };
    });

    return tree;
  };

  useEffect(() => {
    if (documents.length > 0) {
      const tree = buildTreeData();
      setTreeData(tree);
    }
  }, [documents]);

  const handleFileUpload = (data) => {
    setDocuments(data);
  };

  // Modify handleNodeClick to gather child node data for parent nodes
  const handleNodeClick = (nodeData) => {
    if (nodeData.children && nodeData.children.length > 0) {
      setSelectedNodeData(nodeData.children); // Set the children data when clicking parent node
    } else if (nodeData.data) {
      setSelectedNodeData([nodeData]); // Set single node data for leaf nodes
    }
    setShowModal(true);
  };

  const renderNode = (nodeData) => {
    return (
      <div>
        <strong>{nodeData.name}</strong>
        {nodeData.data.link && nodeData.data.link !== "N/A" ? (
          <div>
            <a
              href={nodeData.data.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {nodeData.data.link}
            </a>
          </div>
        ) : (
          <div>N/A</div>
        )}
      </div>
    );
  };

  return (
    <div className="App container">
      <h2 className="text-center m-4" style={{ color: "orange" }}>
        <strong>Loan Information Tree</strong>
      </h2>

      <FileUpload onDataLoaded={handleFileUpload} />

      {treeData && treeData.length > 0 ? (
        <div id="treeWrapper" style={{ width: "100%", height: "500px" }}>
          <Tree
            data={treeData}
            orientation="vertical"
            translate={{ x: 200, y: 50 }}
            pathFunc="diagonal"
            nodeSize={{ x: 200, y: 100 }}
            collapsible={false}
            renderCustomNode={renderNode}
            onNodeClick={handleNodeClick}
          />
        </div>
      ) : (
        <div className="container m-4 text-center" style={{ color: "red" }}>
          Please upload Companies CSV to display the tree.
        </div>
      )}

      {/* Modal to display node data */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Company Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNodeData && selectedNodeData.length > 0 ? (
            selectedNodeData.map((childNode, index) => (
              <div key={index}>
                <p>
                  <strong>Company Name : </strong> {childNode.data.name}
                </p>
                <p>
                  <strong>File Number : </strong> {childNode.data.file_number}
                </p>
                <p>
                  <strong>Security : </strong> {childNode.data.security}
                </p>
                <p>
                  <strong>Underlying Security : </strong>{" "}
                  {childNode.data.underlying_security}
                </p>
                <p>
                  <strong>Underlying Security 2 : </strong>{" "}
                  {childNode.data.underlying_security2}
                </p>
                <p>
                  <strong>Link : </strong>
                  <a
                    href={childNode.data.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {childNode.data.link}
                  </a>
                </p>
                <hr />
              </div>
            ))
          ) : (
            <p>No data available.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
