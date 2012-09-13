monster.display = (function() {
    var dom = monster.dom,
        $ = dom.$,
        canvas, ctx,
        cols, rows,
        monsterSize,
        monsters,
        firstRun = true,
        cursor,
        previousCycle,
        animations = [];

    function setup() {
        var boardElement = $("#game-screen .game-board")[0];

        cols = monster.settings.cols;
        rows = monster.settings.rows;
        monsterSize = monster.settings.monsterSize;

        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        dom.addClass(canvas, "board");
        canvas.width = cols * monsterSize;
        canvas.height = rows * monsterSize;
        
        boardElement.appendChild(canvas);
        
        previousCycle = Date.now();
        requestAnimationFrame(cycle);
    }

    function addAnimation(runTime, fncs) {
        var anim = {
            runTime : runTime,
            startTime : Date.now(),
            pos : 0,
            fncs : fncs
        };
        animations.push(anim);
    }

    function renderAnimations(time, lastTime) {
        var anims = animations.slice(0),
            n = anims.length,
            animTime,
            anim,
            i;

        for (i=0;i<n;i++) {
            anim = anims[i];
            if (anim.fncs.before) {
                anim.fncs.before(anim.pos);
            }
            anim.lastPos = anim.pos;
            animTime = (lastTime - anim.startTime);
            anim.pos = animTime / anim.runTime;
            anim.pos = Math.max(0, Math.min(1, anim.pos));
        }

        animations = []; 

        for (i=0;i<n;i++) {
            anim = anims[i];
            anim.fncs.render(anim.pos, anim.pos - anim.lastPos);
            if (anim.pos == 1) {
                if (anim.fncs.done) {
                    anim.fncs.done();
                }
            } else {
                animations.push(anim);
            }
        }
    }

    function drawMonster (type, x, y){
		var monsterPiece = $("#game-screen .game-board .board")[0];
			image = monster.img["img/monsters" + monsterSize + ".png"];
		
		switch(type){
			case 0:
				ctx.fillStyle='#90FC1B';
				break;			
				
			case 1:
				ctx.fillStyle='#F9BA15';
				break;
				
			case 2:
				ctx.fillStyle='#AD2BAD';
				break;
				
			case 3:
				ctx.fillStyle='#DD0093';
				break;
				
			case 4:
				ctx.fillStyle='#00AAFF';
				break;
				
			default:
			case 5:
				ctx.fillStyle='#FD6100';
				break;
			
		};
		ctx.strokeStyle = '#00080E;';
		
		ctx.beginPath(); 
			ctx.moveTo((x*monsterSize)+(monsterSize/3), (y*monsterSize)+monsterSize); 
			ctx.lineTo((x*monsterSize)+(monsterSize/3)*2, (y*monsterSize)+monsterSize); 
			ctx.lineTo(x*monsterSize+monsterSize, (y*monsterSize)+(monsterSize/3)*2); 
			ctx.lineTo(x*monsterSize+monsterSize, (y*monsterSize)+(monsterSize/3)*1);
			ctx.lineTo((x*monsterSize)+(monsterSize/3)*2, y*monsterSize);
			ctx.lineTo((x*monsterSize)+(monsterSize/3)*1, y*monsterSize);
			ctx.lineTo(x*monsterSize, (y*monsterSize)+(monsterSize/3)*1);
			ctx.lineTo(x*monsterSize, (y*monsterSize)+(monsterSize/3)*2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		
		ctx.drawImage(
			image, 
			type * monsterSize, //x coordinate of image
			0, //y coordinate of image
			monsterSize, 
			monsterSize, 
			x*monsterSize,
			y*monsterSize,
			monsterSize,
			monsterSize
		);
		
		
	}
    function refill(newMonsters, callback) {
        var lastMonster = 0;
        addAnimation(1000, {
            render : function(pos) {
                var thisMonster = Math.floor(pos * cols * rows),
                    i, x, y;
                for (i = lastMonster; i < thisMonster; i++) {
                    x = i % cols;
                    y = Math.floor(i / cols);
                    clearMonster(x, y);
                    drawMonster(newMonsters[x][y], x, y);
                }
                lastMonster = thisMonster;
                canvas.style.webkitTransform =
                    "rotateX(" + (360 * pos) + "deg)";
            },
            done : function() {
                canvas.style.webkitTransform = "";
                callback();
            }
        });
    }


    function redraw(newMonsters, callback) {
        var x, y;
        monsters = newMonsters;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for (x = 0; x < cols; x++) {
            for (y = 0; y < rows; y++) {
                drawMonster(monsters[x][y], x, y);
            }
        }
        callback();
        renderCursor();
    }

    function clearMonster(x, y) {
        ctx.clearRect(x * monsterSize, y * monsterSize, monsterSize, monsterSize);
    }

    
    function clearCursor() {
        if (cursor) {
            var x = cursor.x,
                y = cursor.y;
            clearMonster(x, y);
            drawMonster(monsters[x][y], x, y);
        }
    }

    function renderCursor() {
        if (!cursor) {
            return;
        }
        var x = cursor.x,
            y = cursor.y;

        clearCursor();

        if (cursor.selected) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = 0.8;
            drawMonster(monsters[x][y], x, y);
            ctx.restore();
        }
        ctx.save();
        ctx.lineWidth = 0.05 * monsterSize;
        ctx.strokeStyle = "rgba(250,250,150,0.8)";
        ctx.strokeRect(
            (x + 0.05) * monsterSize, (y + 0.05) * monsterSize,
            0.9 * monsterSize, 0.9 * monsterSize
        );
        ctx.restore();
    }

    function setCursor(x, y, selected) {
        clearCursor();
        if (arguments.length > 0) {
            cursor = {
                x : x,
                y : y,
                selected : selected
            };
        } else {
            cursor = null;
        }
        renderCursor();
    }
    
    function moveMonsters(movedMonsters, callback) {
        var n = movedMonsters.length,
            oldCursor = cursor;
        cursor = null;
        movedMonsters.forEach(function(e) {
            var x = e.fromX, y = e.fromY,
                dx = e.toX - e.fromX,
                dy = e.toY - e.fromY,
                dist = Math.abs(dx) + Math.abs(dy);
            addAnimation(200 * dist, {
                before : function(pos) {
                    pos = Math.sin(pos * Math.PI / 2);
                    clearMonster(x + dx * pos, y + dy * pos);
                },
                render : function(pos) {
                    pos = Math.sin(pos * Math.PI / 2);
                    drawMonster(
                        e.type,
                        x + dx * pos, y + dy * pos
                    );
                },
                done : function() {
                    if (--n == 0) {
                        cursor = oldCursor;
                        callback();
                    }
                }
            });
        });
    }

    function removeMonsters(removedMonsters, callback) {
        var n = removedMonsters.length;
        removedMonsters.forEach(function(e) {
            addAnimation(400, {
                before : function() {
                    clearMonster(e.x, e.y);
                },
                render : function(pos) {
                    ctx.save();
                    ctx.globalAlpha = 1 - pos;
                    drawMonster(
                        e.type, e.x, e.y,
                        1 - pos, pos * Math.PI * 2
                    );
                    ctx.restore();
                },
                done : function() {
                    if (--n == 0) {
                        callback();
                    }
                }
            });
        });
    }

    function levelUp(callback) {
        addAnimation(1000, {
            before : function(pos) {
                var j = Math.floor(pos * rows * 2),
                    x, y;
                for (y=0,x=j;y<rows;y++,x--) {
                    if (x >= 0 && x < cols) {
                        clearMonster(x, y);
                        drawMonster(monsters[x][y], x, y);
                    }
                }
            },
            render : function(pos) {
                var j = Math.floor(pos * rows * 2),
                    x, y;
                ctx.save(); 
                ctx.globalCompositeOperation = "lighter";
                for (y=0,x=j;y<rows;y++,x--) {
                    if (x >= 0 && x < cols) { 
                        drawMonster(monsters[x][y], x, y, 1.1);
                    }
                }
                ctx.restore();
            },
            done : callback
        });
    }
        
    function gameOver(callback) {
        addAnimation(1000, {
            render : function(pos) {
                canvas.style.left =
                    0.2 * pos * (Math.random() - 0.5) + "em";
                canvas.style.top =
                    0.2 * pos * (Math.random() - 0.5) + "em";
            },
            done : function() {
                canvas.style.left = "0";
                canvas.style.top = "0";
            }
        });
		
		callback();
    }
    
    function renderCursor(time) {
        if (!cursor) {
            return;
        }
        var x = cursor.x,
            y = cursor.y,
            t1 = (Math.sin(time / 200) + 1) / 2,
            t2 = (Math.sin(time / 400) + 1) / 2;

        clearCursor();

        if (cursor.selected) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = 0.8 * t1;
            drawMonster(monsters[x][y], x, y);
            ctx.restore();
        }
        ctx.save();
        ctx.lineWidth = 0.05;
        ctx.strokeStyle =
            "rgba(250,250,150," + (0.5 + 0.5 * t2) + ")";
        ctx.strokeRect(x+0.05,y+0.05,0.9,0.9);
        ctx.restore();
    }

    function cycle(time) {
        renderCursor(time);
        renderAnimations(time, previousCycle);
        previousCycle = time;
        requestAnimationFrame(cycle);
    }

    function initialize(callback) {
        if (firstRun) {
            setup();
            firstRun = false;
        }
        callback();
    }

    return {
        initialize : initialize,
        redraw : redraw,
        setCursor : setCursor,
        moveMonsters : moveMonsters,
        removeMonsters : removeMonsters,
        refill : refill,
        levelUp : levelUp,
        gameOver : gameOver
    }
})();
