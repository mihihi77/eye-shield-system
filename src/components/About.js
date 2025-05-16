// src/components/About.js
import React from 'react';

const About = () => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-xl text-center border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">📘 About</h2>
        <p className="text-gray-700 mb-2 text-lg"><strong>Version:</strong> 1.0.0</p>
        <p className="text-gray-700 mb-2 text-lg">Camera System UI built with React.</p>
        <p className="text-gray-700 mb-2 text-lg"><strong>Developer:</strong> [My group]</p>
        <p className="text-gray-700 text-lg">
          <strong>Contact:</strong>{' '}
          <a href="mailto:your@email.com" className="text-blue-500 underline">
            your@email.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default About;
