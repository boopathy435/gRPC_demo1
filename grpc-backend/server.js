const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const reflection = require('@grpc/reflection');
const { service, HealthImplementation } = require('grpc-health-check');

// Load proto file
const PROTO_PATH = './protos/monitoring.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const monitoringProto = grpc.loadPackageDefinition(packageDefinition).monitoring;

// Dummy monitoring data
const monitoringData = [
  { cpuUsage: 25.3, memoryUsage: 70.2, networkIn: 120, networkOut: 85 },
  { cpuUsage: 30.1, memoryUsage: 75.8, networkIn: 140, networkOut: 95 }
];

// Implement your service methods (example)
function getStatus(call, callback) {
  callback(null, { message: 'Service is running' });
}

// Implement GetMonitoringData
function getMonitoringData(call) {
  monitoringData.forEach((data) => {
    call.write(data);
  });
  call.end();
}

// Create gRPC server
const server = new grpc.Server();
server.addService(monitoringProto.MonitoringService.service, { GetMonitoringData: getMonitoringData,getStatus });

const PORT = 50051;

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error(`Failed to bind server: ${err.message}`);
    return;
  }
  console.log(`gRPC server running on http://localhost:${port}`);
  server.start();
});
