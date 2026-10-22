# Veliux Agency — rediseño navegable

**[Descargar versión para Windows](https://github.com/anbruanbru4-ops/Andrew-Batista/raw/refs/heads/codex/veliux-preview/downloads/Veliux-Windows.zip)**

Extraiga el ZIP y abra `Abrir-Veliux.cmd`. La descarga incluye la versión compilada y el código fuente.

Nueva dirección visual en azul profundo, lavanda y blanco perlado. Escultura 3D, vidrio, blur, ampliaciones, elementos compartidos y crossfades. El contenido comercial se obtuvo de **https://veliuxagency.com** el 22 de octubre de 2026. No se ha publicado ni modificado el sitio en producción.

## Abrir en Windows

Para **ver la versión incluida sin instalar dependencias**, extraer el ZIP y hacer doble clic en `Abrir-Veliux.cmd`. Usa Node.js y abre el navegador. Mantener la terminal abierta durante la vista previa. Este lanzador se preparó para Windows; el servidor se probó en Linux, sin acceso directo a su PC.

Para editar con actualización automática:

Extraer el proyecto en una carpeta nueva. Abrir PowerShell allí y ejecutar:

```powershell
npm.cmd ci
npm.cmd run dev
```

Abrir la dirección local que indique Vite. Los cambios se reflejan automáticamente en el navegador. Node.js 24 LTS es compatible. No requiere administrador, cambios de políticas de PowerShell ni instalaciones globales.

## Exportar

```powershell
npm.cmd run build
npm.cmd run preview
```

`dist/` contiene el sitio estático compilado. Abrir mediante un servidor HTTP, no haciendo doble clic en index.html. Publicación y dominio se configuran aparte. Se conserva `noindex` mientras sea una versión de revisión.

## Contenido conservado

- Diez elementos del catálogo, incluido el diagnóstico gratuito, con descripciones, categorías, precios USD y condiciones exactas.
- Cuatro pasos de metodología y pago 50/50.
- Siete industrias con sus problemas, soluciones y flujos.
- Quince testimonios completos, métricas y enlace original de Google.
- Cuatro respuestas de FAQ, seis preguntas sobre fugas y datos del estratega.
- Siete mensajes de la demo de WhatsApp y cuatro ejemplos de plataformas.
- Integraciones, indicadores, calculadora y WhatsApp oficial +1 (829) 616-8651.

`src/content.json` guarda los datos estructurados de la fuente. Las afirmaciones comerciales, cifras y testimonios se conservaron del sitio del propietario; no se validaron de forma independiente. No se inventaron contactos, resultados ni clientes adicionales.

## Interacciones

- 3D generado localmente, sin texturas ni APIs remotas; alternativa visual si falta WebGL.
- Detalles de servicios con View Transitions y alternativa sin animación.
- Catálogo filtrable, pestañas de industrias y demos, reseñas desplazables y FAQ desplegables.
- Calculadora con los supuestos originales: leads × 12% × tasa de pérdida × ticket; recuperación del 72%. La cifra de retorno +320% / 60 días proviene del original: no es un cálculo dinámico ni una garantía.
- Formulario con precarga de servicio o industria. Al continuar se abre un mensaje preparado en WhatsApp; el visitante revisa y envía allí. Sin almacenamiento ni envío automático de leads.
- Teclado, modales con Escape y preferencias de movimiento reducido.
- Tipografías y recursos locales. Sin servicios de pago ni analítica añadida.

## Discrepancia de la fuente

La conversación de ejemplo dice **US$450**, mientras el catálogo ofrece el agente por **US$950**. Se mantuvieron ambos textos y se añadió una aclaración junto a la demo. Confirmar el valor correcto antes de publicar. Las demos son ilustrativas; no son agentes ni plataformas conectadas en vivo.

## Verificación

`node verify.mjs` utiliza Playwright y Chromium. Comprueba escritorio y móvil (320–1440 px), WebGL, precios y textos, filtros, industrias, demos, aritmética, FAQ, enlaces, formulario, teclado y movimiento reducido. El destino de WhatsApp se intercepta localmente: **no se envían mensajes de prueba**. Capturas e informe en `test-results/`.

El verificador usa `/usr/bin/chromium`; establecer `CHROMIUM_PATH` para otro navegador. Las dependencias del sitio no requieren Chromium.

## Archivos

- `index.html`: página y estructura accesible.
- `src/style.css`, `src/refinements.css`, `src/content.css`: diseño adaptable.
- `src/main.js`: navegación, modales, panel conectado y núcleo 3D.
- `src/core.js`: módulo 3D cargado por separado para no bloquear el contenido.
- `src/interactions.js`: filtros, industrias, demos, calculadora y WhatsApp.
- `src/content.json`: inventario original de contenidos.
- `public/fonts/LICENSE-DejaVu.txt`: licencia de los símbolos.

El contenido principal está en el HTML inicial, por lo que no necesita esperar al JavaScript para mostrarse. Vite avisa del tamaño del módulo 3D (aprox. 135 KB comprimido); se descarga por separado. El CSS y el resto del JavaScript pesan aproximadamente 12 KB comprimidos cada uno.

El primer acceso al original fue bloqueado por la política de red; tras habilitarse se recuperó el contenido. Se corrigieron símbolos ausentes con una fuente local y el desbordamiento de anillos decorativos en pantallas pequeñas.
