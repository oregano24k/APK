import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import GitHubInput from './components/GitHubInput';
import StatusDisplay from './components/StatusDisplay';
import ResultCard from './components/ResultCard';
import { generateConversionSteps } from './services/geminiService';
import { AppIcon } from './components/icons/AppIcon';

const STATUS_MESSAGES = [
  "Conectando al repositorio de GitHub...",
  "Analizando la estructura del proyecto...",
  "Generando el script de conversión con IA...",
  "Compilando las instrucciones de compilación...",
  "Finalizando tu guía interactiva..."
];

export interface Action {
  label: string;
  type: 'command' | 'link';
  value: string;
}

export interface OsSpecificInstructions {
  explanation: string;
  details?: string;
  actions?: Action[];
}

export interface Step {
  title: string;
  explanation: string;
  command?: string;
  details?: string;
  actions?: Action[];
  isOsSpecific?: boolean;
  osInstructions?: {
    macos_linux: OsSpecificInstructions;
    windows: OsSpecificInstructions;
  };
}


const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [androidVersion, setAndroidVersion] = useState<string>('Android 14 (Upside Down Cake)');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStatusIndex, setCurrentStatusIndex] = useState<number>(0);
  const [result, setResult] = useState<Step[]>([]);
  const [error, setError] = useState<string>('');
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const processRequest = useCallback(async () => {
    try {
      const steps = await generateConversionSteps(repoUrl, androidVersion);
      setResult(steps);
    } catch (e) {
      console.error(e);
      // Fix: Display the specific error message from the service for better user feedback.
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('No se pudieron generar las instrucciones. Por favor, revisa la consola para más detalles.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl, androidVersion]);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (isLoading && currentStatusIndex < STATUS_MESSAGES.length) {
      interval = setTimeout(() => {
        setCurrentStatusIndex(prevIndex => prevIndex + 1);
      }, 1000);
    } else if (isLoading && currentStatusIndex >= STATUS_MESSAGES.length) {
      processRequest();
    }
    return () => clearTimeout(interval);
  }, [isLoading, currentStatusIndex, processRequest]);

  const handleConvert = () => {
    if (!repoUrl.trim() || !repoUrl.includes('github.com')) {
      setError('Por favor, ingresa una URL de repositorio de GitHub válida.');
      return;
    }
    setError('');
    setResult([]);
    setCurrentStatusIndex(0);
    setIsLoading(true);
  };

  const handleReset = () => {
    setRepoUrl('');
    setResult([]);
    setError('');
  };

  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-200 flex flex-col items-center justify-center">
        <div className="text-center animate-fade-in">
          <AppIcon className="h-24 w-24 mx-auto animate-pulse" />
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-500 to-cyan-500 text-transparent bg-clip-text mt-4">
            Guía IA de Web a APK
          </h1>
          <p className="text-gray-500 mt-2">Inicializando IA...</p>
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-200 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <main className="mt-12">
          {!result.length && (
            <>
              <p className="text-center text-lg text-gray-600 max-w-2xl mx-auto">
                Ingresa la URL de un repositorio público de GitHub para un proyecto HTML/JS. Nuestra IA generará una guía completa sobre cómo empaquetarlo en un APK de Android.
              </p>
              <GitHubInput
                repoUrl={repoUrl}
                setRepoUrl={setRepoUrl}
                androidVersion={androidVersion}
                setAndroidVersion={setAndroidVersion}
                onConvert={handleConvert}
                isLoading={isLoading}
              />
            </>
          )}


          {error && (
            <div className="mt-8 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <StatusDisplay messages={STATUS_MESSAGES} currentIndex={currentStatusIndex} />
          )}

          {result.length > 0 && !isLoading && <ResultCard steps={result} onReset={handleReset} />}
        </main>
        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>Impulsado por la API de Gemini. Esta herramienta genera instrucciones y no compila código.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;