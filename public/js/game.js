var player;
var upPressed = false;
var downPressed = false;
var leftPressed = false;
var rightPressed = false;
var spacePressed = false;

function setPlayerDirection(dir) {
  // Display the walk animation for the correct direction, remove the other directions
  // to ensure the player does not have both "left" and "right" applied at the same time
  player.classList.remove("up");
  player.classList.remove("left");
  player.classList.remove("right");
  player.classList.remove("down");

  player.classList.add(dir);
}

function getPlayerDirection() {
  var playerDirection = "";

  if (player.classList.contains("up")) {
    playerDirection = "up";
  }

  if (player.classList.contains("right")) {
    playerDirection = "right";
  }

  if (player.classList.contains("down")) {
    playerDirection = "down";
  }

  if (player.classList.contains("left")) {
    playerDirection = "left";
  }

  return playerDirection;
}

function fireProjectile() {
  var arrowContainer = document.getElementById("arrows");
  var arrow = document.createElement("div");

  arrow.classList.add("arrow");

  var VELOCITY = 0.5;

  var dirX = 5 * VELOCITY;
  var dirY = 0 * VELOCITY;
  var playerDirection = getPlayerDirection();

  if (playerDirection == "up") {
    arrow.classList.add("up");
    arrow.style.top = player.offsetTop - 32 + "px";
    arrow.style.left = player.offsetLeft + "px";
    dirX = 0;
    dirY = -5;
  }
  if (playerDirection == "down") {
    arrow.classList.add("down");
    arrow.style.top = player.offsetTop + player.clientHeight + 32 + "px";
    arrow.style.left = player.offsetLeft + "px";
    dirX = 0;
    dirY = 5;
  }
  if (playerDirection == "left") {
    arrow.classList.add("left");
    arrow.style.top = player.offsetTop + player.clientHeight / 2 + "px";
    arrow.style.left = player.offsetLeft - player.clientWidth + "px";
    dirX = -5;
    dirY = 0;
  }
  if (playerDirection == "right") {
    arrow.classList.add("right");
    arrow.style.top = player.offsetTop + player.clientHeight / 2 + "px";
    arrow.style.left = player.offsetLeft + player.clientWidth + "px";
    dirX = 5;
    dirY = 0;
  }

  arrowContainer.appendChild(arrow);

  setInterval(function() {
    var arrowPosX = arrow.offsetLeft;
    var arrowPosY = arrow.offsetTop;

    var windowColliding = projectileCollisionHandler(arrow);
    var objectColliding = projectileBoundingBoxHandler(arrow);

    if (!windowColliding && !objectColliding) {
      arrow.style.left = arrowPosX + dirX + "px";
      arrow.style.top = arrowPosY + dirY + "px";
    } else {
      setTimeout(function() {
        arrow.remove();
      }, 1000);
    }
  }, 10);
}

function projectileCollisionHandler(arrow) {
  return (
    parseInt(arrow.style.top) < 0 ||
    parseInt(arrow.style.left) + arrow.offsetWidth > window.innerWidth ||
    parseInt(arrow.style.top) + arrow.offsetHeight > window.innerHeight ||
    parseInt(arrow.style.left) < 0
  );
}

function projectileBoundingBoxHandler(arrow) {
  var colliding = false;

  var arrowX = arrow.offsetLeft;
  var arrowY = arrow.offsetTop;
  var arrowHeight = arrow.offsetHeight;
  var arrowWidth = arrow.offsetWidth;

  var arrowTopLeft = document.elementFromPoint(arrowX - 1, arrowY - 1);
  var arrowTopRight = document.elementFromPoint(
    arrowX + arrowWidth + 1,
    arrowY - 1
  );
  var arrowBottomLeft = document.elementFromPoint(
    arrowX - 1,
    arrowY + arrowHeight + 1
  );
  var arrowBottomRight = document.elementFromPoint(
    arrowX + arrowWidth + 1,
    arrowY + arrowHeight + 1
  );

  if (
    arrowTopLeft != undefined &&
    arrowTopRight != undefined &&
    arrowBottomLeft != undefined &&
    arrowBottomRight != undefined
  ) {
    if (
      !arrowTopLeft.classList.contains("blocking") &&
      !arrowTopRight.classList.contains("blocking") &&
      !arrowBottomLeft.classList.contains("blocking") &&
      !arrowBottomRight.classList.contains("blocking")
    ) {
      colliding = false;
    } else {
      colliding = true;
    }
  }

  return colliding;
}

function projectileHandler() {
  if (spacePressed) {
    fireProjectile();
    player.classList.add("fire");
  } else {
    player.classList.remove("fire");
  }
}

function movementHandler() {
  var left = player.offsetLeft;
  var top = player.offsetTop;

  if (downPressed) {
    setPlayerDirection("down");
    top = top + 1;
  }

  if (upPressed) {
    setPlayerDirection("up");
    top = top - 1;
  }

  if (leftPressed) {
    setPlayerDirection("left");
    left = left - 1;
  }

  if (rightPressed) {
    setPlayerDirection("right");
    left = left + 1;
  }

  // Get the the element at the coordinates for where the play will move to
  // All 4 corners of the player are required to check there is no collision on any side
  var playerTopLeft = document.elementFromPoint(left, top);
  var playerTopRight = document.elementFromPoint(left + 32, top);
  var playerBottomLeft = document.elementFromPoint(left, top + 48);
  var playerBottomRight = document.elementFromPoint(left + 32, top + 48);

  // If the element that the player is about to walk over contains the class "blocking" then
  // the player is not moved.
  // The player will only be moved to coordinates `top` and `left` if the element in that position is not blocking

  if (
    playerTopLeft != undefined &&
    playerTopRight != undefined &&
    playerBottomLeft != undefined &&
    playerBottomRight != undefined
  ) {
    if (
      !playerTopLeft.classList.contains("blocking") &&
      !playerTopRight.classList.contains("blocking") &&
      !playerBottomLeft.classList.contains("blocking") &&
      !playerBottomRight.classList.contains("blocking")
    ) {
      player.style.left = left + "px";
      player.style.top = top + "px";
    }

    // If any of the keys are being pressed, display the walk animation
    if (leftPressed || rightPressed || upPressed || downPressed) {
      player.classList.add("walk");
      player.classList.remove("stand");
    }
    // Otherwise, no keys are being pressed, display stand
    else {
      player.classList.add("stand");
      player.classList.remove("walk");
    }
  }
}

function setHead(event) {
  if (event.srcElement.id != "") {
    document
      .getElementById("player")
      .getElementsByClassName("head")[0].style.backgroundImage =
      "url(./public/images/" + event.srcElement.id + ".png)";
  }
}

function setBody(event) {
  if (event.srcElement.id != "") {
    document
      .getElementById("player")
      .getElementsByClassName("body")[0].style.backgroundImage =
      "url(./public/images/" + event.srcElement.id + ".png)";
  }
}

function keyUp(event) {
  if (event.keyCode == 32) {
    spacePressed = false;
  }

  if (event.keyCode == 37 || event.keyCode == 65) {
    leftPressed = false;
  }

  if (event.keyCode == 39 || event.keyCode == 68) {
    rightPressed = false;
  }

  if (event.keyCode == 38 || event.keyCode == 87) {
    upPressed = false;
  }

  if (event.keyCode == 40 || event.keyCode == 83) {
    downPressed = false;
  }
}

function keyDown(event) {
  if (event.keyCode == 32) {
    spacePressed = true;
  }

  if (event.keyCode == 37 || event.keyCode == 65) {
    leftPressed = true;
  }

  if (event.keyCode == 39 || event.keyCode == 68) {
    rightPressed = true;
  }

  if (event.keyCode == 38 || event.keyCode == 87) {
    upPressed = true;
  }

  if (event.keyCode == 40 || event.keyCode == 83) {
    downPressed = true;
  }
}

function gameStart() {
  player = document.getElementById("player");

  setInterval(movementHandler, 10);
  setInterval(projectileHandler, 500);

  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  player.addEventListener("click", function() {
    document.getElementsByTagName("aside")[0].classList.add("open");
  });
  document.getElementById("closeside").addEventListener("click", function() {
    document.getElementsByTagName("aside")[0].classList.remove("open");
  });

  document
    .getElementsByClassName("heads")[0]
    .addEventListener("click", setHead);
  document
    .getElementsByClassName("bodies")[0]
    .addEventListener("click", setBody);
}

document.addEventListener("DOMContentLoaded", gameStart);
