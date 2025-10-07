

import { GoogleGenAI, Type } from "@google/genai";
import { Step } from "../App";

// Fix: Aligned with Gemini API guidelines.
// The API key should be sourced directly from `process.env.API_KEY`.
// The guidelines state to assume the key is always present, so the explicit check is removed.
// A non-null assertion (!) is used to satisfy TypeScript's type checker.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'El título claro y simple para el paso (ej. "Paso 1: Prepara tus herramientas").'
      },
      explanation: {
        type: Type.STRING,
        description: 'Una explicación extremadamente simple, para principiantes, de lo que se hace en este paso y por qué.'
      },
      command: {
        type: Type.STRING,
        description: 'El comando de terminal exacto que el usuario debe ejecutar. Si no hay comando, debe ser una cadena vacía.'
      },
      details: {
        type: Type.STRING,
        description: 'Cualquier nota adicional, como la ruta de un archivo o un consejo rápido. Si no hay detalles, debe ser una cadena vacía.'
      },
      actions: {
        type: Type.ARRAY,
        description: "Una lista opcional de acciones interactivas para el paso, como botones para copiar comandos o abrir enlaces. Usar en lugar de 'command' para pasos con múltiples acciones o enlaces.",
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, description: "El texto del botón (ej. 'Abrir .zshrc')." },
            type: { type: Type.STRING, description: "El tipo de acción: 'command' para copiar al portapapeles o 'link' para abrir una URL." },
            value: { type: Type.STRING, description: "El comando a copiar o la URL a abrir." }
          },
          required: ["label", "type", "value"]
        }
      },
      isOsSpecific: {
        type: Type.BOOLEAN,
        description: "Debe ser 'true' SÓLO para el paso de configuración del entorno, 'false' para todos los demás."
      },
      osInstructions: {
        type: Type.OBJECT,
        description: "Usado SÓLO si isOsSpecific es true. Contiene las instrucciones para cada SO.",
        properties: {
          macos_linux: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING, description: "Lista de tareas para macOS/Linux en formato de lista." },
              details: { type: Type.STRING, description: "Detalles adicionales para macOS/Linux (ej. cómo usar nano y encontrar la ruta del SDK)." },
              actions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    type: { type: Type.STRING },
                    value: { type: Type.STRING }
                  },
                  required: ["label", "type", "value"]
                }
              }
            },
             required: ["explanation", "details", "actions"]
          },
          windows: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING, description: "Lista de tareas para Windows en formato de lista." },
              details: { type: Type.STRING, description: "Instrucciones detalladas y numeradas para Windows." },
               actions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    type: { type: Type.STRING },
                    value: { type: Type.STRING }
                  },
                  required: ["label", "type", "value"]
                }
              }
            },
            required: ["explanation", "details", "actions"]
          }
        }
      }
    },
    required: ["title", "explanation"]
  }
};


export async function generateConversionSteps(repoUrl: string, androidVersion: string): Promise<Step[]> {
  const prompt = `
    Actúa como un guía tecnológico súper amigable para alguien que no sabe nada de programación.
    Tu objetivo es dar instrucciones "para Dummies" para convertir un proyecto web de GitHub (${repoUrl}) en una app de Android (APK) usando Apache Cordova, apuntando específicamente a **${androidVersion}**.

    La respuesta DEBE ser un array de JSON que siga el esquema proporcionado.
    Cada objeto en el array es un paso.

    Para cada paso:
    - **title**: Un título corto y súper simple.
    - **explanation**: Explica la acción a realizar de forma directa y amigable, pero concisa. El usuario debe entender la tarea inmediatamente.
    - **command**, **details**, **actions**: Rellena según sea necesario para el paso.

    Cubre estos puntos en pasos separados y en este orden exacto:
    1.  **Herramientas (Parte 1 - Software Básico)**:
        - **title**: "Paso 1: Instalar las Herramientas Básicas"
        - **explanation**: "Necesitarás algunas herramientas básicas. Primero, instala las versiones recomendadas (LTS) de Node.js y el Java JDK más reciente usando los botones de abajo. Luego, abre tu terminal (o Símbolo del Sistema en Windows) e instala Cordova con este comando:"
        - **command**: "DEBE ser exactamente \`npm install -g cordova\`"
        - **details**: "Node.js te permite ejecutar JavaScript fuera del navegador, Java JDK es necesario para construir apps de Android, y Cordova es la herramienta que empaqueta tu web en una app."
        - **actions**: "Crea DOS botones de tipo 'link': uno con el label 'Descargar Node.js (LTS)' que apunte a 'https://nodejs.org/' y otro con el label 'Descargar Java JDK' que apunte a 'https://www.oracle.com/java/technologies/downloads/'."
    2.  **Herramientas (Parte 2 - El Paquete Grande)**:
        - **explanation**: "Ahora, descarga e instala Android Studio, el programa oficial para desarrollar apps de Android. Una vez instalado, sigue estos dos pasos dentro de su 'SDK Manager' (Administrador de SDKs):\n\n1.  **En la pestaña 'SDK Platforms'**: Busca y asegúrate de que la versión que seleccionaste (**${androidVersion}**) esté instalada.\n2.  **En la pestaña 'SDK Tools'**: Marca la casilla de 'Android SDK Command-line Tools (latest)' y aplíca los cambios para instalarlo."
        - **Actions**: Un único botón: \`[{ "label": "Descargar Android Studio", "type": "link", "value": "https://developer.android.com/studio" }]\`.
    3.  **Configuración del Entorno (¡El Paso Clave!)**: Este es el paso interactivo.
        - **title**: "Paso 3: Configuración del Entorno"
        - **explanation**: "Selecciona tu sistema operativo. Este es el paso más importante para que todo funcione."
        - **isOsSpecific**: true
        - **command**, **details**, **actions** a nivel principal deben estar vacíos.
        - **osInstructions**: Rellena este objeto:
            - **macos_linux**:
                - **explanation**: "Sigue esta lista de tareas en orden para configurar tu terminal:"
                - **details**: "--- Dónde encontrar tu ruta de Android SDK ---\n1. Abre Android Studio.\n2. En la pantalla de bienvenida, ve a 'More Actions' -> 'SDK Manager'.\n3. Copia la ruta que aparece en 'Android SDK Location'.\n--- Cómo usar el editor 'nano' ---\n- Usa las flechas para moverte.\n- Pega el bloque de código al final.\n- Guarda: Presiona \`Ctrl+O\` y luego \`Enter\`.\n- Sal: Presiona \`Ctrl+X\`."
                - **actions**: Crea botones NUMERADOS para guiar al usuario:
                    1. \`{"label": "1. Abrir .zshrc (macOS moderno)", "type": "command", "value": "nano ~/.zshrc"}\`
                    2. \`{"label": "1. Abrir .bash_profile (Linux/macOS antiguo)", "type": "command", "value": "nano ~/.bash_profile"}\`
                    3. \`{"label": "2. Copiar Bloque de Configuración", "type": "command", "value": "# Configuración Android Cordova\\nexport ANDROID_HOME=\\"TU_RUTA_ANDROID_SDK\\"\\nexport JAVA_HOME=$(/usr/libexec/java_home)\\nexport PATH=$PATH:$ANDROID_HOME/emulator\\nexport PATH=$PATH:$ANDROID_HOME/platform-tools\\nexport PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"}\`
                    4. \`{"label": "3. Aplicar Cambios (.zshrc)", "type": "command", "value": "source ~/.zshrc && echo '¡Configuración aplicada!'"}\`
                    5. \`{"label": "3. Aplicar Cambios (.bash_profile)", "type": "command", "value": "source ~/.bash_profile && echo '¡Configuración aplicada!'"}\`
                    6. \`{"label": "4. Validar Configuración", "type": "command", "value": "echo $ANDROID_HOME"}\`
            - **windows**:
                - **explanation**: "Sigue esta lista de tareas en orden para configurar tu sistema:"
                - **actions**: Debe ser un array vacío \`[]\`.
                - **details**: Crea una lista numerada súper clara y detallada para configurar las variables de entorno manualmente.
                    "1. Abre la Configuración Avanzada del Sistema:\n   a. Presiona la tecla de Windows, escribe 'variables de entorno' y selecciona 'Editar las variables de entorno del sistema'.\n2. Crea la variable ANDROID_HOME:\n   a. En la ventana de 'Propiedades del sistema', haz clic en 'Variables de entorno...'.\n   b. En 'Variables del sistema', haz clic en 'Nueva...'.\n   c. Nombre de la variable: \`ANDROID_HOME\`.\n   d. Valor de la variable: Pega la ruta que copiaste del SDK Manager de Android Studio (ej. \`C:\\Users\\tu_usuario\\AppData\\Local\\Android\\Sdk\`).\n3. Crea la variable JAVA_HOME:\n   a. Repite el proceso: haz clic en 'Nueva...'.\n   b. Nombre de la variable: \`JAVA_HOME\`.\n   c. Valor de la variable: La ruta de tu JDK (ej. \`C:\\Program Files\\Java\\jdk-11.0.1\`).\n4. Edita la variable Path:\n   a. En 'Variables del sistema', busca y selecciona la variable 'Path' y haz clic en 'Editar...'.\n   b. Haz clic en 'Nuevo' y añade cada una de estas líneas, UNA POR UNA:\n      - \`%ANDROID_HOME%\\emulator\`\n      - \`%ANDROID_HOME%\\platform-tools\`\n      - \`%ANDROID_HOME%\\cmdline-tools\\latest\\bin\`\n5. Guarda todo:\n   a. Haz clic en 'Aceptar' en todas las ventanas para cerrar y guardar los cambios.\n6. Valida la configuración:\n   a. Abre una NUEVA ventana de terminal (CMD o PowerShell) y escribe \`echo %ANDROID_HOME%\`. Deberías ver la ruta que pegaste."
    4.  **Crear el Proyecto**:
        - **explanation**: "Ahora, vamos a crear el esqueleto de tu proyecto Cordova con un solo comando."
        - **command**: "Usa este comando exacto para crear el proyecto: \`cordova create mi-app-web com.ejemplo.miapp MiAppWeb\`"
        - **details**: "Este comando crea una carpeta llamada 'mi-app-web'. Si ves un error 'Path already exists', significa que ya existe. Bórrala o elige otro nombre.\n- \`mi-app-web\`: Es el nombre de la carpeta del proyecto.\n- \`com.ejemplo.miapp\`: Es el identificador único de tu app (como el de la Play Store).\n- \`MiAppWeb\`: Es el nombre que se mostrará en el teléfono."
    5.  **Entrar y Añadir Plataforma**: Comando combinado: \`cd mi-app-web && cordova platform add android\`. Explica que ahora están DENTRO de la carpeta del proyecto. En 'details', menciona que Cordova usará la versión '${androidVersion}'.
    6.  **Verificación**: Comando: \`cordova requirements\`. En 'details', añade la nota de solución de problemas DETALLADA y ESTRUCTURADA sobre 'Gradle' o 'Android target', usando una lista de verificación numerada (1. Revisa Android Studio, 2. Revisa la Configuración del Entorno, 3. Reinicia la Terminal).
    7.  **Mover Archivos**:
        - **explanation**: "Es hora de mover tu proyecto web. Borra todo el contenido de la carpeta 'www' que se creó y copia allí todos tus archivos HTML, CSS y JavaScript."
        - **command**: ""
        - **details**: "La carpeta 'www' es donde vive tu app. Cordova tomará todo lo que esté aquí y lo empaquetará."
    8.  **Construir el APK**: Comando: \`cordova build android\`. Recuérdales que debe ser desde la carpeta del proyecto.
    9.  **Encontrar el APK**:
        - **explanation**: "¡Felicidades! Tu APK está listo. Lo encontrarás dentro de la carpeta de tu proyecto en la siguiente ruta. Puedes arrastrar este archivo a tu teléfono Android para instalarlo."
        - **command**: "platforms/android/app/build/outputs/apk/debug/app-debug.apk"
        - **details**: ""
    10. **¡Lo Lograste! Próximos Pasos**:
        - **explanation**: "¡Lo lograste! Has convertido tu proyecto web en una app de Android. Como próximo paso, puedes abrir el archivo \`config.xml\` en la raíz de tu proyecto para personalizar cosas como el nombre de la app, el autor y el icono."
        - **command**: ""
        - **details**: ""
    11. **Icono de la App (Opcional)**: El paso final.
        - **title**: "Paso 11: Un Icono para tu App (Opcional)"
        // Fix: Escaped XML-like tags inside the template literal to prevent JSX parsing errors.
        - **explanation**: "¡Aquí tienes un icono sugerido para tu nueva app! Guarda el siguiente código como un archivo (por ejemplo, \`www/img/icon.svg\`) y luego añade esta línea dentro de la etiqueta ${'<widget>'} en tu archivo \`config.xml\` para usarlo: ${'<icon src=\\"www/img/icon.svg\\" />'}"
        - **command**: Contiene ÚNICAMENTE el código SVG completo para un icono simple y moderno. El icono debe ser cuadrado (viewBox="0 0 100 100"), usar un degradado de dos colores (de #4ade80 a #22d3ee), y representar una idea de 'web' y 'móvil', por ejemplo, usando los símbolos ${'</>'} dentro de una forma de teléfono estilizada.
        - **details**: Debe estar vacío.
        - **actions**: Debe ser un array vacío \`[]\`.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    // Fix: Access the 'text' property directly from the response, as it is not a function.
    const text = response.text;
    if (typeof text !== 'string' || !text.trim()) {
      console.error("La respuesta de la API de Gemini estaba vacía o no era una cadena de texto:", text);
      throw new Error("La IA devolvió una respuesta vacía o con un formato inesperado.");
    }
    
    // Attempt to parse the JSON, with a specific catch for parsing errors.
    try {
        return JSON.parse(text) as Step[];
    } catch (parseError) {
        console.error("Error al analizar el JSON de la API de Gemini. Respuesta de texto sin procesar:", text);
        throw new Error("La IA devolvió una respuesta con formato incorrecto (JSON inválido).");
    }

  } catch (error) {
    // Catch API call errors or the re-thrown parsing errors.
    console.error("Error al llamar a la API de Gemini o al procesar su respuesta:", error);
     if (error instanceof Error && (error.message.includes("JSON") || error.message.includes("inesperado"))) {
        throw error; // Re-throw the specific error for the UI.
    }
    throw new Error("No se pudo obtener una respuesta estructurada de la IA. El proyecto podría ser demasiado complejo o la API no está disponible actualmente.");
  }
}