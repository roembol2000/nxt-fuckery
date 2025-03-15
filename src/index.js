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
      0x02, // command length (2 bytes)
      0x00, // command length continued
      0x00, // direct command (with response)
      0x0b, // get battery level
    ]);

    await device.transferOut(1, command);

    const result = await device.transferIn(1, 5);

    const batteryLevel = result.data.getUint16(3, true);

    console.log(batteryLevel);

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
