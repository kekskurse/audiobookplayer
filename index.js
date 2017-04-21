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
var currentBookID = -1;

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
    allAlbumLength();
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
                config.audiobooks[i].trackCount = res.length;
            }
        }
        playTrack(startpos);
      }
    });
}

function calculateAlbumLenght(id)
{
    console.log("Album lenght "+id)

    var mp3Duration = require('mp3-duration');
    var _id = id;
    var _audiobook = config.audiobooks[id].name;
    var _trackcount = 0;
    var _doneTracks = 0;
    console.log("Album lenght >"+_audiobook+"<")
    return new Promise(function (fulfill, reject){
        if(_audiobook=="")
        {
            fulfill();
        }
        getDirectories(config.path+"/"+_audiobook, function (err, res) {
            _trackcount = res.length;
            config.audiobooks[_id].trackCount = _trackcount;
            for(var g=0;g<res.length;g++)
            {
                mp3Duration(res[g], function (err, duration) {
                    if (err) reject(err.message);
                    config.audiobooks[_id].duration = config.audiobooks[_id].duration + duration;
                    console.log('Your file is ' + duration + ' seconds long ('+_audiobook+')');
                    _doneTracks++;
                    if(_doneTracks == _trackcount)
                    {
                        fulfill();
                    }
                });
            }
        });
    });
}
function allAlbumLength(i = 0)
{
    var next = i + 1;
    if(config.audiobooks[i]!=undefined)
    {
        if(config.audiobooks[i].duration == undefined)
        {
            var r = calculateAlbumLenght(i);
            r.then(function() {
                allAlbumLength(next)
            });
        }
        else {
            allAlbumLength(next)
        }
    }
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
        html = html +'<img style="width:100%;height:200px;" src="http://img.docker.kekskurse.de/img.php?q=audiobook '+audiobooks[i]+'" alt="'+audiobooks[i]+'">';
        var _track = 0;
        var _pos = 0;
        var _alltracks = "NaN"
        var _duration = undefined;
        for(var g = 0; g < config["audiobooks"].length; g++)
        {
            if(config.audiobooks[g].name==audiobooks[i])
            {
                _track = config.audiobooks[g].currentTrack;
                _pos = config.audiobooks[g].currentPos;
                _alltracks = config.audiobooks[g].trackCount;
                _duration = config.audiobooks[g].duration;
            }
        }
        if(_track==0 && _pos == 0)
        {
            html = html + '<div class="new">Neu</div>';
        }
        else {
            if(_duration!=undefined)
            {
                html = html + '<div class="new">Track '+_track+'/'+_alltracks+' ('+Math.round(_duration/60)+' min.)</div>';
            }
            else {
                html = html + '<div class="new">Track '+_track+'/'+_alltracks+'</div>';
            }

        }
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
