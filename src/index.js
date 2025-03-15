const consoleElement = document.querySelector("#console");

const print = (text = "") => {
  const lineDiv = document.createElement("div");
  lineDiv.innerHTML = `> ${text}`;
  lineDiv.classList.add("console-line");

  consoleElement.appendChild(lineDiv);

  consoleElement.scrollTop = consoleElement.scrollHeight;
};

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

const ConnectToNXT = async () => {
  try {
    print("Requesting connection..");
    const device = await navigator.usb.requestDevice({
      filters: [{ vendorId: 0x0694 }], // LEGO
    });

    print("Attempting to communicate..");

    await device.open();

    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    await device.claimInterface(0);

    const command = new Uint8Array([
      0x01, // system command, reply required
      0x88, // get firmware version
    ]);

    // Expected output:
    // 0: 0x02
    // 1: 0x88
    // 2: status, 0 equals success, otherwise indicates error message
    // 3: minor version of protocol
    // 4: major version of protocol
    // 5: minor version of firmware
    // 6: major version of firmware
    //
    // from the lego mindstorms nxt communication protocol docs

    await device.transferOut(1, command);

    console.log(device.configuration.interfaces[0]);

    const result = await device.transferIn(2, 64);

    print("Received data!");

    const bytes = new Uint8Array(result.data.buffer);

    const data = {
      minorProtocol: bytes[3],
      majorProtocol: bytes[4],
      minorFirmware: bytes[5],
      majorFirmware: bytes[6],
    };

    print("Firmware and protocol version:");
    print(
      `Protocol version: <b>${data.majorProtocol}.${data.minorProtocol}</b>; Firmware version: <b>${data.majorFirmware}.${data.minorFirmware}</b>`
    );
    print();

    await device.close();
  } catch (error) {
    console.error(error);
    print(`Error: ${error}`);
    print();
  }
};

const btnGetDevices = document.querySelector("#btn_get_devices");
const btnConnectToNxt = document.querySelector("#btn_connect_to_nxt");

btnGetDevices.addEventListener("click", GetDevices);
btnConnectToNxt.addEventListener("click", ConnectToNXT);

print("This is the output console");
print();
