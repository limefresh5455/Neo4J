import React from "react";
import Papa from "papaparse";

function FileUpload({ onDataLoaded }) {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log("Companies data:", results.data);
          onDataLoaded(results.data);
        },
        error: (error) => {
          console.error("Error parsing CSV file:", error);
        },
      });
    } else {
      console.error("Please upload a valid file.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12 text-center">
          <div className="form-group">
            <label htmlFor="fileUpload" className="form-label">
              Upload CSV File
            </label>
            <br />
            <input
              type="file"
              accept=".csv"
              className="form-control-file border"
              id="fileUpload"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
