import React from 'react';
import { AndroidIcon } from './icons/AndroidIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface AndroidVersionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const ANDROID_VERSIONS = [
  "Android 14 (Upside Down Cake)",
  "Android 13 (Tiramisu)",
  "Android 12 (Snow Cone)",
  "Android 11 (Red Velvet Cake)",
  "Android 10 (Q)"
];

const AndroidVersionSelector: React.FC<AndroidVersionSelectorProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="relative w-full">
      <AndroidIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
      <select
        id="android-version"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full pl-12 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300 appearance-none"
        aria-label="Seleccionar versión de Android"
      >
        {ANDROID_VERSIONS.map(version => (
          <option key={version} value={version}>{version}</option>
        ))}
      </select>
       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
        <ChevronDownIcon className="h-5 w-5" />
      </div>
    </div>
  );
};

export default AndroidVersionSelector;