# Usar una imagen base de Nginx para servir archivos estáticos
FROM nginx:alpine

# Eliminar configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos de la aplicación al directorio predeterminado de Nginx
COPY . /usr/share/nginx/html

# Exponer el puerto 80 para el contenedor
EXPOSE 80

# Comando predeterminado para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]