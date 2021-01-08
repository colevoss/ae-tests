-- CreateTable
CREATE TABLE "TracksInPlaylist" (
"id" SERIAL,
    "playlistId" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TracksInPlaylist" ADD FOREIGN KEY("playlistId")REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TracksInPlaylist" ADD FOREIGN KEY("trackId")REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
