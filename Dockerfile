FROM node:24-alpine

# Khởi tạo thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json để tận dụng Docker cache
COPY package*.json ./

# Cài đặt tất cả các thư viện node_modules
RUN npm install --omit=dev --ignore-scripts

# Sao chép toàn bộ mã nguồn vào thư mục làm việc của container
COPY . .

# Expose cổng 1337 của Sails.js ra bên ngoài container
EXPOSE 1337

# Khởi chạy server Sails.js
CMD ["node", "app.js"]
