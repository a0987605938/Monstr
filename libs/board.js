monster.board = (function() {
    var settings,
        monsters,
        cols,
        rows,
        baseScore,
        numMonsterTypes;

    function randomMonster() {
        return Math.floor(Math.random() * numMonsterTypes);
    }

    function getMonster(x, y) {
        if (x < 0 || x > cols-1 || y < 0 || y > rows-1) {
            return -1;
        } else {
            return monsters[x][y];
        }
    }
    
    function fillBoard() {
        var x, y,
            type;
        monsters = [];
        for (x = 0; x < cols; x++) {
            monsters[x] = [];
            for (y = 0; y < rows; y++) {
                type = randomMonster();
                while ((type === getMonster(x-1, y) &&
                        type === getMonster(x-2, y)) ||
                       (type === getMonster(x, y-1) &&
                        type === getMonster(x, y-2))) {
                    type = randomMonster();
                }
                monsters[x][y] = type;
            }
        }
        if (!hasMoves()) {
            fillBoard();
        }
    }
    
    function checkChain(x, y) {
        var type = getMonster(x, y),
            left = 0, right = 0,
            down = 0, up = 0;

        while (type === getMonster(x + right + 1, y)) {
            right++;
        }

        while (type === getMonster(x - left - 1, y)) {
            left++;
        }

        while (type === getMonster(x, y + up + 1)) {
            up++;
        }

        while (type === getMonster(x, y - down - 1)) {
            down++;
        }

        return Math.max(left + 1 + right, up + 1 + down);
    }

    function canSwap(x1, y1, x2, y2) {
        var type1 = getMonster(x1,y1),
            type2 = getMonster(x2,y2),
            chain;

        if (!isAdjacent(x1, y1, x2, y2)) {
            return false;
        }

        monsters[x1][y1] = type2;
        monsters[x2][y2] = type1;

        chain = (checkChain(x2, y2) > 2 
              || checkChain(x1, y1) > 2);

        monsters[x1][y1] = type1;
        monsters[x2][y2] = type2;

        return chain;
    }

    function isAdjacent(x1, y1, x2, y2) {
        var dx = Math.abs(x1 - x2),
            dy = Math.abs(y1 - y2);
        return (dx + dy === 1);
    }
    
    function getChains() {
        var x, y,
            chains = [];

        for (x = 0; x < cols; x++) {
            chains[x] = [];
            for (y = 0; y < rows; y++) {
                chains[x][y] = checkChain(x, y);
            }
        }
        return chains;
    }
    
    function getBoard() {
        var copy = [],
            x;
        for (x = 0; x < cols; x++) {
            copy[x] = monsters[x].slice(0);
        }
        return copy;
    }


    function hasMoves() {
        for (var x = 0; x < cols; x++) {
            for (var y = 0; y < rows; y++) {
                if (canMonsterMove(x, y)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    function check(events) {
        var chains = getChains(), 
            hadChains = false, score = 0,
            removed = [], moved = [], gaps = [];

        for (var x = 0; x < cols; x++) {
            gaps[x] = 0;
            for (var y = rows-1; y >= 0; y--) {
                if (chains[x][y] > 2) {
                    hadChains = true;
                    gaps[x]++;
                    removed.push({
                        x : x, y : y,
                        type : getMonster(x, y)
                    });
  
						score += baseScore
                           * Math.pow(2, (chains[x][y] - 3));

                } else if (gaps[x] > 0) {
                    moved.push({
                        toX : x, toY : y + gaps[x],
                        fromX : x, fromY : y,
                        type : getMonster(x, y)
                    });
                    monsters[x][y + gaps[x]] = getMonster(x, y);
                }
            }
            
            for (y = 0; y < gaps[x]; y++) {
                monsters[x][y] = randomMonster();
                moved.push({
                    toX : x, toY : y,
                    fromX : x, fromY : y - gaps[x],
                    type : monsters[x][y]
                });
            }
        }
        
        events = events || [];

        if (hadChains) {
            events.push({
                type : "remove",
                data : removed
            }, {
                type : "score",
                data : score
            }, {
                type : "move",
                data : moved
            });
            
            if (!hasMoves()) {
                fillBoard();
                events.push({
                    type : "refill",
                    data : getBoard()
                });
            }

            return check(events);
        } else {
            return events;
        }

    }
    
    function canMonsterMove(x, y) {
        return ((x > 0 && canSwap(x, y, x-1 , y)) ||
                (x < cols-1 && canSwap(x, y, x+1 , y)) ||
                (y > 0 && canSwap(x, y, x , y-1)) ||
                (y < rows-1 && canSwap(x, y, x , y+1)));
    }

    function swap(x1, y1, x2, y2, callback) {
        var tmp, swap1, swap2,
            events = [];
        swap1 = {
            type : "move",
            data : [{
                type : getMonster(x1, y1),
                fromX : x1, fromY : y1, toX : x2, toY : y2
            },{
                type : getMonster(x2, y2),
                fromX : x2, fromY : y2, toX : x1, toY : y1
            }]
        };
        swap2 = {
            type : "move",
            data : [{
                type : getMonster(x2, y2),
                fromX : x1, fromY : y1, toX : x2, toY : y2
            },{
                type : getMonster(x1, y1),
                fromX : x2, fromY : y2, toX : x1, toY : y1
            }]
        };
        if (isAdjacent(x1, y1, x2, y2)) {
            events.push(swap1);
            if (canSwap(x1, y1, x2, y2)) {
                tmp = getMonster(x1, y1);
                monsters[x1][y1] = getMonster(x2, y2);
                monsters[x2][y2] = tmp;
                events = events.concat(check());
            } else {
                events.push(swap2, {type : "badswap"});
            }
            callback(events);
        }
    }
    
    
    function initialize(startMonsters, callback) {
        settings = monster.settings
        numMonsterTypes = settings.numMonsterTypes,
        baseScore = settings.baseScore,
        cols = settings.cols;
        rows = settings.rows;
		
        if (startMonsters) {
            monsters = startMonsters;
        } else {
            fillBoard();
        }
        callback();
    }

    return {
        initialize : initialize,
        swap : swap,
        canSwap : canSwap,
        getBoard : getBoard,
    };

})();
