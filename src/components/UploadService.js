// src/components/UploadService.js
import React from 'react';

const UploadService = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Upload Service</h2>
      <label className="block mb-3">
        Upload Endpoint:
        <input type="text" className="w-full border p-2 mt-1 rounded" />
      </label>
      <label className="block mb-3">
        Auth Token:
        <input type="password" className="w-full border p-2 mt-1 rounded" />
      </label>
    </div>
  );
};

export default UploadService;
