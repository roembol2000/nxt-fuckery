import Nxt from "./nxt.js";
import { print, toHexString } from "./util.js";

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
const btnGetDeviceInfo = document.querySelector("#btn_get_device_info");
const btnSetBrickName = document.querySelector("#btn_set_brick_name");

btnGetDevices.addEventListener("click", GetDevices);

btnConnectToNxt.addEventListener("click", () => brick.connect("usb"));

btnGetFirmware.addEventListener("click", async () => {
  const firmwareVersion = await brick.getFirmwareVersion();
  print(JSON.stringify(firmwareVersion));
  print();
});

btnGetDeviceInfo.addEventListener("click", async () => {
  const deviceInfo = await brick.getDeviceInfo();
  print("Brick info:");
  print(`  Brick name:..................${deviceInfo.nxtName}`);
  // prettier-ignore
  print(`  Bluetooth address:...........${toHexString(deviceInfo.btAddress, ":")}`);
  print(`  Bluetooth signal strength:...${deviceInfo.btSignalStrength}`);
  print(`  Free user flash:.............${deviceInfo.freeUserFlash} bytes`);
  print();
});

btnSetBrickName.addEventListener("click", async () => {
  const brickName = document.querySelector("#input_brick_name").value;
  await brick.setBrickName(brickName);
  print(`Brick name set to: "${brickName}"`);
  print("Recommended to get device info to confirm!");
  print();
});

print("This is the output console");
print();
