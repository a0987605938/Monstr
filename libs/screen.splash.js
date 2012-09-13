monster.screens["splash-screen"] = (function() {
    var game = monster.game,
        dom = monster.dom,
        $ = dom.$,
        firstRun = true;
        
    function setup(getLoadProgress) {
        var scr = $("#splash-screen")[0];
        function checkProgress() {
            var p = getLoadProgress() * 100;
            $(".indicator",scr)[0].style.width = p + "%";
            if (p == 100) {
                $(".continue",scr)[0].style.display = "block";
                dom.bind(scr, "click", function() {
                    monster.game.showScreen("main-menu");
                });
            } else {
                setTimeout(checkProgress, 30);
            }
        }

        checkProgress();
    }
    
    function run(getLoadProgress) {
        if (firstRun) {
            setup(getLoadProgress);
            firstRun = false;
        }
    }

    return {
        run : run
    };
})();
