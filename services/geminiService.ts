

import { GoogleGenAI, Type } from "@google/genai";
import { Step } from "../App";

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
            value: { type: Type.STRING, description: "El comando a copiar o la URL a abrir." },
            group: { type: Type.STRING, description: "Un grupo opcional para la UI, ej: 'zshrc', 'bash_profile', 'common', 'validation'." }
          },
          required: ["label", "type", "value"]
        }
      }
    },
    required: ["title", "explanation"]
  }
};


export async function generateConversionSteps(repoUrl: string, androidVersion: string, selectedOS: 'macos_linux' | 'windows'): Promise<Step[]> {
  const prompt = `
    Actúa como un guía tecnológico súper amigable para alguien que no sabe nada de programación.
    Tu objetivo es dar instrucciones "para Dummies" para convertir un proyecto web de GitHub (${repoUrl}) en una app de Android (APK) usando Apache Cordova, apuntando específicamente a **${androidVersion}** para el sistema operativo **${selectedOS}**.

    La respuesta DEBE ser un array de JSON que siga el esquema proporcionado.
    Cada objeto en el array es un paso, generado específicamente para ${selectedOS}. No incluyas propiedades como 'isOsSpecific' u 'osInstructions'.

    Para cada paso:
    - **title**: Un título corto y súper simple.
    - **explanation**: Explica la acción a realizar de forma directa y amigable, pero concisa. El usuario debe entender la tarea inmediatamente.
    - **command**, **details**, **actions**: Rellena según sea necesario para el paso.

    Cubre estos puntos en pasos separados y en este orden exacto:
    1.  **Herramientas (Parte 1 - Software Básico)**:
        - **title**: "Paso 1: Instalar las Herramientas Básicas"
        - **explanation**: "Para empezar, usa estos botones para descargar e instalar las herramientas necesarias para ${selectedOS === 'macos_linux' ? 'macOS / Linux' : 'Windows'}."
        - **actions**: ${selectedOS === 'macos_linux'
            ? `\`[{"label": "Descargar Node.js (LTS)", "type": "link", "value": "https://nodejs.org/"}, {"label": "Descargar Java JDK", "type": "link", "value": "https://www.oracle.com/java/technologies/downloads/"}, {"label": "Instalar Cordova (macOS/Linux)", "type": "command", "value": "sudo npm install -g cordova"}]\``
            : `\`[{"label": "Descargar Node.js (LTS)", "type": "link", "value": "https://nodejs.org/"}, {"label": "Descargar Java JDK", "type": "link", "value": "https://www.oracle.com/java/technologies/downloads/"}, {"label": "Instalar Cordova (Windows)", "type": "command", "value": "npm install -g cordova"}]\``
        }
        - **details**: ${selectedOS === 'macos_linux'
            ? `"Node.js te permite ejecutar JavaScript, Java JDK es para construir apps de Android, y Cordova empaqueta tu web. En macOS y Linux, 'sudo' es necesario para dar permisos de instalación; te pedirá la contraseña de tu computadora (no la verás al escribir, es normal)."`
            : `"Node.js te permite ejecutar JavaScript, Java JDK es para construir apps de Android, y Cordova empaqueta tu web. Asegúrate de abrir tu terminal (CMD o PowerShell) como Administrador para instalar Cordova."`
        }
    2.  **Herramientas (Parte 2 - El Paquete Grande)**:
        - **title**: "Paso 2: Instalar Android Studio y SDK"
        - **explanation**: "Ahora, descarga e instala Android Studio, el programa oficial para desarrollar apps de Android. Una vez instalado, sigue estos dos pasos dentro de su 'SDK Manager' (Administrador de SDKs):\n\n1.  **En la pestaña 'SDK Platforms'**: Busca y asegúrate de que la versión que seleccionaste (**${androidVersion}**) esté instalada.\n2.  **En la pestaña 'SDK Tools'**: Marca la casilla de 'Android SDK Command-line Tools (latest)' y aplíca los cambios para instalarlo."
        - **actions**: \`[{ "label": "Descargar Android Studio", "type": "link", "value": "https://developer.android.com/studio" }]\`
        - **details**: ""
    3.  **Configuración del Entorno (¡El Paso Clave!)**:
        - **title**: "Paso 3: Configuración del Entorno"
        - **explanation**: "${selectedOS === 'macos_linux'
            ? `Sigue estos pasos en orden. Primero, elige la opción que corresponda a tu sistema operativo para abrir y editar el archivo de configuración correcto. Luego, copia el bloque de configuración y, finalmente, valida que todo funcione.`
            : `Sigue las instrucciones detalladas a continuación para configurar tu sistema manualmente. Luego, usa los botones de validación para confirmar que todo está correcto.`
        }"
        - **actions**: ${selectedOS === 'macos_linux'
            ? `[
                {"label": "Abrir Archivo (.zshrc)", "type": "command", "value": "nano ~/.zshrc", "group": "zshrc"},
                {"label": "Aplicar Cambios (.zshrc)", "type": "command", "value": "source ~/.zshrc && echo '¡Configuración aplicada!'", "group": "zshrc"},
                {"label": "Abrir Archivo (.bash_profile)", "type": "command", "value": "nano ~/.bash_profile", "group": "bash_profile"},
                {"label": "Aplicar Cambios (.bash_profile)", "type": "command", "value": "source ~/.bash_profile && echo '¡Configuración aplicada!'", "group": "bash_profile"},
                {"label": "Copiar Bloque de Configuración", "type": "command", "value": "# Configuración Android Cordova\\nexport ANDROID_HOME='TU_RUTA_ANDROID_SDK'\\nexport JAVA_HOME=$(/usr/libexec/java_home)\\nexport PATH=$PATH:$ANDROID_HOME/emulator\\nexport PATH=$PATH:$ANDROID_HOME/platform-tools\\nexport PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin", "group": "common"},
                {"label": "Validar: ANDROID_HOME", "type": "command", "value": "echo $ANDROID_HOME", "group": "validation"},
                {"label": "Validar: ADB", "type": "command", "value": "which adb", "group": "validation"},
                {"label": "Validar: AVD Manager", "type": "command", "value": "which avdmanager", "group": "validation"}
               ]`
            : `[
                {"label": "Validar: ANDROID_HOME", "type": "command", "value": "echo %ANDROID_HOME%"},
                {"label": "Validar: ADB", "type": "command", "value": "where adb"},
                {"label": "Validar: AVD Manager", "type": "command", "value": "where avdmanager"}
               ]`
        }
        - **details**: "${selectedOS === 'macos_linux'
            ? `--- Dónde encontrar tu ruta de Android SDK ---\\n1. Abre Android Studio.\\n2. En la pantalla de bienvenida, ve a 'More Actions' -> 'SDK Manager'.\\n3. Copia la ruta que aparece en 'Android SDK Location'.\\n4. IMPORTANTE: En el bloque de código que copiarás, reemplaza el texto 'TU_RUTA_ANDROID_SDK' por la ruta que acabas de copiar. Las comillas simples deben permanecer.\\n--- ¡ATENCIÓN! Evita Duplicados ---\\nAntes de pegar el nuevo bloque, revisa el archivo cuidadosamente. Si ya ves un bloque de código que configure 'ANDROID_HOME', **bórralo por completo** para prevenir errores.\\n--- Cómo usar el editor 'nano' ---\\n- Usa las flechas para moverte.\\n- Guarda: Presiona \`Ctrl+O\` y luego \`Enter\`.\n- Sal: Presiona \`Ctrl+X\`.\n--- Por qué 'Aplicar Cambios' es Crucial ---\\nDespués de guardar el archivo de configuración, tu terminal actual no sabe que ha cambiado. El botón 'Aplicar Cambios' ejecuta el comando 'source', que obliga a la terminal a releer el archivo inmediatamente. Sin este paso, tendrías que cerrar y abrir una nueva ventana de terminal para que los cambios surtan efecto. Este botón es un atajo muy útil para evitar eso.\\n--- Cómo Validar tu Configuración ---\\nDespués de aplicar los cambios, usa los botones de validación. \\n- **Validar ANDROID_HOME**: Debe mostrar la ruta que pegaste (ej. /Users/tu/Library/Android/sdk).\\n- **Validar ADB**: Debe mostrar una ruta que termine en 'platform-tools/adb'.\\n- **Validar AVD Manager**: Debe mostrar una ruta que termine en 'cmdline-tools/latest/bin/avdmanager'.\\nSi alguno falla, revisa cuidadosamente la ruta del SDK que usaste y asegúrate de haber aplicado los cambios con 'source'.`
            : `Crea una lista numerada súper clara y detallada para configurar las variables de entorno manualmente.\\n1. Abre la Configuración Avanzada del Sistema:\\n   a. Presiona la tecla de Windows, escribe 'variables de entorno' y selecciona 'Editar las variables de entorno del sistema'.\\n2. Crea la variable ANDROID_HOME:\\n   a. En la ventana de 'Propiedades del sistema', haz clic en 'Variables de entorno...'.\\n   b. En 'Variables del sistema', haz clic en 'Nueva...'.\\n   c. Nombre de la variable: 'ANDROID_HOME'.\\n   d. Valor de la variable: Pega la ruta que copiaste del SDK Manager de Android Studio (ej. 'C:\\\\Users\\\\tu_usuario\\\\AppData\\\\Local\\\\Android\\\\Sdk').\\n3. Crea la variable JAVA_HOME:\\n   a. Repite el proceso: haz clic en 'Nueva...'.\\n   b. Nombre de la variable: 'JAVA_HOME'.\\n   c. Valor de la variable: La ruta de tu JDK (ej. 'C:\\\\Program Files\\\\Java\\\\jdk-11.0.1').\\n4. Edita la variable Path:\\n   a. En 'Variables del sistema', busca y selecciona la variable 'Path' y haz clic en 'Editar...'.\\n   b. Haz clic en 'Nuevo' y añade cada una de estas líneas, UNA POR UNA:\\n      - '%ANDROID_HOME%\\\\emulator'\\n      - '%ANDROID_HOME%\\\\platform-tools'\\n      - '%ANDROID_HOME%\\\\cmdline-tools\\\\latest\\\\bin'\\n5. Guarda todo:\\n   a. Haz clic en 'Aceptar' en todas las ventanas para cerrar y guardar los cambios.\\n6. Valida la configuración:\\n   a. Abre una NUEVA ventana de terminal (CMD o PowerShell). ¡Es crucial que sea nueva para que tome los cambios!\\n   b. Usa los botones de validación. Compara la salida en tu terminal con el resultado esperado que se describe aquí:\\n      - **Validar ANDROID_HOME**: Debe mostrar la ruta que pegaste (ej. C:\\\\Users\\\\...\\\\Sdk).\\n      - **Validar ADB**: Debe mostrar una ruta que termine en 'platform-tools\\\\adb.exe'.\\n      - **Validar AVD Manager**: Debe mostrar una ruta que termine en 'cmdline-tools\\\\latest\\\\bin\\\\avdmanager.bat'.\\n   c. Si todos estos comandos muestran las rutas correctas, ¡la configuración es correcta! Si alguno falla, revisa cuidadosamente los pasos anteriores.`
        }"
    4.  **Crear el Proyecto**:
        - **title**: "Paso 4: Crear el Proyecto"
        - **explanation**: "Ahora, vamos a crear el esqueleto de tu proyecto Cordova. Este comando creará una nueva carpeta con todos los archivos iniciales que necesitas."
        - **command**: "cordova create mi-app-web com.ejemplo.miapp MiAppWeb"
        - **details**: "--- ¿Qué significa cada parte? ---\\n1. 'mi-app-web': Es el nombre de la carpeta que se creará para tu proyecto.\\n2. 'com.ejemplo.miapp': Es el identificador único de tu app, similar al que se usa en la Play Store. Es una buena práctica cambiar 'ejemplo' por tu propio dominio (ej. 'com.tunombre.miapp').\\n3. 'MiAppWeb': Es el nombre oficial de tu app, el que los usuarios verán en su teléfono.\\n--- ¿Y si la carpeta ya existe? ---\\nSi ves el error 'Path already exists', puedes borrar la carpeta existente con el comando adecuado para tu sistema:\\n- Para **${selectedOS === 'macos_linux' ? 'macOS o Linux' : 'Windows'}**, usa: '${selectedOS === 'macos_linux' ? 'rm -rf mi-app-web' : 'rmdir /s /q mi-app-web'}'\\n**Aviso**: Este comando borrará la carpeta y todo su contenido de forma permanente."
    5.  **Entrar y Añadir Plataforma**:
        - **title**: "Paso 5: Añadir la Plataforma Android"
        - **explanation**: "Ahora entraremos en la carpeta de tu nuevo proyecto y le diremos a Cordova que queremos construir una app para Android."
        - **command**: "cd mi-app-web && cordova platform add android"
        - **details**: "El comando 'cd mi-app-web' te mueve DENTRO de la carpeta del proyecto. A partir de ahora, todos los comandos deben ejecutarse desde aquí. Cordova usará la versión de Android SDK que instalaste (${androidVersion}) para configurar el proyecto."
    6.  **Verificación**:
        - **title**: "Paso 6: Verifica tu Configuración"
        - **explanation**: "Este comando es como un chequeo médico para tu configuración. Analizará tu sistema para asegurarse de que todo lo que instalaste (Java, Android SDK, etc.) está correctamente configurado y visible para Cordova. No te asustes si ves algún texto en rojo; es normal y te diremos exactamente cómo solucionarlo."
        - **command**: "cordova requirements"
        - **details**: "--- ¿Qué buscar en la Salida? ---\\nBusca en la lista que aparece. Las líneas que terminan en verde (OK) están perfectas. Si ves alguna línea en rojo (FAILED), significa que algo necesita tu atención.\\n\n--- SOLUCIÓN DE ERRORES COMUNES ---\\n1. **ERROR: 'Gradle... FAILED'**\\n   a. **Causa**: Las herramientas de línea de comandos de Android no están instaladas o no se encuentran. Esto es exactamente lo que la validación 'avdmanager' del Paso 3 intenta detectar.\\n   b. **Solución**: Abre Android Studio, ve a 'More Actions' -> 'SDK Manager' -> pestaña 'SDK Tools'. Asegúrate de que 'Android SDK Command-line Tools (latest)' esté **marcado e instalado**. Luego, reinicia tu terminal, vuelve a validar con el Paso 3 y ejecuta 'cordova requirements' de nuevo.\\n2. **ERROR: 'Android target... FAILED'**\\n   a. **Causa**: La versión específica de la plataforma de Android que Cordova busca no está instalada.\\n   b. **Solución**: Abre Android Studio, ve a 'More Actions' -> 'SDK Manager' -> pestaña 'SDK Platforms'. Busca la versión que elegiste (**${androidVersion}**) en la lista y asegúrate de que esté **marcada e instalada**. Reinicia la terminal y vuelve a intentarlo.\\n3. **ERROR: 'JAVA_HOME... FAILED'**\\n   a. **Causa**: Tu sistema no sabe dónde está instalado Java.\\n   b. **Solución**: Este es un problema con el Paso 3. Vuelve a revisar las instrucciones de 'Configuración del Entorno' para tu sistema operativo y asegúrate de haber creado y guardado las variables 'JAVA_HOME' y 'ANDROID_HOME' correctamente. ¡Recuerda abrir una **nueva** terminal después de hacer cambios!"
    7.  **Mover Archivos**:
        - **title**: "Paso 7: Añade tu Código Web"
        - **explanation**: "Es hora de mover tu proyecto web. Borra todo el contenido de la carpeta 'www' que se creó y copia allí todos tus archivos HTML, CSS y JavaScript."
        - **command**: ""
        - **details**: "La carpeta 'www' es donde vive tu app. Cordova tomará todo lo que esté aquí y lo empaquetará."
    8.  **Construir el APK**:
        - **title**: "Paso 8: Construir el APK"
        - **explanation**: "Este es el gran momento. Ejecuta este comando desde la carpeta de tu proyecto para que Cordova compile y empaquete tu código en un archivo APK instalable."
        - **command**: "cordova build android"
        - **details**: "Este proceso puede tardar unos minutos la primera vez, ya que descargará las herramientas necesarias (como Gradle). Si todo va bien, verás un mensaje de 'BUILD SUCCESSFUL'."
    9.  **Encontrar el APK**:
        - **title**: "Paso 9: ¡Encuentra tu APK!"
        - **explanation**: "¡Felicidades! Tu APK está listo. Lo encontrarás dentro de la carpeta de tu proyecto en la siguiente ruta. Puedes arrastrar este archivo a tu teléfono Android para instalarlo."
        - **command**: "platforms/android/app/build/outputs/apk/debug/app-debug.apk"
        - **details**: "El término 'debug' significa que es una versión de prueba. Para publicar en la Play Store, necesitarás crear una versión 'release' firmada, pero para probar, ¡esto es perfecto!"
    10. **¡Lo Lograste! Próximos Pasos**:
        - **title**: "Paso 10: ¡Lo Lograste! Próximos Pasos"
        - **explanation**: "¡Excelente trabajo! Has convertido tu proyecto web en una app de Android. Como próximo paso, puedes abrir el archivo \`config.xml\` en la raíz de tu proyecto para personalizar cosas como el nombre de la app, el autor y el icono."
        - **command**: ""
        - **details**: ""
    11. **Icono de la App (Opcional)**: El paso final.
        - **title**: "Paso 11: Un Icono para tu App (Opcional)"
        - **explanation**: "¡Aquí tienes un icono sugerido para tu nueva app! Guarda el siguiente código como un archivo (por ejemplo, 'www/img/icon.svg') y luego añade esta línea dentro de la etiqueta ${'<widget>'} en tu archivo 'config.xml' para usarlo: ${'<icon src=\\"www/img/icon.svg\\" />'}"
        - **command**: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4ade80;" /><stop offset="100%" style="stop-color:#22d3ee;" /></linearGradient></defs><path fill="url(#g)" d="M85,5H15C9.5,5,5,9.5,5,15v70c0,5.5,4.5,10,10,10h70c5.5,0,10-4.5,10-10V15C95,9.5,90.5,5,85,5z M50,87.5 c-4.1,0-7.5-3.4-7.5-7.5s3.4-7.5,7.5-7.5s7.5,3.4,7.5,7.5S54.1,87.5,50,87.5z M80,65H20V20h60V65z" /><path fill="white" d="M48.6,48.2l-8-10.7c-0.8-1-2-1.6-3.3-1.6c-2.2,0-4,1.8-4,4v0.2h5.3l5.5,7.3l-6.8,9.1h-5.9v0.2c0,2.2,1.8,4,4,4 c1.3,0,2.5-0.6,3.3-1.6l8-10.7C49.5,50.8,49.5,49.2,48.6,48.2z M69.6,36.1h-5.9v0.2c0,2.2,1.8,4,4,4c1.3,0,2.5-0.6,3.3-1.6l8-10.7 c0.8-1,0.8-2.6,0-3.6l-8-10.7c-0.8-1-2-1.6-3.3-1.6c-2.2,0-4,1.8-4,4v0.2h5.9l6.8,9.1L69.6,36.1z" transform="translate(0, 5)"/></svg>\`
        - **details**: ""
        - **actions**: []
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
    
    const text = response.text;
    if (typeof text !== 'string' || !text.trim()) {
      console.error("La respuesta de la API de Gemini estaba vacía o no era una cadena de texto:", text);
      throw new Error("La IA devolvió una respuesta vacía o con un formato inesperado.");
    }
    
    try {
        return JSON.parse(text) as Step[];
    } catch (parseError) {
        console.error("Error al analizar el JSON de la API de Gemini. Respuesta de texto sin procesar:", text);
        throw new Error("La IA devolvió una respuesta con formato incorrecto (JSON inválido).");
    }

  } catch (error) {
    console.error("Error al llamar a la API de Gemini o al procesar su respuesta:", error);
     if (error instanceof Error && (error.message.includes("JSON") || error.message.includes("inesperado"))) {
        throw error;
    }
    throw new Error("No se pudo obtener una respuesta estructurada de la IA. El proyecto podría ser demasiado complejo o la API no está disponible actualmente.");
  }
}