//Required
const fs = require('fs')
const path = require('path')
var glob = require("glob")

//Varieables
var config = {
    "path":"",
    "audiobooks": [
        {
            "name": "test",
            "currentTrack": 0,
            "currentPos": 0
        }
    ]
};

var currentPlaylist = [];
var currentTrack = 0;
var currentName = "";

var audio = document.getElementById("audiobookPlayerElement");
//database
const storage = require('electron-json-storage');

//Interactions
function loadInteractions() {
    $("#addBTN").click(function() {
        const electron = require('electron')
        var dialog = electron.remote.dialog;
        dialog.showOpenDialog({properties: ['openDirectory']},function(res) {
            config.path = res[0];
            saveConfig();
        });
    });

    $(".libclick").bind("click", function(){
        $("#playerView").html("<i>Loading</i>");
        loadAudio($(this).attr("data-name"));
        $("#library").hide();
        $("#player").show();

    });
    $(".playTrack").bind("click", function(){
        currentTrack = $(this).attr("data-track");
        playTrack(0);
    });
    $(".backToLibrary").bind("click", function () {
        $("#library").show();
        $("#player").hide();
    });
};

//Functions
function saveConfig()
{
    storage.set('config', config, function(error) {
      if (error) throw error;
    });
}
function loadConfig()
{
    console.log("Load Config");
    storage.has('config', function(error, hasKey) {
  if (error) throw error;

  if (hasKey) {
      storage.get('config', function(error, data) {
    if (error) throw error;

    config = data;
    console.log(config);
    init();
  });
  }
});
}
function init()
{
    var audiobooks = fs.readdirSync(config.path).filter(file => fs.statSync(path.join(config.path, file)).isDirectory())
    console.log("Find Audiobooks");
    console.log(audiobooks);
    createLiberyPage(audiobooks);
}
var getDirectories = function (src, callback) {
  glob(src + '/**/*.mp3', callback);
};
function loadAudio(name)
{
    console.log("PATH");
    console.log(config.path+"/"+name);
    getDirectories(config.path+"/"+name, function (err, res) {
      if (err) {
        console.log('Error', err);
      } else {
        createAudiobookPage(res, name);
        if("audiobooks" in config)
        {
            console.log("LOAD");
        }
        else {
            config["audiobooks"] = [];
        }
        currentPlaylist = res;
        currentName = name;
        var startpos = 0;
        for(var i = 0; i < config["audiobooks"].length; i++)
        {
            if(config.audiobooks[i].name==currentName)
            {
                currentTrack = config.audiobooks[i].currentTrack;
                startpos = config.audiobooks[i].currentPos;
            }
        }
        playTrack(startpos);
      }
    });
}
function playTrack(startpos = 0)
{
    $(".playing").each(function(index, obj){
        console.log("REMOVE PLAYING");
        console.log(index);
        console.log(obj);
        $(obj).removeClass("playing");
    });
    $("#track_"+currentTrack).addClass("playing");
    console.log("Play: "+currentPlaylist[currentTrack]);
    audio.src = currentPlaylist[currentTrack];
    $("#currentTrack").html(currentPlaylist[currentTrack]);
    audio.oncanplay = function() {
        audio.currentTime=startpos;
        audio.play();
        audio.oncanplay = function() {}
    };
}


//Interval Stuff
setInterval(function () {
    var toPlay = audio.duration - audio.currentTime;
    if("audiobooks" in config)
    {
    }
    else {
        config["audiobooks"] = [];
    }
    if(toPlay == 0)
    {
        currentTrack = parseInt(currentTrack) + 1;
        playTrack();
    }
    var saved = false;
    for(var i = 0; i < config["audiobooks"].length; i++)
    {
        if(config.audiobooks[i].name==currentName)
        {
            config.audiobooks[i].currentTrack = currentTrack;
            config.audiobooks[i].currentPos = audio.currentTime;
            saved = true;
        }
    }
    if(saved == false)
    {
        config.audiobooks.push({"name": currentName, "currentTrack": currentTrack, "currentPos": audio.currentTime});
    }
    saveConfig();
    console.log("ToPlay: "+toPlay);
}, 2000);


//Start
loadConfig();
loadInteractions();

//Drow Pages
function createLiberyPage(audiobooks)
{
    var html = "<div class='row'>";
    for(var i = 0; i < audiobooks.length; i++)
    {
        html = html + '<div class="col-xs-4 col-md-3 libclick" data-name="'+audiobooks[i]+'"><a href="#" class="thumbnail">';
        html = html +'<img style="width:100%;max-height:200px;" src="http://img.docker.kekskurse.de/img.php?q=audiobook '+audiobooks[i]+'" alt="'+audiobooks[i]+'">';
        html = html + '</a></div>';
    }
    html = html + "</div>";
    $("#libraryView").html(html);
    loadInteractions();
}

function createAudiobookPage(playlist, name)
{
    var html = "<table class='table' style='font-size:10px;'>";
    for(var i = 0; i < playlist.length; i++)
    {
        html = html + "<tr class='play' data-name='"+name+"' id='track_"+i+"'><td><a href='#' class='btn btn-default btn-sm playTrack' data-track='"+i+"'><i class='fa fa-play' aria-hidden='true'></i></a> "+playlist[i]+"</td></tr>";
    }
    html = html + "</table>";
    $("#playerView").html(html);
    loadInteractions();
}
