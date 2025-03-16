import { print, toHexString } from "./util.js";

/**
 * Communication interface for interacting with NXT
 */
class NxtCommunication {
  async connect() {
    throw new Error("Not implemented");
  }

  async sendCommand(command) {
    throw new Error("Not implemented");
  }

  async receiveData() {
    throw new Error("Not implemented");
  }
}

/**
 * Represents the USB interface
 *
 * @extends NxtCommunication
 */
class NxtUsbCommunication extends NxtCommunication {
  constructor() {
    super();
    this.device = null;
  }

  /**
   * Connect to the nxt brick via USB
   *
   * @async
   * @function connect
   * @memberof NxtUsbCommunication
   * @returns {Promise<void>}
   * @throws {Error}
   */
  async connect() {
    print("Requesting connection..");

    this.device = await navigator.usb.requestDevice({
      filters: [{ vendorId: 0x0694 }], // LEGO
    });

    print("Attempting to communicate..");

    await this.device.open();

    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }

    await this.device.claimInterface(0);
  }

  /**
   * Send a command to the nxt brick
   *
   * @async
   * @function sendCommand
   * @memberof NxtUsbCommunication
   * @param {Uint8Array} command
   * @returns {Promise<void>}
   * @throws {Error}
   */
  async sendCommand(command) {
    if (!this.device) {
      throw new Error("No device connected");
    }

    await this.device.transferOut(1, command);
  }

  /**
   * Receive data from the nxt brick
   *
   * @async
   * @function receiveData
   * @memberof NxtUsbCommunication
   * @returns {Promise<Uint8Array>}
   * @throws {Error}
   */
  async receiveData() {
    if (!this.device) {
      throw new Error("No device connected");
    }

    const result = await this.device.transferIn(2, 64);

    if (!result.data) {
      throw new Error("No data received");
    }

    return new Uint8Array(result.data.buffer);
  }
}

/**
 * Main class for interacting with the brick
 */
class Nxt {
  constructor() {
    this.connectedDevice;
  }

  /**
   * Connect to the nxt brick via USB or Bluetooth
   *
   * @async
   * @function connect
   * @memberof Nxt
   * @param {string} type // type can be "usb" or "bluetooth"
   * @returns {Promise<void>}
   */
  async connect(type) {
    switch (type) {
      case "usb":
        this.connectedDevice = new NxtUsbCommunication();
        break;
      case "bluetooth":
        throw new Error("Bluetooth not implemented");
      default:
        throw new Error("Invalid connection type");
    }

    await this.connectedDevice.connect();
    const firmwareVersion = await this.getFirmwareVersion();
    print(
      `Connected to NXT brick with firmware version ${firmwareVersion.majorFirmware}.${firmwareVersion.minorFirmware}`
    );
    print();
  }

  /**
   * Get firmware and protocol version of connected brick
   *
   * @async
   * @function getFirmwareVersion
   * @memberof Nxt
   * @returns {Promise<{ minorProtocol: number, majorProtocol: number, minorFirmware: number, majorFirmware: number}>}
   * @throws {Error}
   */
  async getFirmwareVersion() {
    if (!this.connectedDevice) {
      throw new Error("No device connected");
    }

    await this.connectedDevice.sendCommand(new Uint8Array([0x01, 0x88])); // Get firmware version

    // Expected output:
    // 0: 0x02
    // 1: 0x88
    // 2: status, 0 equals success, otherwise indicates error message
    // 3: minor version of protocol
    // 4: major version of protocol
    // 5: minor version of firmware
    // 6: major version of firmware

    const data = await this.connectedDevice.receiveData();
    return {
      minorProtocol: data[3],
      majorProtocol: data[4],
      minorFirmware: data[5],
      majorFirmware: data[6],
    };
  }

  /**
   * Get device info of connected brick
   *
   * @async
   * @function getDeviceInfo
   * @memberof Nxt
   * @returns {Promise<{ nxtName: string, btAddress: string, btSignalStrength: number, freeUserFlash: number }>}
   * @throws {Error}
   */
  async getDeviceInfo() {
    if (!this.connectedDevice) {
      throw new Error("No device connected");
    }

    await this.connectedDevice.sendCommand(new Uint8Array([0x01, 0x9b])); // Get device info

    // Expected output:
    // 0: 0x02
    // 1: 0x9B
    // 2: status, 0 equals success, otherwise indicates error message
    // 3-17: NXT name
    // 18-24: BT address
    // 25: lsb of BT signal strength
    // 28: msb of BT signal strength
    // 29: lsb of free user flash
    // 32: msb of free user flash

    const data = await this.connectedDevice.receiveData();

    const rawName = String.fromCharCode(...data.slice(3, 18));
    const nxtName = rawName.replace(/\u0000/g, ""); // Remove null characters

    const btAddress = data.slice(18, 24);

    // untested
    const btSignalStrength =
      data[25] | (data[26] << 8) | (data[27] << 16) | (data[28] << 24);

    const freeUserFlash =
      data[29] | (data[30] << 8) | (data[31] << 16) | (data[32] << 24);

    return {
      nxtName,
      btAddress,
      btSignalStrength,
      freeUserFlash,
    };
  }

  /**
   * Set brick name, max 15 chars
   *
   * @async
   * @function setBrickName
   * @memberof Nxt
   * @param {string} name
   * @returns {Promise<void>}
   * @throws {Error}
   */
  async setBrickName(name) {
    if (!this.connectedDevice) {
      throw new Error("No device connected");
    }

    if (name.length > 15) {
      throw new Error("Name must be 15 characters or less");
    }

    const nameArray = new Uint8Array(15);
    nameArray.set(name.split("").map((char) => char.charCodeAt(0)));

    await this.connectedDevice.sendCommand(
      new Uint8Array([0x01, 0x98, ...nameArray])
    );

    const data = await this.connectedDevice.receiveData();

    if (data[2] !== 0) {
      throw new Error(`Failed to set brick name, error code ${data[2]}`);
    }
  }
}

export default Nxt;
