#!/bin/sh
## Fake bluetoothctl for testing.

CMD=$1
ARG=$2
echo $CMD
if [ $CMD == "show" ]
then
    echo "Controller B8:27:EB:BF:4B:04 (public)
        Name: miniac
        Alias: miniac
        Class: 0x002c0000
        Powered: yes
        Discoverable: no
        DiscoverableTimeout: 0x000000b4
        Pairable: no
        UUID: A/V Remote Control        (0000110e-0000-1000-8000-00805f9b34fb)
        UUID: Audio Source              (0000110a-0000-1000-8000-00805f9b34fb)
        UUID: PnP Information           (00001200-0000-1000-8000-00805f9b34fb)
        UUID: Audio Sink                (0000110b-0000-1000-8000-00805f9b34fb)
        UUID: Headset                   (00001108-0000-1000-8000-00805f9b34fb)
        UUID: A/V Remote Control Target (0000110c-0000-1000-8000-00805f9b34fb)
        UUID: Generic Access Profile    (00001800-0000-1000-8000-00805f9b34fb)
        UUID: Generic Attribute Profile (00001801-0000-1000-8000-00805f9b34fb)
        UUID: Device Information        (0000180a-0000-1000-8000-00805f9b34fb)
        UUID: Headset AG                (00001112-0000-1000-8000-00805f9b34fb)
        Modalias: usb:v1D6Bp0246d0537
        Discovering: no
        Roles: central
        Roles: peripheral
Advertising Features:
        ActiveInstances: 0x00 (0)
        SupportedInstances: 0x05 (5)
        SupportedIncludes: tx-power
        SupportedIncludes: appearance
        SupportedIncludes: local-name"
elif [ $CMD == "power" ]
then
    if [ $ARG == "on" ]
    then
        echo "[CHG] Controller B8:27:EB:BF:4B:04 Class: 0x002c0000"
        echo "Changing power on succeeded"
    else
        echo "Changing power off succeeded"
    fi
elif [ $CMD == "pairable" ]
then
    if [ $ARG == "on" ]
    then
        echo "[CHG] Controller B8:27:EB:BF:4B:04 Class: 0x002c0000"
        echo "Changing pairable on succeeded"
    else
        echo "Changing pairable off succeeded"
    fi
elif [ $CMD == "discoverable" ]
then
    if [ $ARG == "on" ]
    then
        echo "[CHG] Controller B8:27:EB:BF:4B:04 Class: 0x002c0000"
        echo "Changing discoverable on succeeded"
    else
        echo "Changing discoverable off succeeded"
    fi
fi

