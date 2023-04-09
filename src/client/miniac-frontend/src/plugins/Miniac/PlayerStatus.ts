
export class PlayerStatus
{
    public isPlaying: boolean = false;

    public copyFrom(status: PlayerStatus)
    {
        this.isPlaying = status.isPlaying;
    }
}
