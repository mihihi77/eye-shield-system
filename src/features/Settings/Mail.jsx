// src/components/Mail.js
import React from 'react';

const Mail = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mail Settings</h2>
      <label className="block mb-3">
        Email Address:
        <input type="email" className="w-full border p-2 mt-1 rounded" />
      </label>
      <label className="block mb-3">
        SMTP Server:
        <input type="text" className="w-full border p-2 mt-1 rounded" />
      </label>
    </div>
  );
};

export default Mail;
