FROM node:20 AS build

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/myangularapp.web/browser /usr/share/nginx/html
# Keep dist at /app/dist for Aspire PublishWithContainerFiles
COPY --from=build /app/dist/myangularapp.web/browser /app/dist

# Expose the default nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]