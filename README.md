I want to listen to Audiobooks with my Mac. I have all Audiobooks in one Folder and as mp3 Files. So i wrote the following electron gui to play them (in realy ugly, just want it to work).

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

# Build Packages
Create for the current Platform
```
electron-packager --icon img/icons.icns --overwrite .
```

Create a dmg file for mac:
http://stackoverflow.com/questions/37292756/how-to-create-a-dmg-file-for-a-app-for-mac

# Screenshots
Library view:
![Library](img/library.png?raw=true "Player")

Player view:
![Player](img/player.png?raw=true "Player")
