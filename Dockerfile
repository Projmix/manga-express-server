# Используем образ дистрибутив Debian с Node.js
FROM node:20.16.0-bullseye-slim

# Указываем нашу рабочую дерикторию
WORKDIR /app

# Копируем package.json и package-lock.json внутрь контейнера
COPY package*.json ./

# Удалить node_modules, если они есть 
RUN rm -rf node_modules

# Устанавливаем зависимости
RUN npm install

# Копируем оставшееся приложение в контейнер
COPY . .

# Устанавливаем Prisma
RUN npm install -g prisma

# Генерируем Prisma client
RUN prisma generate

# Копируем Prisma schema и URL базы данных в контейнер
COPY prisma/schema.prisma ./prisma/

# Открываем порт 8000 в нашем контейнере
EXPOSE 3000

# Запускаем сервер
CMD [ "npm", "start" ]
