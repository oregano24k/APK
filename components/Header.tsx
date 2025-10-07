import React from 'react';
import { AppIcon } from './icons/AppIcon';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-4">
        <AppIcon className="h-12 w-12" />
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-500 to-cyan-500 text-transparent bg-clip-text">
          Guía IA de Web a APK
        </h1>
      </div>
    </header>
  );
};

export default Header;