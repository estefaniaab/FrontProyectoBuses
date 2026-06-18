# Usa la imagen oficial de Node.js en su versión ligera Alpine
FROM node:20-alpine

# Define /app como el directorio de trabajo interno en el contenedor
WORKDIR /app

# Copia los archivos de dependencias para aprovechar la caché de capas de Docker
COPY package*.json ./

# Instala todas las dependencias del proyecto Angular
RUN npm install

# Copia todo el código fuente local hacia el contenedor
COPY . .

# Documenta que la aplicación de desarrollo usará el puerto 4200
EXPOSE 4200

# Comando por defecto para levantar el servidor de desarrollo de Angular
# --host 0.0.0.0 permite que el contenedor acepte conexiones externas de tu máquina
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]
