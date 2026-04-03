# re-chat frontend

Simple frontend to LLM for learning. Built using npm, Vite, React, Nginx, Docker.

## TODO list
- add clear chat button in the GUI
- test with DeepSeek

## Development

0. **Prerequisites**
- Node.js 20+
- Docker & Docker Compose

1. **Install dependencies**
   ```bash
   npm install
   ```
   run `npm audit fix` if there are critical vulnerabilities

2. **Start development server**
   ```bash
   npm run dev
   ```
   connect to ```http://localhost:5173/``` (port may change)


## Production

- build docker image
  ```bash
  # Build app
  npm run build

  # package it in a docker image
  docker build -t re-chat-wfe .
  ```
- run it
  ```
  docker run -p 3000:3000 --name rc-be rec-wfe
  ```