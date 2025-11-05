# =========================
# 1️⃣ Stage 1: Build app
# =========================
FROM node:20-alpine AS builder

# Tạo thư mục làm việc
WORKDIR /app

# Copy file cấu hình và cài dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy toàn bộ source code
COPY . .

# Build app
RUN npm run build


# =========================
# 2️⃣ Stage 2: Serve with nginx
# =========================
FROM nginx:1.27-alpine

# Copy file build sang thư mục Nginx (đúng đường dẫn build/)v
COPY --from=builder /app/build /usr/share/nginx/html

# (Tuỳ chọn) Copy file nginx.conf nếu cần SPA routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở port 80
EXPOSE 80

# Chạy nginx
CMD ["nginx", "-g", "daemon off;"]
