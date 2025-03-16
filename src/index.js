import Nxt from "./nxt.js";
import { print } from "./util.js";

const consoleElement = document.querySelector("#console");

const GetDevices = () => {
  print("Finding paired devices");
  navigator.usb.getDevices().then((devices) => {
    devices.forEach((device, index) => {
      print(`Device ${index}:`);
      print(`Product name:        ${device.productName}`);
      print(`Manufacturer name:   ${device.manufacturerName}`);
      print(`Serial:              ${device.serialNumber}`);
    });
    print();
  });
};

const brick = new Nxt();

const btnGetDevices = document.querySelector("#btn_get_devices");
const btnConnectToNxt = document.querySelector("#btn_connect_to_nxt");
const btnGetFirmware = document.querySelector("#btn_get_firmware");

btnGetDevices.addEventListener("click", GetDevices);
btnConnectToNxt.addEventListener("click", () => brick.connect("usb"));
btnGetFirmware.addEventListener("click", async () => {
  const firmwareVersion = await brick.getFirmwareVersion();
  print(JSON.stringify(firmwareVersion));
  print();
});

print("This is the output console");
print();
