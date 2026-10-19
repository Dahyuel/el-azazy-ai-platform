FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY main.go .
RUN go mod init uploader && go build -o uploader main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/uploader .
EXPOSE 3001
CMD ["./uploader"]
