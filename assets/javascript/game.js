// VARS ======================================================================

// Elements
var fire = {
  div: $("<img>"),
  div2: $("<img>"),
  element: "fire",
  image: "assets/images/fire.jpg",
  id: "fireElement",
}

var water = {
  div: $("<img>"),
  div2: $("<img>"),
  element: "water",
  image: "assets/images/water.jpg",
  id: "waterElement",
}

var air = {
  div: $("<img>"),
  div2: $("<img>"),
  element: "air",
  image: "assets/images/air.jpg",
  id: "airElement",
}

var earth = {
  div: $("<img>"),
  div2: $("<img>"),
  element: "earth",
  image: "assets/images/earth.jpg",
  id: "earthElement",
}

// Players
var player1 = {
  name: "",
  wins: 0,
  losses: 0,
  choice: "",
}

var player2 = {
  name: "",
  wins: 0,
  losses: 0,
  choice: "",
}

var player1Log = false;
var player2Log = false;

var playerName;
var playerNumber = null;
var playerObject = null;


// FIREBASE ===================================================================
var firebaseConfig = {
  apiKey: "AIzaSyDqyP_85IMsqL_2yDMSfPEm6zUq1TkwDJI",
  authDomain: "rps-multiplayer-48ef1.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-48ef1.firebaseio.com",
  projectId: "rps-multiplayer-48ef1",
  storageBucket: "",
  messagingSenderId: "110323682510",
  appId: "1:110323682510:web:ddbe995a275fd20e"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();

var users = database.ref("/players");

var chat = database.ref("/chat");

var connectedRef = database.ref(".info/connected");

// Firebase Functions =========================================================

// If connection is lost
connectedRef.on("value", function(snap) {
  if (!snap.val() && playerNumber) {
    database.ref("/players/" + playerNumber).remove();
    playerNumber = null;

    showLogin(); //TODO
  }
})

// If chat message is sent
chat.on("child_added", function(childSnap) {
  let chatObj = childSnap.val();
  let chatText = chatObj.text;
  let logChat = $("<li>").attr("id", childSnap.key);

  // Style messages based on sender
  if (chatObj.userID == "system") {
    logChat.addClass("system");
  }
  else if (chatObj.userID == playerNumber) {
    logChat.addClass("currentUser");
  }
  else {
    logChat.addClass("otherUser");
  }

  // Showing sender username with message
  if (chatObj.name) {
    chatText = "<strong>" + chatObj.name + ":</strong> " + chatText;
  }

  logChat.html(chatText);
  $("#chatLog").append(logChat)
})

// When chat message is deleted, delete from page
chat.on("child_removed", function (childSnap) {
  $("#" + childSnap.key). remove()
})

//* When player is added
users.on("child_added", function(childSnap) {
  console.log("player " + childSnap.key +  " added")
  window["player" + childSnap.key + "Log"] = true;
  window["player" + childSnap.key]  = childSnap.val()
})

// When player changes
users.on("child_changed", function(childSnap) {
  window["player" + childSnap.key]  = childSnap.val();
  updateStats(); //TODO
})

// When player leaves
users.on("child_removed", function(childSnap) {
  chat.push ({
    userID: "system",
    text: childSnap.val().name + " had disconnected"
  });

  window["player" + childSnap.key + "Log"] = false;
  window["player" + childSnap.key]  = {
    name: "",
    wins: 0,
    losses: 0,
    choice: "",
  }

  // If both players leave, clear the chat
  if (!player1Log && !player2Log) {
    chat.remove();
  }
  
})




// Function(s) ===============================================================

function submitName(event) {
  event.preventDefault();
  console.log("Event: ", event);

  if (!player1Log) {
    playerNumber = "1";
    console.log('playerNumber1:', playerNumber)
    playerObject = player1;
    console.log('playerObject1:', playerObject)
  }
  else if (!player2Log) {
    playerNumber = "2";
    console.log('playerNumber2:', playerNumber)
    playerObject = player2;
    console.log('playerObject2:', playerObject)
  }
  else {
    playerNumber = null;
    playerObject = null;
  }

  if (playerNumber) {
    playerName = $("#user").val().trim();;
    playerObject.name = playerName;
    $("#user").val("");

    $("#playerWaiting").toggle();
    $("#playerName").toggle();
    $("#playerName").text("Player: " + playerName);

    database.ref("/players/" + playerNumber).set(playerObject);
    database.ref("/players/" + playerNumber).onDisconnect().remove();
  }
}

function playGame() {
  $(".oneWaiting").empty();
  // Show selection screen

// If user is one, don't let click
  // TODO User 1 makes selection
  // TODO User 2 makes selection
  // TODO Push selections to firebase

}

function updateStats() {
  // TODO Show each users selection
  // TODO Show which user won
  // TODO Update win and loss
}

function submitChat(event) {
  event.preventDefault();
  console.log("You Clicked Chat")
  // TODO Show chat
  // TODO If user types something, push to firebase 
  chat.push({
    userID: playerNumber,
    name: playerName,
    text: $("#chat").val().trim(),
  });

  $("#chat").val("")
  // TODO Show chat message on both screens
}

function showLogin(){
  console.log("Login")
}

// Call ======================================
$(document).ready(function() {
  $("#submitPlayer").on("click", submitName);
  $("#submitChat").on("click", submitChat);
})
