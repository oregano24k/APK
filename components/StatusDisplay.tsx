import React from 'react';

interface StatusDisplayProps {
  messages: string[];
  currentIndex: number;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ messages, currentIndex }) => {
  return (
    <div className="mt-10 max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-center text-cyan-600 mb-4">Procesando Solicitud...</h3>
      <ul className="space-y-3">
        {messages.map((message, index) => (
          <li key={index} className="flex items-center gap-3 transition-all duration-500">
            <div
              className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center
                ${index < currentIndex ? 'bg-green-500' : ''}
                ${index === currentIndex ? 'bg-cyan-500 animate-pulse' : ''}
                ${index > currentIndex ? 'bg-gray-300' : ''}
              `}
            >
              {index < currentIndex && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span
              className={`
                ${index < currentIndex ? 'text-gray-500 line-through' : ''}
                ${index === currentIndex ? 'text-gray-900 font-semibold' : ''}
                ${index > currentIndex ? 'text-gray-400' : ''}
              `}
            >
              {message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusDisplay;