I want to listen to Audobooks with my Mac. I have all Audiobooks in one Folder and as mp3 Files. So i wrote the following electron gui to play them (in realy ugly, just want it to work).

# Use it
Make sure you have the following folder Structure:

```
mainfolder
- autor - title
-- track1.mp3
-- track2.mp3
-- ...
- autor - othertitle
-- CD1
--- track1.mp3
--- track2.mp3
--- ...
-- CD2
--- track1.mp3
--- track2.mp3
```

go in the project folder and run:

```
npm install
npm start
```

Click at the "Change Library Folder" Button and select the "mainfolder" folder. Than click on a Cover. Listen to the Audiobook.

The position will be saved so you can close the app and restart later.

# Player

![Player](img/player.png?raw=true "Player")
