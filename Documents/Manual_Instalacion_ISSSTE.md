# Manual de instalación y puesta en marcha

## Plataforma de Crecimiento y Desarrollo Saludable --- ISSSTE

**Entorno local:** WSL 2, Ubuntu, Node.js, Express, React Admin, MySQL y
HTTPS.

Este manual explica cómo instalar y ejecutar el proyecto desde una
clonación del repositorio. Incluye la configuración de MySQL, las
dependencias, las variables de entorno, los certificados HTTPS y el
acceso al sistema.

> **Importante:** los comandos están pensados para ejecutarse en una
> terminal de Ubuntu dentro de WSL. Sustituye los valores de ejemplo,
> como `URL_DEL_REPOSITORIO` y `NOMBRE_DEL_REPOSITORIO`, por los valores
> reales.

## 1. Estructura del proyecto

La estructura relevante del repositorio es:

``` text
Repositorio/
├── Documents/
├── Proyecto/
│   ├── Backend/
│   │   └── api.js
│   └── Frontend/
│       ├── src/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── layout/
│       │   ├── pages/
│       │   │   └── .env
│       │   ├── App.tsx
│       │   └── dataProvider...
│       ├── public/
│       ├── .env
│       ├── package.json
│       └── vite.config.ts
└── db/
    ├── padronmysql (Propuesta1).sql
    └── datos_dummy_issste_validado.sql
```

`Documents` no es necesaria para ejecutar la aplicación. El backend no
cuenta actualmente con `package.json`, por lo que se creará durante la
instalación.

## 2. Requisitos previos

Se utilizarán WSL 2 con Ubuntu, Git, Node.js 24.19.0, npm, MySQL Server
y OpenSSL.

### 2.1. Actualizar Ubuntu e instalar herramientas

``` bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git openssl curl
```

Comprueba que Git y OpenSSL estén disponibles:

``` bash
git --version
openssl version
```

### 2.2. Instalar Node.js 24.19.0

Se recomienda NVM para administrar Node.js sin modificar directamente
los paquetes del sistema.

``` bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 24.19.0
nvm use 24.19.0
nvm alias default 24.19.0
```

Comprueba las versiones:

``` bash
node -v
npm -v
```

`node -v` debe mostrar `v24.19.0`.

## 3. Clonar el repositorio

Ve a la carpeta donde quieras guardar el proyecto, por ejemplo, tu
directorio personal:

``` bash
cd ~
git clone URL_DEL_REPOSITORIO
cd NOMBRE_DEL_REPOSITORIO
ls
```

Reemplaza `URL_DEL_REPOSITORIO` por la URL real del repositorio y
`NOMBRE_DEL_REPOSITORIO` por la carpeta creada al clonarlo. Comprueba
que aparecen las carpetas `Proyecto` y `db`.

A partir de aquí, los comandos se ejecutan desde la raíz del
repositorio, salvo cuando se indique otra carpeta.

## 4. Instalar y configurar MySQL

### 4.1. Instalar e iniciar MySQL Server

``` bash
sudo apt update
sudo apt install -y mysql-server
sudo service mysql start
sudo service mysql status
```

Si el estado muestra `active (running)`, MySQL está activo. Si ya estaba
instalado, basta con iniciarlo y comprobar su estado.

### 4.2. Crear la base de datos

En Ubuntu, normalmente se puede acceder como administrador mediante
autenticación del sistema:

``` bash
sudo mysql
```

Para salir del cliente de MySQL, ejecuta `EXIT;`. Después, desde la raíz
del repositorio, ejecuta el archivo SQL que crea la base de datos y sus
tablas:

``` bash
sudo mysql < "db/padronmysql (Propuesta1).sql"
```

El archivo ya contiene `CREATE DATABASE issste_padron ...` y
`USE issste_padron;`, por lo que no hace falta crear la base de datos
manualmente.

Comprueba que existe:

``` bash
sudo mysql -e "SHOW DATABASES LIKE 'issste_padron';"
```

### 4.3. Crear el usuario de MySQL y conceder privilegios

Este manual usa `usuario` y `password` como valores de ejemplo. Puedes
sustituir `password` por una contraseña local más segura, siempre que
también la actualices en el `.env` del backend.

``` bash
sudo mysql
```

Dentro del cliente, ejecuta:

``` sql
CREATE USER 'usuario'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'usuario'@'127.0.0.1' IDENTIFIED BY 'password';

GRANT ALL PRIVILEGES ON issste_padron.* TO 'usuario'@'localhost';
GRANT ALL PRIVILEGES ON issste_padron.* TO 'usuario'@'127.0.0.1';

EXIT;
```

Se crean las dos cuentas para cubrir conexiones mediante `localhost` y
`127.0.0.1`. Los privilegios se limitan a la base de datos
`issste_padron`; no se conceden privilegios administrativos sobre todas
las bases de datos del servidor.

Si ejecutas de nuevo `CREATE USER` y la cuenta ya existe, MySQL
informará del error correspondiente. En ese caso, no repitas esas
instrucciones sin revisar el usuario existente.

### 4.4. Comprobar la conexión

Desde la raíz del repositorio:

``` bash
mysql -h 127.0.0.1 -u usuario -p issste_padron
```

Introduce la contraseña cuando se solicite. Si aparece `mysql>`, la
conexión funciona. Comprueba las tablas y sal:

``` sql
SHOW TABLES;
EXIT;
```

### 4.5. Insertar los datos dummy

Desde la raíz del repositorio:

``` bash
mysql -h 127.0.0.1 -u usuario -p issste_padron < "db/datos_dummy_issste_validado.sql"
```

Introduce la contraseña de MySQL cuando se solicite. El archivo carga
los datos de prueba en `issste_padron`.

Antes de iniciar sesión en la aplicación, confirma cuáles son las
credenciales de prueba definidas por el proyecto. No inventes una
contraseña ni insertes directamente un usuario sin conocer el formato de
contraseña que verifica el backend.

Para efectos de la pureba del sistema, el usuario que puedes usar como autorizado en el sistema es el siguiente:

**usuario:**	usuario01@example.com	

**contraseña:** 2b84289294a8123e347a77cece5c1ec052de66874e12191c90dc6dce350c0020

Todos los demás usuarios se recomienda crearlos desde esta cuenta. Debido a que son datos dummy, pueden no tener sentido, pues su función es probar el sistema.

**NOTA IMPORTANTE:** en la prueba del sistema, ignora todos los roles que no sean "administrador", "estancia", "coordinador_regional" o "tutor".

## 5. Crear el archivo `.env` del backend

La ruta es `Proyecto/Backend/.env`.

``` bash
cd Proyecto/Backend
nano .env
```

Contenido:

``` dotenv
JWT_SECRET=REEMPLAZAR_POR_UN_SECRETO_ALEATORIO
DB_HOST=127.0.0.1
DB_USER=usuario
DB_PASSWORD=password
DB_NAME=issste_padron
PORT=3000
```

Genera un secreto JWT nuevo:

``` bash
openssl rand -hex 32
```

Copia la cadena aleatoria generada y reemplaza
`REEMPLAZAR_POR_UN_SECRETO_ALEATORIO` en `.env`. La cadena será de 64
caracteres hexadecimales. No uses literalmente el texto de ejemplo.

Asegúrate de que `DB_USER` y `DB_PASSWORD` coincidan con las
credenciales creadas en MySQL. En `nano`, guarda con `Ctrl + O`,
presiona `Enter` y sal con `Ctrl + X`.

Puedes comprobar que el archivo existe con `ls -la`. Evita publicar el
secreto JWT o compartir el contenido del archivo.

## 6. Crear el `package.json` e instalar dependencias del backend

El backend no tiene actualmente `package.json`. Desde
`Proyecto/Backend`, ejecuta:

``` bash
npm init -y
npm install express cors mysql2 dotenv body-parser argon2 jsonwebtoken
```

Los módulos `fs` y `https` utilizados por `api.js` son nativos de
Node.js y no necesitan instalarse con npm.

Abre el archivo:

``` bash
nano package.json
```

Busca la propiedad `scripts` y déjala así, conservando las demás
propiedades del archivo, incluidas `dependencies` y `version`:

``` json
"scripts": {
  "start": "node api.js"
}
```

Guarda los cambios. La carpeta debe contener `api.js`, `package.json`,
`package-lock.json` y `.env`. Los certificados se crearán en la sección
8.

## 7. Configurar e instalar el frontend

### 7.1. Crear los archivos `.env`

El frontend tiene dos archivos `.env` según la estructura actual del
proyecto. Desde la raíz del repositorio:

``` bash
cd Proyecto/Frontend
nano .env
```

Contenido:

``` dotenv
VITE_BACKEND=https://localhost:3000
```

Guarda el archivo. Después crea el archivo de la carpeta `src/pages`:

``` bash
nano src/pages/.env
```

Contenido:

``` dotenv
VITE_BACKEND=https://localhost:3000
```

Guarda el archivo.

**Nota técnica:** Vite carga normalmente variables de entorno desde la
raíz del proyecto, no desde cualquier subcarpeta. Conservamos ambos
archivos por la estructura actual que utiliza el proyecto, pero el
archivo de `src/pages` no se carga automáticamente solo por existir. Si
`authProvider` depende de `import.meta.env`, verifica que la variable se
esté leyendo realmente. No elimines ninguno de los archivos sin
comprobar el funcionamiento.

### 7.2. Instalar las dependencias

Desde `Proyecto/Frontend`, ejecuta:

``` bash
npm install --legacy-peer-deps
```

La opción `--legacy-peer-deps` se utiliza porque el paquete de
traducción al español presenta conflictos de compatibilidad entre
dependencias de pares con la configuración actual de React Admin.

Si necesitas instalar específicamente el traductor, puedes ejecutar:

``` bash
npm install @blackbox-vision/ra-language-spanish --legacy-peer-deps
```

No necesitas ejecutar el segundo comando si el paquete ya está instalado
y la instalación general terminó correctamente.

Comprueba que existen `package.json`, `package-lock.json` (si npm lo
generó), `vite.config.ts`, `src`, `public`, `.env` y `node_modules`.

## 8. Generar y copiar los certificados HTTPS

Los servidores utilizan los siguientes nombres:

  Servidor   Clave privada    Certificado
  ---------- ---------------- ----------------
  Backend    `backend.key`    `backend.crt`
  Frontend   `frontend.key`   `frontend.crt`

### 8.1. Generar los certificados del backend

Desde la raíz del repositorio:

``` bash
cd Proyecto/Backend
openssl req -x509 -newkey rsa:2048 -nodes -keyout backend.key -out backend.crt -days 365 -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

El comando crea la clave privada `backend.key` y el certificado
`backend.crt`, válido por 365 días. La extensión `subjectAltName`
incluye `localhost` y `127.0.0.1`.

El certificado es autofirmado. Incluir esos nombres no hace que el
navegador confíe automáticamente en él.

### 8.2. Copiar los certificados al frontend

Desde `Proyecto/Backend`:

``` bash
cp backend.key ../Frontend/frontend.key
cp backend.crt ../Frontend/frontend.crt
```

Se reutiliza el mismo certificado y clave privada con los nombres que
espera Vite. Comprueba los archivos:

``` bash
ls -l backend.key backend.crt
ls -l ../Frontend/frontend.key ../Frontend/frontend.crt
```

Estos certificados son para desarrollo local. No publiques las claves
privadas ni las incluyas en un repositorio compartido. Si ya existen
certificados, verifica antes de sobrescribirlos.

## 9. Iniciar el backend

Comprueba que MySQL esté activo:

``` bash
sudo service mysql status
```

Si no está activo:

``` bash
sudo service mysql start
```

En una terminal de Ubuntu, entra en el backend. Sustituye
`NOMBRE_DEL_REPOSITORIO` por el nombre real de la carpeta clonada:

``` bash
cd ~/NOMBRE_DEL_REPOSITORIO/Proyecto/Backend
node api.js
```

Mantén abierta la terminal. El backend debe escuchar en el puerto
`3000`.

Si falla la conexión con MySQL, revisa `DB_HOST`, `DB_USER`,
`DB_PASSWORD` y `DB_NAME` en `.env`. Si falla por certificados, verifica
que `backend.key` y `backend.crt` existan en la ubicación desde la que
`api.js` los lee.

## 10. Iniciar el frontend

Abre una segunda terminal de Ubuntu sin cerrar la terminal del backend.
Ejecuta:

``` bash
cd ~/NOMBRE_DEL_REPOSITORIO/Proyecto/Frontend
npm run dev
```

Vite debe mostrar la dirección:

``` text
https://localhost:5173/
```

La configuración establece el puerto `5173` y `strictPort: true`; si el
puerto está ocupado, Vite mostrará un error en lugar de cambiar
automáticamente a otro puerto.

Mantén abiertas las dos terminales mientras uses la aplicación: -
Backend: puerto `3000`. - Frontend: puerto `5173`.

## 11. Acceder a la aplicación

Abre en el navegador:

**Frontend:** https://localhost:5173/

### 11.1. Advertencia por certificados autofirmados

El navegador puede advertir que la conexión no es privada o que el
certificado no es de confianza. Esto se debe a que los certificados son
autofirmados; no significa necesariamente que el servidor esté apagado.

El comportamiento depende del navegador. Algunos permiten continuar
desde una pantalla de advertencia; otros pueden bloquear la carga
inicial o mostrar un error.

En una instalación anterior, la página principal no cargaba y fue
posible hacer aparecer la advertencia al entrar directamente a una ruta
del frontend. Si sucede, puedes probar:

**Ruta alternativa del frontend:** https://localhost:5173/infantes

Esta ruta puede hacer que el navegador muestre la advertencia que
necesitas resolver, aunque no se garantiza el mismo comportamiento en
todos los navegadores. Continúa solo si sabes que estás accediendo a tu
instalación local.

Si sigue sin cargar, revisa el mensaje del navegador y la terminal de
Vite. Si se necesita, habrá que revisar la confianza del certificado en
el navegador o en el sistema. Aceptar el certificado del frontend no
garantiza que el navegador confíe también en el certificado del backend.

### 11.2. Comprobar el backend

El frontend se configura para utilizar:

``` text
https://localhost:3000
```

Si la página abre pero no muestra datos o no permite iniciar sesión,
comprueba que: 1. El backend sigue ejecutándose. 2. MySQL está activo y
contiene tablas y datos. 3. El `.env` del backend contiene las
credenciales correctas. 4. El backend inició correctamente con HTTPS. 5.
El navegador no está bloqueando las peticiones al backend por el
certificado autofirmado.

### 11.3. Iniciar sesión

Utiliza las credenciales de un usuario existente en los datos dummy. Si
no las conoces, consulta los datos de prueba o la documentación del
proyecto. No presupongas que existe una contraseña de administrador
predeterminada.

Después de iniciar sesión, comprueba que se muestran los recursos
principales, como los infantes, y que las operaciones permitidas para el
rol funcionan.

## 12. Solución de problemas frecuentes

### 12.1. MySQL no está activo

``` bash
sudo service mysql start
sudo service mysql status
```

Si MySQL no arranca, revisa el registro:

``` bash
sudo journalctl -u mysql --no-pager -n 50
```

### 12.2. Error de autenticación de MySQL

Si aparece `Access denied for user`, comprueba que las credenciales de
`.env` coincidan con las cuentas creadas en MySQL. Prueba la conexión
directamente:

``` bash
mysql -h 127.0.0.1 -u usuario -p issste_padron
```

### 12.3. Error `Cannot find module`

Backend:

``` bash
cd ~/NOMBRE_DEL_REPOSITORIO/Proyecto/Backend
npm install
```

Frontend:

``` bash
cd ~/NOMBRE_DEL_REPOSITORIO/Proyecto/Frontend
npm install --legacy-peer-deps
```

Cada carpeta tiene sus propias dependencias.

### 12.4. Conflictos del traductor de React Admin

Si npm muestra `ERESOLVE`, ejecuta desde `Proyecto/Frontend`:

``` bash
npm install --legacy-peer-deps
```

Para instalar específicamente el traductor:

``` bash
npm install @blackbox-vision/ra-language-spanish --legacy-peer-deps
```

Si aparece una advertencia de React o del proveedor de traducciones en
la consola del navegador, revisa el mensaje completo. Una advertencia no
significa automáticamente que toda la aplicación haya fallado. Comprueba
si afecta a la traducción, al renderizado o a otra funcionalidad. No
cambies las versiones de React Admin o `ra-core` sin identificar primero
la causa.

### 12.5. Error al cargar los certificados

Comprueba que existan los cuatro archivos:

``` bash
ls -l ~/NOMBRE_DEL_REPOSITORIO/Proyecto/Backend/backend.key
ls -l ~/NOMBRE_DEL_REPOSITORIO/Proyecto/Backend/backend.crt
ls -l ~/NOMBRE_DEL_REPOSITORIO/Proyecto/Frontend/frontend.key
ls -l ~/NOMBRE_DEL_REPOSITORIO/Proyecto/Frontend/frontend.crt
```

Si falta alguno, repite la sección 8. Si el navegador rechaza la
conexión, comprueba la vigencia y que el certificado incluya `localhost`
en sus nombres alternativos. Recuerda que un certificado autofirmado no
se vuelve confiable automáticamente.

### 12.6. El puerto 5173 está ocupado

``` bash
sudo ss -ltnp | grep ':5173'
```

Identifica el proceso que utiliza el puerto y detenlo de forma
controlada antes de iniciar Vite de nuevo.

### 12.7. El frontend abre, pero no muestra datos

Comprueba: 1. MySQL está activo y contiene tablas y datos dummy. 2. El
backend está ejecutándose en el puerto `3000`. 3. La URL del backend
está configurada como `https://localhost:3000`. 4. El navegador permite
la conexión HTTPS al backend. 5. La sesión y el token de autenticación
son válidos.

Si sigue fallando, abre las herramientas de desarrollo del navegador con
`F12` y revisa la pestaña **Network**. Los códigos HTTP y los mensajes
de las peticiones ayudan a distinguir entre problemas de autenticación,
permisos, conexión o respuestas de la API.

## 13. Archivos que deben conservarse o generarse

  -----------------------------------------------------------------------
  Archivo                             Acción
  ----------------------------------- -----------------------------------
  `Frontend/package.json`             Viene en el repositorio

  `Frontend/package-lock.json`        Conservarlo si existe; npm puede
                                      generarlo durante la instalación

  `Backend/package.json`              Crear durante la instalación

  `Backend/package-lock.json`         Se genera al instalar dependencias

  `Backend/.env`                      Crear y configurar

  `Frontend/.env`                     Crear y configurar

  `Frontend/src/pages/.env`           Crear según la estructura actual

  `Backend/backend.key` y             Generar localmente
  `backend.crt`                       

  `Frontend/frontend.key` y           Copiar desde los certificados del
  `frontend.crt`                      backend
  -----------------------------------------------------------------------

Los archivos `.env` contienen credenciales y secretos. Las claves
privadas HTTPS tampoco deben publicarse. Comprueba que los `.gitignore`
correspondientes los excluyan cuando corresponda.

Para que las instalaciones futuras sean más reproducibles, conviene
conservar los `package-lock.json` generados después de verificar que la
instalación funciona.

## 14. Lista final de comprobación

-   [ ] Repositorio clonado; existen las carpetas `Proyecto` y `db`.
-   [ ] Node.js instalado; `node -v` muestra `v24.19.0`.
-   [ ] MySQL está activo.
-   [ ] La base `issste_padron` está creada y contiene sus tablas.
-   [ ] El usuario de MySQL puede conectarse y tiene privilegios sobre
    la base.
-   [ ] Los datos dummy se cargaron correctamente.
-   [ ] Existe `Proyecto/Backend/.env` con las variables necesarias.
-   [ ] Se instaló el backend y se creó su `package.json`.
-   [ ] Existen los dos archivos `.env` del frontend.
-   [ ] Los cuatro archivos de certificados existen en las carpetas
    correctas.
-   [ ] El backend está ejecutándose en el puerto `3000`.
-   [ ] El frontend está ejecutándose en el puerto `5173`.
-   [ ] La aplicación abre y permite iniciar sesión.

## 15. Consideraciones finales

Este manual está destinado al desarrollo local en WSL con Ubuntu. Los
certificados autofirmados, las credenciales de ejemplo y la
configuración de puertos son para ese entorno, no para producción.

Para un despliegue real habría que revisar la gestión de secretos, los
certificados confiables, los permisos de MySQL y la configuración de
seguridad.

**Nota:** el procedimiento se ha elaborado a partir de la estructura y
los fragmentos de configuración proporcionados. Si el repositorio tiene
un `.gitignore`, un `package-lock.json` o scripts adicionales no
mencionados, conviene comprobarlos durante la primera instalación.
