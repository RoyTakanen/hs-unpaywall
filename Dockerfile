FROM node:16 as build

WORKDIR /app

COPY package*.json .

RUN npm install

RUN npm prune --production

COPY *.js .

RUN mkdir data

FROM gcr.io/distroless/nodejs:16

WORKDIR /app

COPY --from=build /app .

CMD ["."]