import { Socket } from 'node:net';
import { EventEmitter } from 'node:events';

export class MpdOptions
{
    host;
    port = 6600;
}

export const MpdEvent = Object.freeze(
{
    Status:      "status",
    CurrentSong: "currentsong"
});

class Command
{
    constructor (cmd, onResponse)
    {
        this.cmd = cmd;
        this.onResponse = onResponse;
    }

    respond(data)
    {
        if (this.onResponse) this.onResponse(data);
    }
}

class CommandQueue
{
    constructor()
    {
        this.queue = [];
    }

    get first()
    {
        if (this.queue.length == 0)
        {
            return undefined;
        }
        return this.queue[0];
    }

    enqueue (cmd, socket, onResponse)
    {
        if (socket === undefined || socket === null || socket.closed === true)
        {
            return undefined;
        }

        let command = new Command(cmd, onResponse);
        this.queue.push(command);
        socket.write(command.cmd + "\n");
        return command;
    }

    dequeueFirst()
    {
        return this.queue.shift();
    }
}

export const PlayerState = Object.freeze(
{
    play:  0,
    stop:  1,
    pause: 2
});

class Status
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

class Tags
{
    artist                     = []; // the artist name. Its meaning is not well-defined; see “composer” and “performer” for more specific tags.
    artistsort                 = []; // same as artist, but for sorting. This usually omits prefixes such as “The”.
    album                      = []; // the album name.
    albumsort                  = []; // same as album, but for sorting.
    albumartist                = []; // on multi-artist albums, this is the artist name which shall be used for the whole album. The exact meaning of this tag is not well-defined.
    albumartistsort            = []; // same as albumartist, but for sorting.
    title                      = []; // the song title.
    titlesort                  = []; // same as title, but for sorting.
    track                      = []; // the decimal track number within the album.
    name                       = []; // a name for this song. This is not the song title. The exact meaning of this tag is not well-defined. It is often used by badly configured internet radio stations with broken tags to squeeze both the artist name and the song title in one tag.
    genre                      = []; // the music genre.
    mood                       = []; // the mood of the audio with a few keywords.
    date                       = []; // the song’s release date. This is usually a 4-digit year.
    originaldate               = []; // the song’s original release date.
    composer                   = []; // the artist who composed the song.
    composersort               = []; // same as composer, but for sorting.
    performer                  = []; // the artist who performed the song.
    conductor                  = []; // the conductor who conducted the song.
    work                       = []; // “a work is a distinct intellectual or artistic creation, which can be expressed in the form of one or more audio recordings”
    ensemble                   = []; // the ensemble performing this song, e.g. “Wiener Philharmoniker”.
    movement                   = []; // name of the movement, e.g. “Andante con moto”.
    movementnumber             = []; // movement number, e.g. “2” or “II”.
    location                   = []; // location of the recording, e.g. “Royal Albert Hall”.
    grouping                   = []; // “used if the sound belongs to a larger category of sounds/music” (from the IDv2.4.0 TIT1 description).
    comment                    = []; // a human-readable comment about this song. The exact meaning of this tag is not well-defined.
    disc                       = []; // the decimal disc number in a multi-disc album.
    label                      = []; // the name of the label or publisher.
    musicbrainz_artistid       = []; // the artist id in the MusicBrainz database.
    musicbrainz_albumid        = []; // the album id in the MusicBrainz database.
    musicbrainz_albumartistid  = []; // the album artist id in the MusicBrainz database.
    musicbrainz_trackid        = []; // the track id in the MusicBrainz database.
    musicbrainz_releasetrackid = []; // the release track id in the MusicBrainz database.
    musicbrainz_workid         = []; // the work id in the MusicBrainz database.
    
    static parse(txt)
    {
        let tags = new Tags();
        txt.split("\n").forEach(line =>
        {
            const index = line.indexOf(":");
            const key   = line.substring(0, index).trim().toLowerCase();
            const value = line.substring(index + 1).trim();

            switch (key)
            {
                case "artist"                    : tags.artist                    .push(value); break; 
                case "artistsort"                : tags.artistsort                .push(value); break; 
                case "album"                     : tags.album                     .push(value); break; 
                case "albumsort"                 : tags.albumsort                 .push(value); break; 
                case "albumartist"               : tags.albumartist               .push(value); break; 
                case "albumartistsort"           : tags.albumartistsort           .push(value); break; 
                case "title"                     : tags.title                     .push(value); break; 
                case "titlesort"                 : tags.titlesort                 .push(value); break; 
                case "track"                     : tags.track                     .push(Number(value)); break; 
                case "name"                      : tags.name                      .push(value); break; 
                case "genre"                     : tags.genre                     .push(value); break; 
                case "mood"                      : tags.mood                      .push(value); break; 
                case "date"                      : tags.date                      .push(value); break; 
                case "originaldate"              : tags.originaldate              .push(value); break; 
                case "composer"                  : tags.composer                  .push(value); break; 
                case "composersort"              : tags.composersort              .push(value); break; 
                case "performer"                 : tags.performer                 .push(value); break; 
                case "conductor"                 : tags.conductor                 .push(value); break; 
                case "work"                      : tags.work                      .push(value); break; 
                case "ensemble"                  : tags.ensemble                  .push(value); break; 
                case "movement"                  : tags.movement                  .push(value); break; 
                case "movementnumber"            : tags.movementnumber            .push(value); break; 
                case "location"                  : tags.location                  .push(value); break; 
                case "grouping"                  : tags.grouping                  .push(value); break; 
                case "comment"                   : tags.comment                   .push(value); break; 
                case "disc"                      : tags.disc                      .push(Number(value)); break; 
                case "label"                     : tags.label                     .push(value); break; 
                case "musicbrainz_artistid"      : tags.musicbrainz_artistid      .push(value); break; 
                case "musicbrainz_albumid"       : tags.musicbrainz_albumid       .push(value); break; 
                case "musicbrainz_albumartistid" : tags.musicbrainz_albumartistid .push(value); break; 
                case "musicbrainz_trackid"       : tags.musicbrainz_trackid       .push(value); break; 
                case "musicbrainz_releasetrackid": tags.musicbrainz_releasetrackid.push(value); break; 
                case "musicbrainz_workid"        : tags.musicbrainz_workid        .push(value); break; 
            }
        });
        return tags;
    }
}

export class MpdClient extends EventEmitter
{
    commandQueue = new CommandQueue();
    idleIsForced = false;

    currentStatus = new Status();
    get isPlaying() { return this.currentStatus.state === PlayerState.play };

    currentSong = new Tags();

    constructor(options)
    {
        super();
        this.options = options;
        this.socket = new Socket();
    }

    connect()
    {
        console.log(`MpdClient.connect: Connecting to ${this.options.host}:${this.options.port}...`);
        return new Promise ((resolve, reject) =>
        {
            this.socket.once('connect', () =>
            {
                console.log (`MpdClient: Socket connected to ${this.options.host}:${this.options.port}`);
                resolve();
            });

            this.socket.once('error', error =>
            {
                console.log ("MpdClient: Error ", error);
                reject(error);
            });

            this.socket.on('data', data =>
            {
                let msg = data.toString().trim();
                if (msg.length == 0)
                {
                    return;
                }
                if (msg.startsWith("OK MPD "))
                {
                    console.log (`MPD: version=${msg.substring(7).trim()}`);
                    //this.requestStatus(() => this.requestCurrentSong());
                }
                else if (msg.endsWith("OK"))
                {
                    let command = this.commandQueue.dequeueFirst();
                    if (command !== undefined)
                    {
                        command.respond(msg);
                    }
                }
                else if (msg.startsWith("binary: "))
                {
                    const len = Number(msg.substring(8));
                    console.log ("Binary: ", len);
                }
                else if (msg.startsWith("ACK "))
                {
                    let command = this.commandQueue.dequeueFirst();

                    const re = new RegExp("^ACK \\[(\\d+)@(\\d+)\\]\\s+\\{(.*)}\\s+(.*)$");
                    const r = msg.match(re);
                    if (r)
                    {
                        const errorCode = r[1];
                        const listOffset = r[2];
                        const command = r[3];
                        const message = r[4];
                        console.log (`MpdClient: Error [${errorCode}@${listOffset}] {${command}} ${message}`);    
                    }
                    else console.log ("Error: ", msg);
                }
                else
                {
                    console.log ("MpdClient: Unparsed message. ", msg);
                }
            });

            this.socket.on('close', ()=>
            {
                console.log("MpdClient: Connection closed.");
            })

            this.socket.connect(this.options.port, this.options.host);
        });
    }

    close()
    {
        if (this.socket !== undefined && this.socket !== null && this.socket.closed === false)
        {
            console.log ("MpdClient.close: Closing socket...");
            this.socket.close();
        }
    }

    idle()
    {
        if (this.commandQueue.first?.cmd === "idle")
        {
            return;
        }

        console.log("MpdClient.idle");
        let command = this.commandQueue.enqueue("idle", this.socket, data =>
        {
            data.split("\n").forEach(line =>
            {
                if (line.startsWith("changed:"))
                {
                    const subsystem = line.substring(8).trim();
                    console.log(`MpdClient.idle: Subsystem "${subsystem}" changed.`);
                    switch (subsystem)
                    {
                        case "player":
                            this.idleIsForced = true;
                            this.requestStatus(()=>this.requestCurrentSong());
                            break;
                    }
                }
            });
            
            if (!this.idleIsForced) // TODO: Is it safe to set a property from noidle?
            {
                this.idle();
            }
            this.idleIsForced = false;
        });
    }

    noidle()
    {
        if (this.socket !== undefined && this.socket !== null && this.socket.closed === false && this.commandQueue.first?.cmd === "idle")
        {
            console.log("MpdClient.noidle");
            this.idleIsForced = true;
            this.socket.write("noidle\n");
        }
    }

    requestStatus(onResponse)
    {
        console.log("MpdClient.requestStatus");
        this.noidle();
        let command = this.commandQueue.enqueue("status", this.socket, data =>
        {
            this.currentStatus = Status.parse(data);
            this.emit(MpdEvent.Status, this.currentStatus);

            onResponse ? onResponse() : this.idle();
        });
    }

    requestCurrentSong(onResponse)
    {
        console.log("MpdClient.requestCurrentSong");
        this.noidle();
        let command = this.commandQueue.enqueue("currentsong", this.socket, data =>
        {
            this.currentSong = Tags.parse(data);
            this.emit(MpdEvent.CurrentSong, this.currentSong);

            onResponse ? onResponse() : this.idle();
        });
    }

    play(index, onResponse)
    {
        console.log("MpdClient.play");
        this.noidle();
        let command = this.commandQueue.enqueue(`play ${index}`, this.socket, data =>
        {
            console.log ("MpdClient.play ", data);
            onResponse ? onResponse() : this.idle();
        });
    }

    pause(isOn, onResponse)
    {
        console.log("MpdClient.pause");
        this.noidle();
        let cmd = this.isPlaying ? `pause ${isOn ? 1 : 0}` : "play";
        let command = this.commandQueue.enqueue(cmd, this.socket, data =>
        {
            console.log (`MpdClient.pause ${isOn}`, data);
            onResponse ? onResponse() : this.idle();
        });
    }

    stop(onResponse)
    {
        console.log("MpdClient.stop");
        this.noidle();
        let command = this.commandQueue.enqueue("stop", this.socket, data =>
        {
            console.log ("MpdClient.stop ", data);
            onResponse ? onResponse() : this.idle();
        });
    }

    prev(onResponse)
    {
        console.log("MpdClient.prev");
        this.noidle();
        let command = this.commandQueue.enqueue("previous", this.socket, data =>
        {
            console.log ("MpdClient.prev ", data);
            onResponse ? onResponse() : this.idle();
        });
    }

    next(onResponse)
    {
        console.log("MpdClient.next");
        this.noidle();
        let command = this.commandQueue.enqueue("next", this.socket, data =>
        {
            console.log ("MpdClient.next", data);
            onResponse ? onResponse() : this.idle();
        });
    }
}
