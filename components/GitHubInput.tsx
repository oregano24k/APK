import React from 'react';
import { GitHubIcon } from './icons/GitHubIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';
import AndroidVersionSelector from './AndroidVersionSelector';

interface GitHubInputProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  androidVersion: string;
  setAndroidVersion: (version: string) => void;
  onConvert: () => void;
  isLoading: boolean;
}

const GitHubInput: React.FC<GitHubInputProps> = ({ repoUrl, setRepoUrl, androidVersion, setAndroidVersion, onConvert, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onConvert();
    }
  };

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div>
          <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-1">
            URL del Repositorio de GitHub
          </label>
          <div className="relative flex-grow w-full">
            <GitHubIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              id="repo-url"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repository"
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-300"
              disabled={isLoading}
              required
            />
          </div>
        </div>
        
        <div>
           <label htmlFor="android-version" className="block text-sm font-medium text-gray-700 mb-1">
            Versión de Android de Destino
          </label>
          <AndroidVersionSelector
            value={androidVersion}
            onChange={setAndroidVersion}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-cyan-500 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed self-center"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="h-5 w-5" />
              Procesando...
            </>
          ) : (
            'Generar Guía'
          )}
        </button>
      </form>
    </div>
  );
};

export default GitHubInput;