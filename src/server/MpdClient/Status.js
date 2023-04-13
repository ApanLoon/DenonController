export const PlayerState = Object.freeze(
{
    play:  0,
    stop:  1,
    pause: 2
});

export class Status
{
    partition;      // the name of the current partition (see Partition commands)
    volume;         // 0-100 (deprecated: -1 if the volume cannot be determined)
    repeat;         // 0 or 1
    random;         // 0 or 1
    single;         // 0, 1, or oneshot
    consume;        // 0, 1 or oneshot
    playlist;       // 31-bit unsigned integer, the playlist version number
    playlistlength; // integer, the length of the playlist
    state;          // play, stop, or pause
    song;           // playlist song number of the current song stopped on or playing
    songid;         // playlist songid of the current song stopped on or playing
    nextsong;       // playlist song number of the next song to be played
    nextsongid;     // playlist songid of the next song to be played
    time;           // total time elapsed (of current playing/paused song) in seconds (deprecated, use elapsed instead)
    elapsed;        // Total time elapsed within the current song in seconds, but with higher resolution.
    duration;       // Duration of the current song in seconds.
    bitrate;        // instantaneous bitrate in kbps
    xfade;          // crossfade in seconds (see Cross-Fading)
    mixrampdb;      // mixramp threshold in dB
    mixrampdelay;   // mixrampdelay in seconds
    audio;          // The format emitted by the decoder plugin during playback, format: samplerate:bits:channels. See Global Audio Format for a detailed explanation.
    updating_db;    // job id
    error;          // if there is an error, returns message here

    static parse(txt)
    {
        let status = new Status();
        txt.split("\n").forEach(line =>
        {
            const index = line.indexOf(":");
            const key   = line.substring(0, index).trim().toLowerCase();
            const value = line.substring(index + 1).trim();

            switch (key)
            {
                case "partition":      status.partition      = value;         break;
                case "volume":         status.volume         = Number(value); break;       
                case "repeat":         status.repeat         = value == "1";  break;
                case "random":         status.random         = value == "1";  break;
                case "single":         status.single         = value;         break;
                case "consume":        status.consume        = value;         break;
                case "playlist":       status.playlist       = Number(value); break;
                case "playlistlength": status.playlistlength = Number(value); break;
                case "state":          status.state          = ({"play": PlayerState.play, "stop": PlayerState.stop, "pause": PlayerState.pause})[value]; break;
                case "song":           status.song           = Number(value); break;
                case "songid":         status.songid         = Number(value); break;
                case "nextsong":       status.nextsong       = Number(value); break;
                case "nextsongid":     status.nextsongid     = Number(value); break;
                case "time":           status.time           = value;         break; // Deprecated xx:yy?
                case "elapsed":        status.elapsed        = Number(value); break;
                case "duration":       status.duration       = Number(value); break;
                case "bitrate":        status.bitrate        = Number(value); break;
                case "xfade":          status.xfade          = Number(value); break;
                case "mixrampdb":      status.mixrampdb      = Number(value); break;
                case "mixrampdelay":   status.mixrampdelay   = Number(value); break;
                case "audio":          status.audio          = value;         break;
                case "updating_db":    status.updating_db    = Number(value); break;
                case "error":          status.error          = value;         break;
            }
        });
        return status;
    }
}
