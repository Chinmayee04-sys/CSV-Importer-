FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend/ ./backend/

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend/

EXPOSE 3001
EXPOSE 3000

CMD ["sh", "-c", "cd backend && node src/index.js & cd frontend && npm run dev"]
