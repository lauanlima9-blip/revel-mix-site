FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN mkdir -p uploads
EXPOSE 4000
CMD ["sh","-c","npx prisma db push && npm run seed && npm start"]
