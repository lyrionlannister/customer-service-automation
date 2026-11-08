FROM docker.io/library/node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json ./
RUN pnpm install --cpu=x64 --os=linux
COPY . .
RUN pnpm run build

FROM docker.io/library/nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
