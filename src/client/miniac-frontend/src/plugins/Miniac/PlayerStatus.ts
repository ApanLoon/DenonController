
export class PlayerStatus
{
    public isPlaying: boolean = false;
    public duration:  number  = 0;
    public elapsed:   number  = 0;
    public index:     number  = -1;

    public copyFrom(status: PlayerStatus)
    {
        this.isPlaying = status.isPlaying || false;
        this.duration  = status.duration  || 0;
        this.elapsed   = status.elapsed   || 0;
        this.index     = status.index     || -1;
    }
}
