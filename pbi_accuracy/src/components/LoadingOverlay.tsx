import React from 'react';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-[#64D7BE]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#64D7BE] rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
          Cooking the numbers <span className="inline-block">👨‍🍳</span>
        </p>
      </div>
    </div>
  );
};