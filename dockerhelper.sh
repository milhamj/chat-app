docker build -t milhamj/chat-app:latest .
docker stop chat-app
docker rm chat-app
docker run -d -p 3000:8080 --name chat-app milhamj/chat-app:latest