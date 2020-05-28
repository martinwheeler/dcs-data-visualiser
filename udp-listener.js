var udp = require("dgram");
const fs = require('fs')
const DataStorage = require('./data-storage')

// --------------------creating a udp server --------------------

// creating a udp server
var server = udp.createSocket("udp4");

// emits when any error occurs
server.on("error", function (error) {
  console.log("Error: " + error);
  server.close();
});


const getCurrentDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

const currentDate = getCurrentDate();
var fileStream = fs.createWriteStream(`./saved-logs/${currentDate}.csv`, { flags:'a' });

const saveDataToFile = (newData) => {
  const dataInCSVFormat = Object.keys(newData).map(key => {
    return newData[key];
  })
  fileStream.write(`${JSON.stringify(dataInCSVFormat.join(', '))}\r\n`);
}

// emits on new datagram msg
server.on("message", function (msg, info) {
  const newData = JSON.parse(msg.toString());
  newData.timestamp = Date.now();
  saveDataToFile(newData);
  DataStorage.data.push(newData);
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
