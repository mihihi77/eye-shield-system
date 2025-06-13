// src/components/ImageModal.jsx
import React from 'react';

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-white rounded-lg max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
        >
          ✕
        </button>
        <img
          src={imageUrl}
          alt="Detection Full Size"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default ImageModal;