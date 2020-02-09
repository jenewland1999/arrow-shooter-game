var player;
var enemies = [];
var currentLevel = 1;
var lives = 0;
var arrowsContainer;
var enemiesContainer;
var treesContainer;
var messageContainer;
var upPressed = false;
var downPressed = false;
var leftPressed = false;
var rightPressed = false;
var spacePressed = false;
var movementHandlerID;
var projectileHandlerID;

// Number of lives the player starts with.
var STARTING_LIVES = 3;

/**
 * Sets the cardinal direction in which you want the player to face.
 *
 * @param {string} dir - The direction in which you want to set the player facing
 */
function setPlayerDirection(dir) {
    // Display the walk animation for the correct direction, remove the other directions
    // to ensure the player does not have both "left" and "right" applied at the same time
    player.classList.remove("up", "left", "right", "down");

    player.classList.add(dir);
}

/**
 * Gets the direction in which the player is facing.
 *
 * @returns {string} The direction the player is facing.
 */
function getEntityDirection(entity) {
    var entityDirection = "";

    if (entity.classList.contains("up")) {
        entityDirection = "up";
    }

    if (entity.classList.contains("right")) {
        entityDirection = "right";
    }

    if (entity.classList.contains("down")) {
        entityDirection = "down";
    }

    if (entity.classList.contains("left")) {
        entityDirection = "left";
    }

    return entityDirection;
}

function fireProjectile(sourceEntity) {
    var arrow = createElementWithClass("arrow");

    var VELOCITY = 0.5;

    var dirX = 5 * VELOCITY;
    var dirY = 0 * VELOCITY;
    var entityDirection = getEntityDirection(sourceEntity);

    if (entityDirection == "up") {
        arrow.classList.add("up");
        arrow.style.top = sourceEntity.offsetTop - 32 + "px";
        arrow.style.left = sourceEntity.offsetLeft + "px";
        dirX = 0;
        dirY = -5;
    }
    if (entityDirection == "down") {
        arrow.classList.add("down");
        arrow.style.top =
            sourceEntity.offsetTop + sourceEntity.clientHeight + 32 + "px";
        arrow.style.left = sourceEntity.offsetLeft + "px";
        dirX = 0;
        dirY = 5;
    }
    if (entityDirection == "left") {
        arrow.classList.add("left");
        arrow.style.top =
            sourceEntity.offsetTop + sourceEntity.clientHeight / 2 + "px";
        arrow.style.left =
            sourceEntity.offsetLeft - sourceEntity.clientWidth + "px";
        dirX = -5;
        dirY = 0;
    }
    if (entityDirection == "right") {
        arrow.classList.add("right");
        arrow.style.top =
            sourceEntity.offsetTop + sourceEntity.clientHeight / 2 + "px";
        arrow.style.left =
            sourceEntity.offsetLeft + sourceEntity.clientWidth + "px";
        dirX = 5;
        dirY = 0;
    }

    arrowsContainer.appendChild(arrow);

    var arrowIntervalID = setInterval(function() {
        var arrowPosX = arrow.offsetLeft;
        var arrowPosY = arrow.offsetTop;

        var objectColliding = getCollidingElement(arrow, sourceEntity);

        if (isCollidingWithViewport(arrow)) {
            // Stop the arrow's motion.
            clearInterval(arrowIntervalID);
            return;
        }

        if (objectColliding != undefined) {
            if (isEnemy(objectColliding)) {
                arrow.remove();
                killEnemy(objectColliding);
            } else if (isPlayer(objectColliding)) {
                arrow.remove();
                removeLife();
            }

            // Stops the arrow's motion
            clearInterval(arrowIntervalID);

            return;
        }

        // No collision; move arrow.
        arrow.style.left = arrowPosX + dirX + "px";
        arrow.style.top = arrowPosY + dirY + "px";
    }, 10);
}

/**
 * Returns a boolean as to whether or not the element passed contains the class tree.
 *
 * @param {object} element - The HTML Element in which to check for the class of "tree".
 * @returns {boolean} Whether or not the element has the class of tree
 */
function isTree(element) {
    return element.classList.contains("blocking");
}

/**
 * Returns a boolean as to whether or not the element passed contains the class enemy.
 *
 * @param {object} element - The HTML Element in which to check for the class of "enemy".
 * @returns {boolean} Whether or not the element has the class of enemy
 */
function isEnemy(element) {
    return element.classList.contains("enemy");
}

/**
 * Returns a boolean as to whether or not the element passed contains the class player.
 *
 * @param {object} element - The HTML Element in which to check for the class of "player".
 * @returns {boolean} Whether or not the element has the class of player
 */
function isPlayer(element) {
    return element.classList.contains("character");
}

/**
 * Creates a DIV element with an initial class.
 *
 * @param {string} className - The name of a single class to add to the created element.
 * @returns {object} The element that has been created.
 */
function createElementWithClass(className) {
    var element = document.createElement("div");
    element.classList.add(className);

    return element;
}

function createElementWithClassList(classList) {
    var element = document.createElement("div");
    classList.forEach(function(c) {
        element.classList.add(c);
    });

    return element;
}

/**
 * Checks if the provided element is colliding with the viewport.
 *
 * @param {object} arrow - The element in which you are checking to see if it collided with the viewport
 * @returns {boolean} Whether or not the element is colliding with the viewport bounds.
 */
function isCollidingWithViewport(arrow) {
    return (
        parseInt(arrow.style.top) < 0 ||
        parseInt(arrow.style.left) + arrow.offsetWidth > window.innerWidth ||
        parseInt(arrow.style.top) + arrow.offsetHeight > window.innerHeight ||
        parseInt(arrow.style.left) < 0
    );
}

function getCollidingElement(element, excludedEntity = element) {
    var elementX = element.offsetLeft;
    var elementY = element.offsetTop;
    var elementHeight = element.offsetHeight;
    var elementWidth = element.offsetWidth;

    var shouldCollide = function(element) {
        return (
            element != excludedEntity &&
            (element.classList.contains("character") ||
                element.classList.contains("blocking") ||
                (element.classList.contains("enemy") &&
                    !element.classList.contains("dead") &&
                    !element.classList.contains("hide") &&
                    !element.classList.contains("appear")))
        );
    };

    var collisionCandidates = [].concat(
        // Top Left
        document.elementsFromPoint(elementX, elementY),

        // Top Right
        document.elementsFromPoint(elementX + elementWidth, elementY),

        // Bottom Left
        document.elementsFromPoint(elementX, elementY + elementHeight),

        // Bottom Right
        document.elementsFromPoint(
            elementX + elementWidth + 1,
            elementY + elementHeight + 1
        )
    );

    if (collisionCandidates.filter(shouldCollide).length > 0) {
        return collisionCandidates.find(shouldCollide);
    }

    return undefined;
}

function removeEnemy(enemy) {
    removeEnemyActions(enemy);
    enemy.remove();
    enemies = enemies.filter(function(e) {
        return e != enemy;
    });
}

function removeEnemyActions(enemy) {
    clearInterval(enemy.visibilityHandlerID);
    clearInterval(enemy.firingHandlerID);
}

function killEnemy(enemy) {
    removeEnemyActions(enemy);
    enemy.classList.add("dead");
    setTimeout(removeEnemy, 1000, enemy);

    if (enemies.length <= 1) {
        gameOver(true);
    }
}

function addLife() {
    lives++;
    var life = document.createElement("li");
    document.getElementsByClassName("health")[0].appendChild(life);
}

function removeLife() {
    lives--;

    if (lives == 0) {
        player.classList.add("dead");
        disableControls();
        enemies.forEach(removeEnemyActions);
        setTimeout(gameOver, 3000, false);
    }

    if (lives >= 0) {
        document.getElementsByClassName("health")[0].firstChild.remove();
    }
}

function showEnemy(enemy) {
    enemy.classList.remove("hide");
    enemy.classList.add("appear");
    setTimeout(function() {
        enemy.classList.remove("appear");
    }, 1000);
}

function hideEnemy(enemy) {
    enemy.classList.add("hide");
}

function toggleEnemy(enemy) {
    if (enemy.classList.contains("hide")) {
        showEnemy(enemy);
    } else {
        hideEnemy(enemy);
    }
}

function gameOver(hasWon) {
    var button = document.getElementsByClassName("button")[0];
    var message = document.getElementsByClassName("message")[0];

    // Remove the classes from both messageContainer and the button before setting them on either side of the hasWon if statement
    messageContainer.classList.remove("hide");
    button.classList.remove("danger", "success");

    // Clear the intervals that allow movement and firing the player's projectiles
    disableControls();

    if (hasWon) {
        currentLevel++;
        message.innerText = "You Win!";
        button.classList.add("success");
        button.innerText = "Begin Level " + currentLevel;
    } else {
        currentLevel = 1;
        message.innerText = "Try Again?";
        button.classList.add("danger");
        button.innerText = "Restart";
    }
}

function enableControls() {
    movementHandlerID = setInterval(movementHandler, 10);
    projectileHandlerID = setInterval(projectileHandler, 500);
}

function disableControls() {
    clearInterval(movementHandlerID);
    clearInterval(projectileHandlerID);
}

function projectileHandler() {
    if (spacePressed) {
        fireProjectile(player);
        player.classList.add("fire");
    } else {
        player.classList.remove("fire");
    }
}

function beginLevel() {
    while (lives < STARTING_LIVES) {
        addLife();
    }

    enableControls();

    player.classList.remove("dead");

    messageContainer.classList.add("hide");

    clearLevel();

    var noOfTrees = Math.floor(Math.random() * 6) + 4;
    for (var i = 0; i < noOfTrees; i++) {
        positionElement(createTree());
    }

    for (var i = 0; i < currentLevel; i++) {
        positionElement(createEnemy());
    }

    positionElement(player);
}

function positionElement(element) {
    do {
        element.style.left =
            Math.random() * (window.innerWidth - element.clientWidth) + "px";
        element.style.top =
            Math.random() * (window.innerHeight - element.clientHeight) + "px ";
    } while (getCollidingElement(element) != undefined);
}

function clearLevel() {
    enemies.forEach(removeEnemy);
    arrowsContainer.innerHTML = "";
    enemiesContainer.innerHTML = "";
    treesContainer.innerHTML = "";
}

function getRandomDirection() {
    return ["up", "down", "left", "right"][Math.floor(Math.random() * 4) % 4];
}

function createEnemy() {
    var enemy = createElementWithClassList([
        "enemy",
        "grey",
        "stand",
        getRandomDirection()
    ]);
    var enemyHead = createElementWithClass("head");
    var enemyBody = createElementWithClass("body");
    var enemyWeapon = createElementWithClassList(["weapon", "bow"]);

    enemy.appendChild(enemyHead);
    enemy.appendChild(enemyBody);
    enemy.appendChild(enemyWeapon);

    enemiesContainer.appendChild(enemy);
    enemies.push(enemy);

    setTimeout(function() {
        enemy.visibilityHandlerID = setInterval(
            enemyVisibilityHandler,
            5000,
            enemy
        );
    }, Math.random() * 3000);

    setTimeout(function() {
        enemy.firingHandlerID = setInterval(enemyFiringHandler, 500, enemy);
    }, Math.random() * 3000);

    return enemy;
}

function createTree() {
    var groot = createElementWithClassList(["tree", "blocking"]);
    treesContainer.appendChild(groot);
    return groot;
}

function enemyFiringHandler(enemy) {
    if (Math.random() > 0.5) {
        enemy.classList.remove("left", "right", "up", "down");
        enemy.classList.add(getRandomDirection());
    }

    if (
        Math.random() > 0.25 &&
        !enemy.classList.contains("hide") &&
        !enemy.classList.contains("appear")
    ) {
        fireProjectile(enemy);
    }
}

function enemyVisibilityHandler(enemy) {
    if (Math.random() > 0.5) {
        toggleEnemy(enemy);
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
    arrowsContainer = document.getElementById("arrows");
    messageContainer = document.getElementById("gameOverlay");
    enemiesContainer = document.getElementById("enemies");
    treesContainer = document.getElementById("trees");

    beginLevel();

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    // Sidebar menu open/close mechanism
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
    document
        .getElementsByClassName("button")[0]
        .addEventListener("click", beginLevel);
}

document.addEventListener("DOMContentLoaded", gameStart);
