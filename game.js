// convenient helper to look for stuff in either a specific element or the whole doc
function $(selector, container){
    return ( container || document ).querySelector(selector);
}


(function () {
    
    "use strict";
    
    var _ = self.Life = function (seed) {    
        this.seed = seed;
        // grid for the game is naturally multidim array
        this.height = seed.length;
        this.width = seed[0].length;    
        this.board = clone2DArray(seed); 
        this.previousBoard = [];
        this.started = false;
        this.autoplay = false;
    };
    
    
    _.prototype = {
      
        next: function() {
            // now, copy the current board into the previous board in order to calculate things
            this.previousBoard = clone2DArray(this.board);
            // now, old good double loop iteration
            for(var y=0; y<this.height;y++){
                for(var x=0; x<this.width;x++){
                    var neighbours = this.getAliveNeighbours(this.previousBoard, x, y);
                    //console.log("at row ", y, "pos", x, ":", alives);
                    var _isAlive = !!this.board[y][x];
                    if(_isAlive){
                        if(neighbours<2 || neighbours>3){
                            // die from either loneliness or overpopulation
                            this.board[y][x] = 0;
                        }
                    }
                    else{
                        if(neighbours == 3){
                            // when there are exactly 3, cell becomes alive as if by reproduction
                            this.board[y][x] = 1;
                        }
                    }
                }
            }
        },
        
        getAliveNeighbours: function(array, x, y){
            /* this is to prevent getting values from undefined references when we
               are checking the top and the last rows */
            var prevR = array[y-1] || [];
            var nextR = array[y+1] || [];
            
            return [
                prevR[x-1],prevR[x], prevR[x+1],
                array[y][x-1], array[y][x+1],
                nextR[x-1], nextR[x], nextR[x+1]
            ].reduce(function(a,b){
                return a + +!!b;
            }, 0);
            
        },
        
        toString: function() {
            return this.board.map(function(r) { return r.join(' '); }).join('\n');
        }
        
    };
    
    
    function clone2DArray(array){
        return array.slice().map(function(r) { return r.slice(); });  
    };
    

})();



// this is now the view
(function (){
    
    var _ = self.View = function(table, size){
        
        this.grid = table;
        this.size = size;
        
    };
    
    _.prototype = {
        createGrid: function (){
            var _me = this;
            var _table = document.createDocumentFragment();
            this.grid.innerHTML='';
            this.checkBoxes = [];
            
            for(var y=0; y<this.size;y++) {
                this.checkBoxes[y] = [];
                var _row = document.createElement('tr');
                for(var x=0; x<this.size;x++) {
                    var _cell = document.createElement('td');
                    var _cbox = document.createElement('input');
                    _cbox.type = 'checkbox';
                    // store also a data struct to know which cbox this is
                    _cbox.position = [y, x];    // row, col
                    _cell.appendChild(_cbox);
                    _row.appendChild(_cell);
                    this.checkBoxes[y][x] = _cbox;

                }
                _table.appendChild(_row);
            }
          
            this.grid.appendChild(_table);
            
            
            // listen for events on the grid
            this.grid.addEventListener('change', function(e){
                if(e.target.nodeName.toLowerCase() === "input")
                    this.started = false;
            });
            
            this.grid.addEventListener('keyup', function(e){
                var cbox = e.target;
                if(cbox.nodeName.toLowerCase() === "input"){
                    // get coords of current target
                    var x = cbox.position[1];                    
                    var y = cbox.position[0];

                    switch(e.keyCode){
                        case 37:    // left
                            if(x > 0)
                                _me.checkBoxes[y][x-1].focus();
                            break;
                        case 38:        // up
                            if(y > 0)
                                _me.checkBoxes[y-1][x].focus();
                            break;
                        case 39:        // right
                            if(x < (_me.size -1 ) )
                                _me.checkBoxes[y][x+1].focus();
                            break;
                        case 40:    // down
                             if(y < (_me.size -1 ) )
                                _me.checkBoxes[y+1][x].focus();
                            break;
                            
                    }
                }
            }, true);
            
            
        },
        
        // specify like this, to use it as a property
        get boardArray(){
            return this.checkBoxes.map(function(r){
                return r.map(function(c){
                    return +c.checked;
                });
            });
        },
    
        play: function() {
            this.newgame = new Life(this.boardArray);
            this.started = true;
        },
        
        next: function() {
            var me = this;
            if(!this.started || this.newgame){
                this.play();
            }
            // call next on the game logic to get the next board
            this.newgame.next();
            // now, according to the arrays from the game's board, set up the checkboxes accordingly
            for(var y=0; y<this.size;y++) {
                for(var x=0; x<this.size;x++) {
                    //console.log(x, ", ", y, " ", this.newgame.board[y][x])
                    this.checkBoxes[y][x].checked = !!this.newgame.board[y][x];
                }
            }
            
            if(this.autoplay){
                setTimeout( function(){
                    me.next(); 
                }, 500);
            }
        }
        
    };
        
    
    
})();



var lifeView = new View(document.getElementById('grid'), 12);
lifeView.createGrid();


(function(){
    
    var buttons = {
        next: $('button.next'),
        auto: $('#autoplay')
    };
    
    buttons.next.addEventListener('click', function(){
        lifeView.next();
    });
    
    buttons.auto.addEventListener('change', function(){
        buttons.next.textContent = this.checked ? 'Start' : 'Next'; 
        lifeView.autoplay = this.checked;
    });
    
})();





/* create one of the simplest examples in the wikipedia page, the 5x5 blinker */
/* arranging arrays like this does not please jslint but it makes it easier to 
   configure the initial state of the blinker visually */
/*var _game = new Life([[0,0,0,0,0],
                      [0,0,1,0,0],
                      [0,0,1,0,0],
                      [0,0,1,0,0],
                      [0,0,0,0,0]]);*/
/* the toad 6x6 */
var _game = new Life([[0,0,0,0,0,0],
                      [0,0,0,0,0,0],
                      [0,0,1,1,1,0],
                      [0,1,1,1,0,0],
                      [0,0,0,0,0,0],
                      [0,0,0,0,0,0]]);


// this requires implementing toString
console.log(_game.toString());

// move to the next state
_game.next();

// then check again
console.log(_game.toString());

_game.next();

// then check again
console.log(_game.toString());

_game.next();

// then check again
console.log(_game.toString());