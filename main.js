// Vamos a creas 3 objetos, las barras la pelota y el pizarròn
(function () { // Funciòn anònima que se ejecuta a si misma, para no contaminar el scope del proyecto
    self.Board = function (width, height) {//declaramos al pizarròn, como si declararamos una clase
        this.width = width;
        this.height = height;
        this.playing = false;
        this.game_over = false;
        this.bars = [];
        this.ball = null;
    }
    self.Board.prototype = { //Estàmos declarando funciones o mètodos para el protipo
        get elements() { //getter para obtener elementos
            var elements = this.bars.map(function (bar) { return bar; });//Barras 
            elements.push(this.ball);//Pelota
            return elements;
        }
    }
})();
(function () {
    self.Bar = function (x, y, width, height, board) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.board.bars.push(this);
        this.kind = "rectangle";
        this.speed = 20;
    }
    self.Bar.prototype = {
        down: function () {
            this.y += this.speed;
        },
        up: function () {
            this.y -= this.speed;
        },
        toString: function () {
            return "x: " + this.x + " y: " + this.y;
        }
    }
})();
(function () {
    self.Ball = function (x, y, radius, board) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed_y = 0;
        this.speed_x = 3;
        this.board = board;
        this.direction = 1;
        this.bounce_angle = 0;
        this.max_bounce_angle = Math.PI / 12;
        this.speed = 3;
 
        board.ball = this;
        this.kind = "circle";



    }
    self.Ball.prototype = {
        move: function () {
            this.x += (this.speed_x * this.direction);
            this.y += (this.speed_y * this.direction);

        },
        get width() {
            return this.radius * 2;
        },
        get height() {
            return this.radius * 2;
        },
        collision: function(bar){

            var relative_intersect_y = ( bar.y + (bar.height / 2) ) - this.y;
            var normalized_intersect_y = relative_intersect_y / (bar.height / 2);

            this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;

            this.speed_y = this.speed * -Math.sin(this.bounce_angle);
            this.speed_x = this.speed * Math.cos(this.bounce_angle);

            if (this.x > (this.board.width / 2)) this.direction = -1;
            else this.direction = 1;

        }
    }

}());
(function () {//Funciòn anónima declarando una nueva clase
    self.BoardView = function (canvas, board) {//va a recibir el canvas y un objeto de la clase board
        this.canvas = canvas;//Este canvas lo obtenemos de HTML
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.ctx = canvas.getContext("2d");//Objeto a travez del que podemos dibujar en JS
    }
    self.BoardView.prototype = {
        clean: function () {
            this.ctx.clearRect(0, 0, this.board.width, this.board.height)

        },
        draw: function () {
            for (var i = this.board.elements.length - 1; i >= 0; i--) {
                var el = this.board.elements[i];
                draw(this.ctx, el);
            };
        },
        check_collisions: function () {
            
            for (var i = this.board.bars.length - 1; i >= 0; i--) {
                var bar = this.board.bars[i];
                if (hit(bar, this.board.ball)) {
                    this.board.ball.collision(bar);
                }
                
            }
        },
        play: function () {

            if (this.board.playing) {
                this.clean();
                this.draw();
                this.check_collisions();
                this.board.ball.move();

            }
            
        }
        
    }
    function hit(a, b) {
        //revisa si a coliciona con b
        
        var hit = false;
        //colliciónes horizontales
        if (b.x + b.width >= a.x && b.x < a.x + a.width) 
        {
            //verticales
            if (b.y + b.height >= a.y && b.y < a.y + a.height) 
                hit = true;
        }
        //colision de a con b
        if (b.x <= a.x && b.x + b.width >= a.x + a.width) 
        {
            if (b.y <= a.y && b.y + b.height >= a.y + a.height) 
                hit = true;
            
        }
        //colision de b con a
        if (a.x <= b.x && a.x + a.width >= b.x + b.width) 
        {
            if (a.y <= b.y && a.y + a.height >= b.y + b.height) 
                hit = true;
            
        }
        return hit;

    }
    function draw(ctx, element) {

        switch (element.kind) {
            case "rectangle":
                ctx.fillRect(element.x, element.y, element.width, element.height);
                break;
            case "circle":
                ctx.beginPath();
                ctx.arc(element.x, element.y, element.radius, 0, 7);
                ctx.fill();
                ctx.closePath();
                //console.log("okswitch");
                break;
        }


    }
})();

var board = new Board(800, 400);
var bar = new Bar(20, 100, 40, 100, board);
var bar2 = new Bar(700, 100, 40, 100, board);
var canvas = document.getElementById("canvas");
var board_view = new BoardView(canvas, board);
var ball = new Ball(350, 100, 10, board);


document.addEventListener("keydown", function (ev) {

    if (ev.key === "ArrowUp") {
        ev.preventDefault();
        bar.up();


    } else if (ev.key === "ArrowDown") {
        ev.preventDefault();
        bar.down();

    } else if (ev.key === "s") {
        ev.preventDefault();
        bar2.down();

    } else if (ev.key === "w") {
        ev.preventDefault();
        bar2.up();

    } else if (ev.key === "p") {
        ev.preventDefault();
        board.playing = !board.playing;

    }

});

board_view.draw();
window.requestAnimationFrame(controller);
/*setTimeout(function(){
    ball.direction =-1;
},4000)*/
function controller() {//Era main
    board_view.play();
    board_view.clean();
    board_view.draw();
    window.requestAnimationFrame(controller)
};