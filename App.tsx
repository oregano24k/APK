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
  group?: string;
}

export interface Step {
  title: string;
  explanation: string;
  command?: string;
  details?: string;
  actions?: Action[];
}

const OSSelector: React.FC<{ onSelect: (os: 'macos_linux' | 'windows') => void; }> = ({ onSelect }) => {
  return (
    <div className="max-w-2xl mx-auto text-center animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Primero, elige tu entorno de desarrollo</h2>
      <p className="text-gray-600 leading-relaxed mb-8">
        Selecciona tu sistema operativo para que podamos generar una guía perfectamente adaptada a tus herramientas.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onSelect('macos_linux')}
          className="p-8 border-2 border-gray-300 rounded-lg text-left hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <span className="text-4xl" role="img" aria-label="Apple">💻</span>
          <h3 className="font-bold text-xl text-gray-800 mt-3">macOS / Linux</h3>
          <p className="text-sm text-gray-600 mt-1">Para terminales ZSH, Bash u otras basadas en Unix.</p>
        </button>
        <button
          onClick={() => onSelect('windows')}
          className="p-8 border-2 border-gray-300 rounded-lg text-left hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <span className="text-4xl" role="img" aria-label="Windows">🖥️</span>
          <h3 className="font-bold text-xl text-gray-800 mt-3">Windows</h3>
          <p className="text-sm text-gray-600 mt-1">Para CMD, PowerShell y configuración manual del sistema.</p>
        </button>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [selectedOS, setSelectedOS] = useState<'macos_linux' | 'windows' | null>(null);
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
    if (!selectedOS) {
      setError('Por favor, selecciona un sistema operativo para continuar.');
      setIsLoading(false);
      return;
    }
    try {
      const steps = await generateConversionSteps(repoUrl, androidVersion, selectedOS);
      setResult(steps);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('No se pudieron generar las instrucciones. Por favor, revisa la consola para más detalles.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl, androidVersion, selectedOS]);

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
    setSelectedOS(null);
    setIsLoading(false);
    setCurrentStatusIndex(0);
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
           {!selectedOS ? (
            <OSSelector onSelect={setSelectedOS} />
          ) : !result.length && !isLoading ? (
            <div className="animate-fade-in">
                <div className="text-center mb-6">
                    <p className="text-gray-600">Sistema Operativo: <span className="font-semibold text-cyan-700">{selectedOS === 'macos_linux' ? 'macOS / Linux' : 'Windows'}</span></p>
                    <button onClick={handleReset} className="text-sm text-cyan-600 hover:underline">
                        &larr; Cambiar sistema operativo
                    </button>
                </div>
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
            </div>
          ) : null}


          {error && (
            <div className="mt-8 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p>{error}</p>
              <button onClick={handleReset} className="mt-2 text-sm font-semibold text-red-700 underline">Empezar de nuevo</button>
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