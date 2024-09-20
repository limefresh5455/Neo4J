import React, { useState, useEffect } from "react";
import FileUpload from "./FileUpload";
import Tree from "react-d3-tree";

function App() {
  const [documents, setDocuments] = useState([]);
  const [treeData, setTreeData] = useState(null);

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
    console.log("rootNodes", rootNodes);
    const findChildren = (lender) => {
      const children = documents
        .filter((doc) => normalizeText(doc.lender) === normalizeText(lender))
        .map((doc) => ({
          name: doc.borrower,
          children: findChildren(doc.borrower),
        }));

      return children.length ? children : null;
    };

    const tree = rootNodes.map((root) => ({
      name: root,
      children: findChildren(root),
    }));

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
          />
        </div>
      ) : (
        <div className="container m-4 text-center" style={{ color: "red" }}>
          Please upload Companies CSV to display the tree.
        </div>
      )}
    </div>
  );
}

export default App;
