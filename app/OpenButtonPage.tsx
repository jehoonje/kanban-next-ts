"use client"; // Link interaction needs client-side rendering

import React from 'react';

export default function OpenButtonPage() {
  const urlToOpen = "https://hearyou.vercel.app";

  return (
    // Flex container to center the button within the layout's content area
    <div className="w-full h-full flex flex-col justify-center items-center">
      <a
        href={urlToOpen}
        target="_blank" // This is key to suggest opening in a new context (potentially external browser)
        rel="noopener noreferrer" // Security best practice for target="_blank"
        className="px-8 py-2 bg-[#FE4848] text-white text-xs font-semibold rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
      >
        브라우저로 열기
      </a>
      {/* Optional: User guidance text */}
      <p className="mt-4 text-xs text-gray-400 text-center max-w-xs">
        클릭 시 기본 웹 브라우저에서 링크를 엽니다. <br/>사용 중인 앱 환경에 따라 다르게 동작할 수 있습니다.
      </p>
    </div>
  );
}