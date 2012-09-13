var monster = {
    screens : {},
	settings : {
        rows : 9,
        cols : 8,
        baseScore : 100,
        numMonsterTypes : 6,
        baseLevelTimer : 60000, //change back before production
        baseLevelScore : 1500,
        baseLevelExp : 1.05,
        controls : {
            KEY_UP : "moveUp",
            KEY_LEFT : "moveLeft",
            KEY_DOWN : "moveDown",
            KEY_RIGHT : "moveRight",
            KEY_ENTER : "selectMonster",
            KEY_SPACE : "selectMonster",
            CLICK : "selectMonster",
            TOUCH : "selectMonster"
        }
    },
    img : {}
};

window.addEventListener("load", function() {

var monsterProto = document.getElementById("monster-proto"),
    rect = monsterProto.getBoundingClientRect();

monster.settings.monsterSize = rect.width;


Modernizr.addTest("standalone", function() {
    return (window.navigator.standalone != false);
});

yepnope.addPrefix("preload", function(resource) {
    resource.noexec = true;
    return resource;
});

var numPreload = 0,
    numLoaded = 0;

yepnope.addPrefix("loader", function(resource) {
    
    var isImage = /.+\.(jpg|png|gif)$/i.test(resource.url);
    resource.noexec = isImage;

    numPreload++;
    resource.autoCallback = function(e) {
        numLoaded++;
        if (isImage) {
            var image = new Image();
            image.src = resource.url;
            monster.img[resource.url] = image;
        }
    };
    return resource;
});

function getLoadProgress() {
    if (numPreload > 0) {
        return numLoaded / numPreload;
    } else {
        return 0;
    }
}

// loading stage 1
Modernizr.load([
{
    test : Modernizr.localstorage,
    yep : "libs/storage.js",
    nope : "libs/storage.cookie.js"
},{ 
    load : [
        "libs/sizzle.js",
        "libs/dom.js",
        "libs/requestAnimationFrame.js",
        "libs/game.js"
    ]
},{
    test : Modernizr.standalone,
    yep : "libs/screen.splash.js",
    nope : "libs/screen.install.js",
    complete : function() {
        monster.game.setup();
        if (Modernizr.standalone) {
            monster.game.showScreen("splash-screen",
                getLoadProgress);
        } else {
            monster.game.showScreen("install-screen");
        }
    }
}
]);

// loading stage 2
if (Modernizr.standalone) {
    Modernizr.load([
    {
        load : [
			"loader!libs/board.js",
			"loader!libs/display.canvas.js",
            "loader!libs/input.js",
			"loader!libs/screen.hiscore.js",
            "loader!libs/screen.main-menu.js",
            "loader!libs/screen.game.js",
            "loader!img/monsters"
                + monster.settings.monsterSize + ".png"
        ]
    }
    ]);
}



}, false);
