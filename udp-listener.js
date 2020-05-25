var udp = require("dgram");
const LocalStorage = require("node-localstorage").LocalStorage;
const localStorage = new LocalStorage("./local-storage-data");
const DataStorage = require('./data-storage')

// --------------------creating a udp server --------------------

// creating a udp server
var server = udp.createSocket("udp4");

// emits when any error occurs
server.on("error", function (error) {
  console.log("Error: " + error);
  server.close();
});

// emits on new datagram msg
server.on("message", function (msg, info) {
  const currentData = DataStorage.data;
  const newData = {
    timestamp: Date.now(),
    data: JSON.parse(msg.toString()),
  };
  DataStorage.data = currentData.concat(newData);
});

//emits when socket is ready and listening for datagram msgs
server.on("listening", function () {
  var address = server.address();
  var port = address.port;
  var ipaddr = address.address;

  console.log(`DCS data capture is running.`);
  console.log(`IP:PORT - ${ipaddr}:${port}`);
});

server.bind(41230);
