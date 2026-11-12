
# Build Angular
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npm run build

# Serve Angular using Nginx
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/bharattools/browser /usr/share/nginx/html

RUN if [ -f /usr/share/nginx/html/index.csr.html ]; then \
    cp /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    fi

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
