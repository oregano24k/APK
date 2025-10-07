import React from 'react';

interface DetailsDisplayProps {
  details: string;
}

const DetailsDisplay: React.FC<DetailsDisplayProps> = ({ details }) => {
  if (!details) {
    return null;
  }

  // Pre-procesa el texto para asegurar saltos de línea antes de los elementos de la lista y los encabezados,
  // incluso si la IA devuelve un único bloque de texto.
  const parsableText = details
    .replace(/\s*(---.*?---)\s*/g, '\n\n$1\n\n') // Aislar encabezados con más espacio
    .replace(/\s*(\d+\.)/g, '\n$1')       // Romper antes de las listas numeradas
    .replace(/\s*([a-z]\.)/g, '\n$1');    // Romper antes de las sub-listas con letras

  // Dividir en líneas y filtrar las vacías
  const lines = parsableText.split('\n').filter(line => line.trim() !== '');

  const renderedContent = lines.map((line, index) => {
    const trimmedLine = line.trim();

    // Regex para encabezados: "--- INSTRUCCIONES ---"
    if (trimmedLine.startsWith('---') && trimmedLine.endsWith('---')) {
      return (
        <h4 key={index} className="font-bold text-gray-900 mt-4 mb-2 pt-3 border-t border-gray-200 first:mt-0 first:pt-0 first:border-0 text-base">
          {trimmedLine.replace(/---/g, '').trim()}
        </h4>
      );
    }

    // Regex para sub-listas con letras: "a. texto"
    const letterMatch = trimmedLine.match(/^([a-z])\.\s+(.*)/s);
    if (letterMatch) {
      return (
        <div key={index} className="flex items-start pl-12 my-1.5 text-gray-700 leading-relaxed">
          <span className="mr-2 font-semibold w-4">{letterMatch[1]}.</span>
          <p className="flex-1">{letterMatch[2]}</p>
        </div>
      );
    }

    // Regex para listas numeradas: "1. texto"
    const numberMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/s);
    if (numberMatch) {
      return (
        <div key={index} className="flex items-start pl-6 my-1.5 font-medium text-gray-800 leading-relaxed">
          <span className="mr-2 font-bold w-5">{numberMatch[1]}.</span>
          <p className="flex-1">{numberMatch[2]}</p>
        </div>
      );
    }

    // Por defecto, un párrafo para cualquier texto restante.
    // Especialmente útil para la descripción inicial de la sección de macOS.
    return (
      <p key={index} className="my-2 text-gray-600 leading-relaxed">{trimmedLine}</p>
    );
  });

  return (
    <div className="mt-4 text-sm bg-gray-50/70 border border-gray-200 p-4 rounded-lg">
      {renderedContent}
    </div>
  );
};

export default DetailsDisplay;
