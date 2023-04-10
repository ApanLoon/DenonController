
export class Song
{
    public artist: string = "";
    public album:  string = "";
    public title:  string = "";

    public copyFrom(song: Song)
    {
        this.artist = song.artist;
        this.album  = song.album;
        this.title  = song.title;
    }
}
