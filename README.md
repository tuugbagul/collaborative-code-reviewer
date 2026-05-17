# Collaborative Code Reviewer

A real-time collaborative code review platform built with a microservices architecture. Multiple users can join shared rooms, write code together, analyze it with a linter, and leave comments — all in real time.

## Features

- Real-time collaborative code editing (Socket.io)
- Python analysis via Pylint (real lint errors and warnings)
- JavaScript analysis via custom regex rules (var, ==, console.log, debugger, etc.)
- Live comment panel per room
- JWT-based authentication
- Room creation and joining via lobby page
- Dark gradient UI with Monaco Editor

## Architecture

| Service | Tech | Port |
|---|---|---|
| Frontend | React, Monaco Editor | 3006 |
| API Gateway | Express.js | 3000 |
| Auth Service | Express.js, MongoDB, JWT | 3001 |
| Analysis Service | FastAPI, Pylint | 3007 |
| Collaboration Service | Socket.io | 3003 |

## Getting Started

### Prerequisites

- Node.js
- Python 3.10+
- MongoDB (running locally)

### 1. Auth Service

```bash
npm install
node index.js
```

Requires a `.env` file in the root:
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/codereview
JWT_SECRET=c0d3r3v13w_jwt_s3cr3t_k3y_2024
```

### 2. API Gateway

```bash
cd api-gateway
npm install
node index.js
```

`api-gateway/.env`:
```
PORT=3000
JWT_SECRET=c0d3r3v13w_jwt_s3cr3t_k3y_2024
AUTH_SERVICE_URL=http://localhost:3001
ANALYSIS_SERVICE_URL=http://localhost:3007
```

### 3. Analysis Service

```bash
cd analysis-service
pip install -r requirements.txt
python main.py
```

### 4. Collaboration Service

```bash
cd collaboration-service
npm install
node index.js
```

### 5. Frontend

```bash
cd frontend
npm install
npm start
```

`frontend/.env`:
```
PORT=3006
```

Open [http://localhost:3006](http://localhost:3006)

## Usage

1. Register an account and log in
2. On the Lobby page, create a new room or join an existing one with a Room ID
3. Share the Room ID with teammates — they can join from the Lobby
4. Write code in the editor (JavaScript or Python)
5. Click **Analyze Code** to run the linter
6. Leave comments in the panel on the right
