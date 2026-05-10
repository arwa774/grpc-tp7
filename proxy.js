'use strict';
const express = require('express');
const path = require('node:path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const app = express();
app.use(express.json());

const PROTO_PATH = path.join(__dirname, 'hello.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const helloProto = grpc.loadPackageDefinition(packageDefinition).hello;

const client = new helloProto.Greeter(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Route HTTP qui appelle le service gRPC
app.post('/sayhello', (req, res) => {
  const name = req.body.name || 'inconnu';
  client.sayHello({ name }, (err, response) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

app.listen(3000, () => {
  console.log('Reverse Proxy HTTP démarré sur http://localhost:3000');
});