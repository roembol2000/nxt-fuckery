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

const btnRequestDevice = document.querySelector("#btn_request_device");
const btnGetDevices = document.querySelector("#btn_get_devices");

btnRequestDevice.addEventListener("click", RequestDevice);
btnGetDevices.addEventListener("click", GetDevices);
