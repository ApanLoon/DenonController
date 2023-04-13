export class Tags
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
