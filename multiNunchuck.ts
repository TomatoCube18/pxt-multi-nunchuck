
/**
 *  MULTINUNCHUCK blocks
 */

let _addr = 0x52;

let byte6 = 0;
let byte5 = 0;
let byte4 = 0;
let byte3 = 0;
let byte2 = 0;
let byte1 = 0;


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


enum ADDRESS {                     // address for Nunchuck
    //% block=0x52
    A52 = 0x52,               // 
    //% block=0x53
    A53 = 0x53              // 
}

/**
 * Blocks
 */
//% weight=100 color=#0fbc12 icon="\uf11b" block="MULTINUNCHUCK"

namespace MULTINUNCHUCK {
    //% block="Initialize Nunchuck at i2c Address |addr %addr" 
    export function initAddr(addr: ADDRESS) {
        _addr = addr;

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

    //% block="Read Nunchuck to buffer"
    export function ReadToBuffer() {
        pins.i2cWriteNumber(
            _addr,
            0,      // 0x00
            NumberFormat.Int8LE,
            false
        )
        basic.pause(250)
        byte1 = pins.i2cReadNumber(82, NumberFormat.UInt8LE, true)
        byte2 = pins.i2cReadNumber(82, NumberFormat.UInt8LE, true)
        byte3 = pins.i2cReadNumber(82, NumberFormat.UInt8LE, true)
        byte4 = pins.i2cReadNumber(82, NumberFormat.UInt8LE, true)
        byte5 = pins.i2cReadNumber(82, NumberFormat.UInt8LE, true)
        byte6 = pins.i2cReadNumber(82, NumberFormat.UInt8LE, false)
    }
    

    //% block="Decipher Nunchuck buffer for State %ctrlState"
    export function ReadState(ctrlState: CTRL_STATE): number {
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

    //% block="RollAngle from Nunchuck buffer"
    export function rollAngle(): number {
        let accelX = ((byte3 << 2) | ((byte6 >> 2) & 0x3))
        let accelY = ((byte4 << 2) | ((byte6 >> 4) & 0x3))
        let accelZ = ((byte5 << 2) | ((byte6 >> 6) & 0x3))
        return (Math.atan2((accelX - 511.0), (accelZ - 511.0)) * 180.0 / Math.PI);
        
    }

    //% block="PitchAngle from Nunchuck buffer"
    export function pitchAngle(): number {
        let accelX = ((byte3 << 2) | ((byte6 >> 2) & 0x3))
        let accelY = ((byte4 << 2) | ((byte6 >> 4) & 0x3))
        let accelZ = ((byte5 << 2) | ((byte6 >> 6) & 0x3))
        return -(Math.atan2((accelY - 511.0), (accelZ - 511.0)) * 180.0 / Math.PI);
        

    }

   

}
