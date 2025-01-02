import { exec, spawn } from "child_process";
import { EventEmitter } from "node:events";

export class BluetoothOptions
{
    constructor(init)
    {
        Object.assign(this, init);
    }
}

export const BluetoothEvent = Object.freeze (
    {
        Status:    "status"
    });

export class BluetoothStatus
{
    isPowered = false;
    isDiscoverable = false;
    isConnected = false;
    connectedTo = "";
}

export class BluetoothController extends EventEmitter
{
    bluetoothctl;
    status = new BluetoothStatus();

    currentOnLine;

    constructor(options)
    {
        super();
        this.options = new BluetoothOptions(options);
    }

    hexdump(buffer)
    {
        let s = "";
        for (let i = 0; i < buffer.length; i += 16)
        {
            let hex = "";
            let ascii = "";
            for (let j = i; j < i + 16; j++)
            {
                hex += buffer.toString("hex", j, j + 1) + " ";
                if (j == i + 8)
                {
                    hex += " ";
                }
                ascii += buffer[j] < 33 || buffer[j] > 128 ? "." : String.fromCharCode(buffer[j]);
            }
            s += `${hex.padEnd(49)}  ${ascii}\n`;
        }
        return s;
    }

    stripAnsi(s)
    {
        return s.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
    }

    connect()
    {
        console.log(`BluetoothController.connect: Connecting to bluetoothctl...`);
        this.bluetoothctl = spawn ("bluetoothctl");
        this.bluetoothctl.stdout.on ("data", data =>
        {
            //console.log(`APA: \n${this.hexdump(data)}`);
            this.stripAnsi(data.toString("utf8")).replace("\r", "").split("\n").forEach(line =>
            {
                let isParsed = false;
                let isComplete = false;

                const agent = this.simpleMatch(line, /.*\[(.*)\]#/);
                if (agent !== null)
                {
                    if (agent !== "agent" && agent !== "bluetooth")
                    {
                        if (agent !== this.status.connectedTo)
                        {
                            this.status.connectedTo = agent;
                            console.log("Bluetooth.agent: ", this.status);
                            this.emit(BluetoothEvent.Status, this.status );
                        }
                    }
                    isParsed = true;
                }

                const controllerChange = this.simpleMatch(line, /.*\[.*CHG.*\] Controller [^ ]+ (.+)/);
                if (controllerChange !== null)
                {
                    console.log (`Bluetooth.Controller CHG: ${controllerChange}`);
                    isParsed = true;
                }

                const deviceChange = this.simpleMatch(line, /.*\[.*CHG.*\] Device [^ ]+ (.+)/);
                if (deviceChange !== null)
                {
                    const connected = this.simpleMatch(deviceChange, /Connected: (.+)/)
                    if (connected)
                    {
                        this.status.isConnected = connected === "yes";
                        if (this.status.isConnected === false)
                        {
                            this.status.connectedTo = "";
                        }
                        console.log("Bluetooth.connected: ", this.status);
                        this.emit(BluetoothEvent.Status, this.status );

                    }
                    else
                    {
                        console.log (`Bluetooth.Device CHG: ${deviceChange}`);
                    }
                    isParsed = true;
                }

                const passkey = this.simpleMatch(line, /.*\[agent\] Confirm passkey (\d+) \(yes\/no\)/);
                if (passkey !== null )
                {
                    this.bluetoothctl.stdin.write("yes\n");
                    console.log (`Bluetooth: Accepted passkey ${passkey}`);
                    isParsed = true;
                }

                const service = this.simpleMatch(line, /.*\[agent\] Authorize service (.+?) \(yes\/no\)/);
                if (service !== null )
                {
                    this.bluetoothctl.stdin.write("yes\n");
                    console.log (`Bluetooth: Authorized ${service}`);
                    isParsed = true;
                }

                if (this.currentOnLine)
                {
                    ({isParsed, isComplete} = this.currentOnLine(line));
                    if ( isComplete === true)
                    {
                        this.currentOnLine = null;
                    }
                }
                if (isParsed === false)
                {
                    //console.log (this.hexdump(Buffer.from(line)));
                }
            });
        });
        this.bluetoothctl.stderr.on ("data", data =>
        {
            console.log ("stderr: ", data.toString(hex));
        });
        this.bluetoothctl.on('close', (code) => 
        {
            console.log(`BluetoothController: bluetoothctl exited with code ${code}`);
        }); 
    }

    sendCommand(command, onLine)
    {
        this.currentOnLine = onLine;
        this.bluetoothctl.stdin.write (`${command}\n`);
    }

    simpleMatch(s, regExp)
    {
        const match = s.match (regExp);
        if (match == null)
        {
            return null;
        }
        return match[1];
    }

    requestStatus()
    {
        console.log("BluetoothController.requestStatus");
        this.sendCommand("show", line => 
        {
            let isParsed = true; // NOTE: We accept every line here
            let isComplete = false;

            const match = line.match(/^.*\[(.+?)\].*#/); 
            if (match)
            {
                isComplete = true;
                console.log("requestStatus: ", this.status);
                this.emit(BluetoothEvent.Status, this.status );
            }
            else if (this.simpleMatch (line, /^\s+Powered:\s*(yes|no)\s*/) === "yes")
            {
                this.status.isPowered = true;    
            }
            else if (this.simpleMatch (line, /^\s+Discoverable:\s*(yes|no)\s*/) === "yes")
            {
                this.status.isDiscoverable = true;    
            }
            return { isParsed, isComplete };
        });
    }

    setPowered(arg, inform = true)
    {
        const argString = arg ? "on" : "off";
        console.log(`BluetoothController.setPowered ${ argString }`);

        this.sendCommand (`power ${argString}`,
        line =>
        {
            const successString = this.simpleMatch (line, /Changing power .+ (succeeded|failed)/);
            if (successString === null)
            {
                return {isParsed: true, isComplete: false};
            }

            if ( successString === "succeeded")
            {
                this.status.isPowered = arg;
                if (arg === false)
                {
                    this.status.isDiscoverable = false;
                    this.status.isConnected = false;
                    this.status.connectedTo = "";
                }
                console.log("setPowered: ", this.status);
                this.emit(BluetoothEvent.Status, this.status );
            }
            return {isParsed: true, isComplete: true};
        });
    }

    setPinEnabled(arg)
    {
        const argString = arg ? "DisplayOnly" : "NoInputNoOutput";
        console.log(`BluetoothController.setPinEnabled ${ arg }`);
        const cmd = `${this.options.command} agent ${ argString }`;
        exec (cmd, (error, stdout, stderr) =>
        {
            if (error)
            {
                console.error(`BluetoothController.setPinEnabled: ${error}`);
                return;
            }
        });
    }

    setDiscoverable(arg, inform = true)
    {
        const argString = arg ? "on" : "off";
        console.log(`BluetoothController.setDiscoverable ${ argString }`);

        this.sendCommand (`discoverable ${argString}`,
        line =>
        {
            const successString = this.simpleMatch (line, /Changing discoverable .+ (succeeded|failed)/);
            if (successString === null)
            {
                return {isParsed: true, isComplete: false};
            }

            if ( successString === "succeeded")
            {
                this.status.isDiscoverable = arg;
                console.log("setDiscoverable: ", this.status);
                this.emit(BluetoothEvent.Status, this.status );
            }
            return {isParsed: true, isComplete: true};
        });
    }

}
