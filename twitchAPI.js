var search = document.getElementById("searchBar");
var add = document.getElementById("addStream");
var streamList = document.getElementById("channel");
var online = document.getElementById("onlineChannel");
var offline = document.getElementById("offlineChannel");
var all = document.getElementById("allChannel");
var text = document.getElementById("text");
var allStreamers = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];
    
// Change values in array to lowerCase
allStreamers = allStreamers.map(function(streamer){
  return streamer.toLowerCase();
});

// When app first opens, loads list with initial array of streams
window.addEventListener("load", function() {
  resetList("all");
});

// Creates list of streams that are currently online
online.addEventListener("click", function() {
  resetList("online");
});

// Creates list of streams that are currently offline
offline.addEventListener("click", function() {
  resetList("offline");
});

// Creates list of streams from array
all.addEventListener("click", function() {
  resetList("all");
});

// Searches through array for given name. If name is found, runs a request for that name
search.addEventListener("keydown", function(event) {
  if (event.which === 13 || event.keyCode === 13) {
    if (allStreamers.indexOf(search.value.toLowerCase()) !== -1) {
      streamList.innerHTML = "";
      text.textContent = "Successfully found channel '" + search.value + "' on the list";
      makeRequestChannel(search.value);
    } else {
      text.textContent = "Failed to find channel '" + search.value + "' on the list";
    }
    search.value = "";
  }
});

// Searches array for given name. If name is not found, runs a request for the name. Adds the name to array
add.addEventListener('keydown', function(event) {
  if (event.which === 13 || event.keyCode === 13) {
    if (allStreamers.indexOf(add.value.toLowerCase()) === -1) {
      makeRequestChannel(add.value);
      text.textContent = "Added '" + add.value + "' to the list";
      allStreamers.push(add.value.toLowerCase());
    } else {
      text.textContent ="'" + add.value + "' is already on the list";
    }
    add.value = "";
  }
});

// request to look at twitch's API channels. Used to provide information on each channel.
function makeRequestChannel(streamer) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4 && httpRequest.status === 200) {
      var channelData = JSON.parse(httpRequest.responseText);
      var httpRequest2 = new XMLHttpRequest();
      makeRequestStream(httpRequest2, channelData, streamer);
    }
  }
  httpRequest.open('GET','https://wind-bow.glitch.me/twitch-api/channels/'+streamer+'?callback=', true);
  httpRequest.send(null);
}

// Request to look at twitch's API streams. Used to determine whether stream is online/offline/no longer active or never created
function makeRequestStream(httpRequest2, channelData, streamer) {
  httpRequest2.onreadystatechange = function() {
    if (httpRequest2.readyState === 4 && httpRequest2.status === 200) {
      var streamData = JSON.parse(httpRequest2.responseText);
      if (channelData.status === 404 || channelData.status === 422) {
        addStreamer(streamer);
      } else {
        addStreamer(channelData, streamData);      }
    }    
  }
  httpRequest2.open('GET','https://wind-bow.glitch.me/twitch-api/streams/'+channelData.name+'?callback=',true);
  httpRequest2.send(null);
}

// Add the list item of the stream's channel with channel info to the ul.
function addStreamer(channelData, streamData) {
  var list = document.createElement("li");
  var img = document.createElement("img");
  var anchor = document.createElement('a');
  img.classList.add("logo");
  img.src = 'https://img.clipartfox.com/12fdd078f6001725f7b436b4a91dd2d0_orange-alert-icon-clip-art-n-a-clipart_300-300.png';
  
  // logic for when stream doesn't exist
  if (typeof channelData === "string") {
    list.appendChild(anchor).appendChild(img);
    anchor.appendChild(document.createTextNode(channelData + " - Unavailable Channel"));
    list.classList.add('nonexistent');
    
    // logic for when stream does exist
  } else if (typeof channelData !== 'string') {
    anchor.href = channelData.url;
    anchor.target = '_blank';
    if (channelData.logo !== null) {
      img.src = channelData.logo;  
    }
    list.appendChild(anchor).appendChild(img);
    var game = 'Game not listed';
    if (channelData.game !== "" && channelData.game !== null) {
      game = channelData.game;
    }
    anchor.appendChild(document.createTextNode(channelData['display_name'] + ' - ' + game));
    // check if a stream is online/offline at request time
    if (streamData.stream !== null) {
      list.classList.add('online'); 
    } else if (streamData.stream === null) {
      list.classList.add('offline');
    }
  } 
  // determine whether to print out the list
  printList(list);
}

function printList(list) {
  if ((list.classList.contains('online') && (all.classList.contains('active') || online.classList.contains('active'))) || (list.classList.contains('offline') && (all.classList.contains('active') || offline.classList.contains('active'))) || (list.classList.contains('nonexistent') && all.classList.contains('active'))) {
      streamList.insertBefore(list, streamList.firstChild);
    
    fadeIn(document.getElementById('channel'), 800);
  } 
}

// resets the list table every time a request is made
// asks for a request from each stream in array
function resetList(category) {
  text.textContent = "Find or add your favorite Twitch.tv streamer!";
  streamList.innerHTML = "";
  online.classList.remove("active");
  offline.classList.remove("active");
  all.classList.remove("active");
  if (category === "all") {
    all.classList.add("active");
  } else if (category === "online") {
    online.classList.add("active");
  } else if (category === "offline") {
    offline.classList.add("active");
  }
  allStreamers.forEach(function(streamer) {
    makeRequestChannel(streamer);
  });
}

// fadeIn function for list items
function fadeIn(element, ms)
{
  if( ! element )
    return;

  element.style.opacity = 0;
  element.style.filter = "alpha(opacity=0)";
  // element.style.display = "inline-block";
  element.style.visibility = "visible";

  if( ms )
  {
    var opacity = 0;
    var timer = setInterval( function() {
      opacity += 50 / ms;
      if( opacity >= 1 )
      {
        clearInterval(timer);
        opacity = 1;
      }
      element.style.opacity = opacity;
      element.style.filter = "alpha(opacity=" + opacity * 100 + ")";
    }, 50 );
  }
  else
  {
    element.style.opacity = 1;
    element.style.filter = "alpha(opacity=1)";
  }
}