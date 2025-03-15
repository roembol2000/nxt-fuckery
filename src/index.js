const consoleElement = document.querySelector("#console");

const print = (text = "") => {
  const lineDiv = document.createElement("div");
  lineDiv.textContent = `> ${text}`;
  lineDiv.classList.add("console-line");

  consoleElement.appendChild(lineDiv);

  consoleElement.scrollTop = consoleElement.scrollHeight;
};

const RequestDevice = () => {
  navigator.usb
    // .requestDevice({ filters: [{ vendorId: 0x2341 }] }) //arduiono micro
    .requestDevice({ filters: [{ vendorId: 0x0694 }] }) // LEGO
    .then((device) => {
      console.log(device.productName);
      console.log(device.manufacturerName);
      console.log(device);
    })
    .catch((error) => {
      console.error(error);
    });
};

const GetDevices = () => {
  navigator.usb.getDevices().then((devices) => {
    devices.forEach((device) => {
      console.log(device.productName); // "Arduino Micro"
      console.log(device.manufacturerName); // "Arduino LLC"
      console.log(device.serialNumber);
      console.log(device);
    });
  });
};

const ConnectToNXT = async () => {
  try {
    const device = await navigator.usb.requestDevice({
      filters: [{ vendorId: 0x0694 }], // LEGO
    });

    await device.open();

    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    await device.claimInterface(0);

    const command = new Uint8Array([
      0x01, // direct command (with response)
      0x88, // get battery level
    ]);

    await device.transferOut(1, command);

    console.log(device.configuration.interfaces[0]);

    const result = await device.transferIn(2, 64);

    const bytes = new Uint8Array(result.data.buffer);

    const data = {
      minorProtocol: bytes[3],
      majorProtocol: bytes[4],
      minorFirmware: bytes[5],
      majorFirmware: bytes[6],
    };

    print();
    print("Firmware and protocol version:");
    print(JSON.stringify(data));

    // const batteryLevel = result.data.getUint16(3, true);

    // console.log(batteryLevel);

    await device.close();
  } catch (error) {
    console.error(error);
  }
};

const btnRequestDevice = document.querySelector("#btn_request_device");
const btnGetDevices = document.querySelector("#btn_get_devices");
const btnConnectToNxt = document.querySelector("#btn_connect_to_nxt");

btnRequestDevice.addEventListener("click", RequestDevice);
btnGetDevices.addEventListener("click", GetDevices);
btnConnectToNxt.addEventListener("click", ConnectToNXT);

print("This is the output console");
