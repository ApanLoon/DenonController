
export class BluetoothStatus
{
    public isPowered:      boolean = false;
    public isDiscoverable: boolean = false;
    public isConnected:    boolean = false;
    public connectedTo:    string = "";

    public copyFrom(status: BluetoothStatus)
    {
        this.isPowered      = status.isPowered      || false;
        this.isDiscoverable = status.isDiscoverable || false;
        this.isConnected    = status.isConnected    || false;
        this.connectedTo    = status.connectedTo    || "";
    }
}
