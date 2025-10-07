import React, { useState } from 'react';
import { Action } from '../App';
import { LinkIcon } from './icons/LinkIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';


interface ActionButtonProps {
  action: Action;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ action }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = () => {
    if (action.type === 'link') {
      window.open(action.value, '_blank', 'noopener,noreferrer');
    } else if (action.type === 'command') {
      navigator.clipboard.writeText(action.value).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  const isCommandCopied = action.type === 'command' && isCopied;
  const buttonText = isCommandCopied ? '¡Copiado!' : action.label;
  const Icon = isCommandCopied 
    ? CheckIcon 
    : (action.type === 'link' ? LinkIcon : ClipboardIcon);

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
        isCopied
          ? 'bg-green-500 text-white'
          : 'bg-cyan-600 text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-cyan-500'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{buttonText}</span>
    </button>
  );
};
