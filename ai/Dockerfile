FROM rust:slim-bullseye

WORKDIR /app

COPY . .

RUN cargo install --path .

CMD ["ai", "serve"]