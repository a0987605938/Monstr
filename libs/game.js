monster.game = (function() {
    var dom = monster.dom,
        $ = dom.$;
 
	function showScreen(screenId) {
        var activeScreen = $("#game .screen.active")[0],
            screen = $("#" + screenId)[0];
        if (activeScreen) {
            dom.removeClass(activeScreen, "active");
        }
        
        // extract screen parameters from arguments
        var args = Array.prototype.slice.call(arguments, 1);
        // run the screen module
        monster.screens[screenId].run.apply(
            monster.screens[screenId], args
        );

        // display the screen html
        dom.addClass(screen, "active");
    }
	
   function createBackground(){		
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			background = $('#game .background')[0],
			rect = background.getBoundingClientRect(), //returns the dimension of background
			gradient,
			m = monster.settings.monsterSize;
			
		canvas.width = rect.width;
		canvas.height = rect.height;
			
		/* create checker */
		tile_cols = canvas.width / m;
		tile_rows = canvas.height / m;

		for (var i=0; i<tile_cols; i++){
			for (var j=0; j<tile_rows; j++){
				var x = Math.ceil(Math.random()*3);
				
				switch(x){
					case 1:
						ctx.fillStyle = 'black';
						break;
					
					case 2:
						ctx.fillStyle = '#0C2430';
						break;
						
					default:
					case 3:
						ctx.fillStyle = '#00080E';
						break;	
				}
			
				ctx.strokeStyle = 'black';
				ctx.beginPath(); 
				ctx.moveTo((i*m)+(m/3), (j*m)+m); 
				ctx.lineTo((i*m)+(m/3)*2, (j*m)+m); 
				ctx.lineTo(i*m+m, (j*m)+(m/3)*2); 
				ctx.lineTo(i*m+m, (j*m)+(m/3)*1);
				ctx.lineTo((i*m)+(m/3)*2, j*m);
				ctx.lineTo((i*m)+(m/3)*1, j*m);
				ctx.lineTo(i*m, (j*m)+(m/3)*1);
				ctx.lineTo(i*m, (j*m)+(m/3)*2);
				ctx.closePath();
				
				ctx.fill();
				ctx.stroke();
				
			};
		};		
		
		/* add canvas to html element */
		background.appendChild(canvas); 
	}


    function setup() {
      
        dom.bind(document, "touchmove", function(event) {
            event.preventDefault();
        });
        
		// hide the address bar on Android devices
        if (/Android/.test(navigator.userAgent)) {
            $("html")[0].style.height = "200%";
            setTimeout(function() {
                window.scrollTo(0, 1);
            }, 0);
        }
		
        createBackground();
    }

    return {
        setup : setup,
        showScreen : showScreen
    };
})();
