import React, { useState } from 'react';

interface CodeBlockProps {
  command: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ command }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
      <code className="text-sm text-yellow-300 whitespace-pre-wrap font-mono select-all">
        {command}
      </code>
      <button
        onClick={handleCopy}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 ${
          isCopied
            ? 'bg-green-500 text-white'
            : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
        }`}
      >
        {isCopied ? '¡Copiado!' : 'Copiar'}
      </button>
    </div>
  );
};