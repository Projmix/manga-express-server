# Manga Express Server

This is the backend server for the Manga project. It is built with Node.js and Express and serves as an API for managing manga data.

## Features
- REST API for managing manga information
- Data persistence using MongoDB
- Authentication and authorization
- Handles image uploads and manga file storage

## Requirements
- Node.js (v14 or above)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Projmix/manga-express-server.git
    ```
2. Navigate to the project directory:
    ```bash
    cd manga-express-server
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Create a `.env` file and set the following environment variables:
    ```bash
    PORT=3000
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    ```
5. Start the server:
    ```bash
    npm start
    ```

## API Endpoints
- `GET/POST /api/user`
- `GET/POST/PUT/DELETE /api/manga`
- `POST /api/upload`
- `POST /api/translate`

## License
This project is licensed under the MIT License.
