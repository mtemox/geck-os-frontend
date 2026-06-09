# 🦎 Geck-OS Frontend

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
</div>

<br />

¡Bienvenido a **Geck-OS**, una experiencia inmersiva de sistema operativo directamente en tu navegador! Desarrollado con tecnologías web modernas, ofrece una interfaz fluida, personalizable y repleta de aplicaciones.

## ✨ Características Principales

- 🖥️ **Interfaz de Sistema Operativo:** Entorno de escritorio completo con Menú de Inicio, Barra de Tareas y Gestión de Ventanas.
- 🎨 **Personalización Profunda:** 
  - Soporte completo para Modo Claro ☀️ y Oscuro 🌙.
  - Generador de fondos de pantalla integrado utilizando Inteligencia Artificial (Stable Diffusion).
  - Integración directa con **Unsplash** para fondos en alta calidad.
  - Selector de color de acento para todo el sistema.
- 📁 **Sistema de Archivos en la Nube:** Navega, sube y gestiona tus archivos de forma segura.
- 💬 **Geck Chat:** Comunicación interactiva con asistencia IA en tiempo real.
- 💻 **Code Editor:** Escribe y compila código directamente desde la web.
- 📝 **Word Editor:** Procesador de textos avanzado.
- 🔐 **Autenticación Segura:** Inicio de sesión con correo, Google, restablecimiento de contraseñas.

## 🛠️ Tecnologías Utilizadas

- **Core:** React, Vite
- **Estilos:** Tailwind CSS, soporte avanzado de temas con variables.
- **Iconografía:** Lucide React
- **Peticiones HTTP:** Hook personalizado (`useFetch`) integrado con el Backend Express.
- **Notificaciones UI:** Sileo
- **Gestión de Estado Global:** Zustand y Context API

## 🚀 Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo del frontend en tu máquina local.

### Prerrequisitos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 16+ o superior recomendada).

### 1. Instalar dependencias

Abre la terminal en la raíz de `geck-os-frontend` y ejecuta:

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz de `geck-os-frontend` y añade las credenciales necesarias (Asegúrate de que el Backend esté corriendo en el puerto configurado):

```env
VITE_BACKEND_URL=http://localhost:3000/api
VITE_OPENWEATHER_API_KEY=tu_api_key_aqui
VITE_NEWS_API_KEY=tu_api_key_aqui
VITE_UNSPLASH_API_KEY=tu_api_key_aqui
VITE_STRIPE_PUBLIC_KEY=tu_stripe_public_key
CLIENT_ID_COMPILER=tu_client_id
CLIENT_SECRET_COMPILER=tu_client_secret
```

### 3. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible por defecto en `http://localhost:5173`.

## 📂 Estructura del Proyecto

El código fuente está estructurado principalmente dentro de `src/`:

- `/core`: Componentes, contextos, hooks (`useFetch`) globales y tiendas (Zustand).
- `/features`: La lógica central de negocio dividida por dominios (apps, auth, desktop, file-system, workspace).
- `/assets`: Imágenes estáticas, fondos por defecto y multimedia.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Siéntete libre de clonar, mejorar o hacer un *fork* de este gran proyecto.

---
*Hecho para simular la mejor experiencia de escritorio en la web.*
