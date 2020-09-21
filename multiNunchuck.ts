
/**
 *  MULTINUNCHUCK blocks
 */

let _addr = 0x52;

//var nunchuckByteArray = new Uint8Array(24); // 6 bytes * 4 controller
let nunchuckByteArray: number[] = [];

enum CTRL_STATE {
    //% block=UP
    UP = 0,
    //% block=DOWN
    DOWN,
    //% block=LEFT
    LEFT,
    //% block=RIGHT
    RIGHT,
    //% block=BUTTON_C
    BUTTON_C,
    //% block=BUTTON_Z
    BUTTON_Z,
    //% block=ACC_X
    ACC_X,
    //% block=ACC_Y
    ACC_Y,
    //% block=ACC_Z
    ACC_Z,

}


let _pca9546ai2cAddr = 0x70;
let _lastActiveChannel = 0;

enum ADDRESS {                     // address for Nunchuck
    //% block=0x70
    A0x70 = 0x70,               // 
    //% block=0x71
    A0x71 = 0x71,              // 
    //% block=0x72
    A0x72 = 0x72,              // 
    //% block=0x73
    A0x73 = 0x73,              // 
    //% block=0x74
    A0x74 = 0x74,              //
    //% block=0x75
    A0x75 = 0x75,              // 
    //% block=0x76
    A0x76 = 0x76,              // 
    //% block=0x77
    A0x77 = 0x77,              //  
}



/**
 * Blocks
 */
//% weight=100 color=#0fbc12 icon="\uf11b" block="MultiNunchuck"

namespace MULTINUNCHUCK {
    //% block="RollAngle from buffer of Nunchuck at Channel%channel"
    //% channel.min=1 channel.max=4 channel.defl=1
    export function rollAngle(channel: number): number {
        let arrayStartIndex = channel * 6

        let byte6 = nunchuckByteArray[arrayStartIndex + 5];
        let byte5 = nunchuckByteArray[arrayStartIndex + 4];
        let byte4 = nunchuckByteArray[arrayStartIndex + 3];
        let byte3 = nunchuckByteArray[arrayStartIndex + 2];
        let byte2 = nunchuckByteArray[arrayStartIndex + 1];
        let byte1 = nunchuckByteArray[arrayStartIndex + 0];

        I2CMUX.PCA9546SelectChannel(channel, true)

        let accelX = ((byte3 << 2) | ((byte6 >> 2) & 0x3))
        let accelY = ((byte4 << 2) | ((byte6 >> 4) & 0x3))
        let accelZ = ((byte5 << 2) | ((byte6 >> 6) & 0x3))
        return (Math.atan2((accelX - 511.0), (accelZ - 511.0)) * 180.0 / Math.PI);
    }

    //% block="PitchAngle from buffer of Nunchuck at Channel%channel"
    //% channel.min=1 channel.max=4 channel.defl=1
    export function pitchAngle(channel: number): number {
        let arrayStartIndex = channel * 6

        let byte6 = nunchuckByteArray[arrayStartIndex + 5];
        let byte5 = nunchuckByteArray[arrayStartIndex + 4];
        let byte4 = nunchuckByteArray[arrayStartIndex + 3];
        let byte3 = nunchuckByteArray[arrayStartIndex + 2];
        let byte2 = nunchuckByteArray[arrayStartIndex + 1];
        let byte1 = nunchuckByteArray[arrayStartIndex + 0];

        I2CMUX.PCA9546SelectChannel(channel, true)

        let accelX = ((byte3 << 2) | ((byte6 >> 2) & 0x3))
        let accelY = ((byte4 << 2) | ((byte6 >> 4) & 0x3))
        let accelZ = ((byte5 << 2) | ((byte6 >> 6) & 0x3))
        return -(Math.atan2((accelY - 511.0), (accelZ - 511.0)) * 180.0 / Math.PI);
    }

    //% block="Decipher buffer of Nunchuck at Channel%channel for State %ctrlState"
    //% channel.min=1 channel.max=4 channel.defl=1
    export function ReadState(channel: number, ctrlState: CTRL_STATE): number {
        let arrayStartIndex = channel * 6

        let byte6 = nunchuckByteArray[arrayStartIndex + 5];
        let byte5 = nunchuckByteArray[arrayStartIndex + 4];
        let byte4 = nunchuckByteArray[arrayStartIndex + 3];
        let byte3 = nunchuckByteArray[arrayStartIndex + 2];
        let byte2 = nunchuckByteArray[arrayStartIndex + 1];
        let byte1 = nunchuckByteArray[arrayStartIndex + 0];

        I2CMUX.PCA9546SelectChannel(channel, true)

        if (ctrlState == CTRL_STATE.UP) {
            return (byte2 > 150) ? 1: 0;
        }
        else if (ctrlState == CTRL_STATE.DOWN) {
            return (byte2 < 100) ? 1: 0;
        }
        else if (ctrlState == CTRL_STATE.LEFT) {
            return (byte1 < 100) ? 1: 0;
        }
        else if (ctrlState == CTRL_STATE.RIGHT) {
            return (byte1 > 150) ? 1: 0;
        }
        else if (ctrlState == CTRL_STATE.BUTTON_C) {
            return (((byte6 >> 1) & 0x01) == 0) ? 1: 0;
        }
        else if (ctrlState == CTRL_STATE.BUTTON_Z) {
            return ((byte6 & 0x01) == 0) ? 1: 0;
        }
        else if (ctrlState == CTRL_STATE.ACC_X) {
            return ((byte3 << 2) | ((byte6 >> 2) & 0x3));
        }
        else if (ctrlState == CTRL_STATE.ACC_Y) {
            return ((byte4 << 2) | ((byte6 >> 4) & 0x3));
        }
        else if (ctrlState == CTRL_STATE.ACC_Z) {
            return ((byte5 << 2) | ((byte6 >> 6) & 0x3));
        }
        else 
            return 0;
    }

    //% block="Read Nunchuck at Channel%channel to buffer"
    //% channel.min=1 channel.max=4 channel.defl=1
    export function ReadToBuffer(channel: number) {
        let arrayStartIndex = channel * 6
        I2CMUX.PCA9546SelectChannel(channel, true)

        pins.i2cWriteNumber(
            _addr,
            0,      // 0x00
            NumberFormat.Int8LE,
            false
        )
        basic.pause(250)
        nunchuckByteArray[arrayStartIndex + 0] = pins.i2cReadNumber(82, NumberFormat.UInt8LE, true)
        nunchuckByteArray[arrayStartIndex + 1] = pins.i2cReadNumber(82, NumberFormat.UInt8LE, true)
        nunchuckByteArray[arrayStartIndex + 2] = pins.i2cReadNumber(82, NumberFormat.UInt8LE, true)
        nunchuckByteArray[arrayStartIndex + 3] = pins.i2cReadNumber(82, NumberFormat.UInt8LE, true)
        nunchuckByteArray[arrayStartIndex + 4] = pins.i2cReadNumber(82, NumberFormat.UInt8LE, true)
        nunchuckByteArray[arrayStartIndex + 5] = pins.i2cReadNumber(82, NumberFormat.UInt8LE, false)
    }
    
    //% block="Initialize Nunchuck at Channel%channel" 
    //% channel.min=1 channel.max=4 channel.defl=1
    export function initNunchuck(channel: number) {
        _addr = 0x52;

        I2CMUX.PCA9546SelectChannel(channel, true)

        pins.i2cWriteNumber(
        _addr,
        22000,      // 0x55, 0xF0
        NumberFormat.UInt16LE,
        false
        )
        basic.pause(250)
        pins.i2cWriteNumber(
        _addr,
        251,        // 0xFB, 0X00
        NumberFormat.UInt16LE,
        false
        )

        basic.pause(100)
    }
}

/**
 * Blocks
 */
//% weight=100 color=#34baeb icon="\uf0b2" block="I2cMux"

namespace I2CMUX {
    
    //% block="Set active i2C Channel to %channel"
    //% channel.min=0 channel.max=4
    export function selectActiveChannel(channel: number) {
            PCA9546SelectChannel(channel, false)
    }

    //% block="Initialize i2c Mux (PCA9546A) at i2c Address %addr" 
    export function initPCA9546A(addr: ADDRESS) {
        _pca9546ai2cAddr = addr;
        _lastActiveChannel = 0;    // No Active
    }


    function PCA9546SelectChannel(channel:number, revertLastActive: boolean): boolean {
        let _storedLastChannel = _lastActiveChannel

        // Sanity check value passed.  Only least significant 4 bits valid
        if (channel <= 0xf)
        {
             _lastActiveChannel = channel
            i2c_write(channel);

            if (revertLastActive) {
               _lastActiveChannel = _storedLastChannel
               i2c_write(_storedLastChannel);
            }

            return true;
        }
        else
        {
            return false;
        }  
    }

    function i2c_write(data:number) {
        pins.i2cWriteNumber(
        _pca9546ai2cAddr,
        data,      // 0x, 0xF0
        NumberFormat.UInt8LE,
        false
        )
          
    }

}

