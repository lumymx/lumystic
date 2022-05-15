function setup() {
  let canvas = new Canvas();
  canvas.setup();
}

function draw() {
  let canvas = new Canvas();
  canvas.draw();
}

class Canvas {
  constructor() {
    if (Canvas._instance) {
      return Canvas._instance;
    }
    Canvas._instance = this;
    height = windowHeight;
    width = windowWidth;
    _grid = 30;
    this.dots = [];
    this.dsize = 10;
    let physics = new Physics();
    this.g_result = physics.g_result;
  }
  get mspos() {
    return createVector(mouseX, mouseY);
  }
  get mspos_gr() {
    let msx = mouseX;
    let msy = mouseY;
    if (chbox.checked) {
      return createVector(
        round(msx / _grid) * _grid,
        round(msy / _grid) * _grid
      );
    } else {
      return createVector(msx, msy);
    }
  }
  setup() {
    var canvas = createCanvas(width, height);
    canvas.parent("canvas_block");
  }
  draw() {
    background(220);
    strokeWeight(1);
    stroke(200, 200, 200);
    for (let i = 0; i <= int(width / _grid); i++) {
      line(i * _grid, 0, i * _grid, height);
    }
    for (let i = 0; i <= int(height / _grid); i++) {
      line(0, i * _grid, width, i * _grid);
    }
    noStroke();
    switch (this.state) {
      case 2:
      case 3:
        this.new_dot();
    }
    for (let dot of this.dots) {
      dot.show();
      if (dot instanceof Node) {
        dot.move();
        dot.walls();
      }
    }
  }
  mode(md) {
    document.getElementById("drag").style.background = "black";
    document.getElementById("bond").style.background = "black";
    document.getElementById("pin").style.background = "black";
    document.getElementById("node").style.background = "black";
    this.state = md;
    switch (this.state) {
      case 0:
        document.getElementById("drag").style.background = "white";
        break;
      case 1:
        document.getElementById("bond").style.background = "white";
        break;
      case 2:
        document.getElementById("pin").style.background = "white";
        break;
      case 3:
        document.getElementById("node").style.background = "white";
    }
  }
  new_dot() {
    if (mouseButton == LEFT && mouseIsPressed == true) {
      let dot_near = false;
      let canvas = new Canvas();
      let mspos_gr = canvas.mspos_gr;
      for (let i = 0; i < this.dots.length; i++) {
        let vec = p5.Vector.sub(mspos_gr, this.dots[i].pos);
        let dist = vec.mag();
        if (dist < this.dsize + 2.5) dot_near = true;
      }
      if (dot_near == false) {
        switch (this.state) {
          case 2:
            this.dots.push(new Pin(mspos_gr));
            break;
          case 3:
            this.dots.push(
              new Node(
                mspos_gr,
                createVector(0, 0),
                createVector(0, this.g_result)
              )
            );
            break;
        }
      }
    }
  }
}

class Physics {
  _g = 9.8066;
  _energy = 0.9;
  constructor() {
    if (Physics._instance) {
      return Physics._instance;
    }
    Physics._instance = this;
    this.g_mult = 0.03;
  }
  get g_result() {
    return this.g_mult * this._g;
  }
  get energy() {
    return this._energy;
  }
}

class Dot {
  constructor(pos) {
    this.pos = pos;
    let canvas = new Canvas();
    this.dsize = canvas.dsize;
  }
}

class Node extends Dot {
  constructor(pos, vel, acc, dsize) {
    super(pos, dsize);
    this.vel = vel;
    this.acc = acc;
    let physics = new Physics();
    this.energy = physics.energy;
  }
  show() {
    let canvas = new Canvas();
    let mspos = canvas.mspos;
    let vec = p5.Vector.sub(mspos, this.pos);
    let dist = vec.mag();
    if (dist > this.dsize / 2) {
      fill(220, 160, 0);
      ellipse(this.pos.x, this.pos.y, this.dsize, this.dsize);
    } else {
      fill(0, 200, 0);
      ellipse(this.pos.x, this.pos.y, this.dsize + 2.5, this.dsize + 2.5);
    }
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (this.pos.y > ceil(height - this.dsize / 2)) {
      this.pos.y = ceil(height - this.dsize / 2);
    }
    if (this.pos.x > ceil(width - this.dsize / 2)) {
      this.pos.x = ceil(width - this.dsize / 2);
    } else if (this.pos.x < ceil(this.dsize / 2)) {
      this.pos.x = ceil(this.dsize / 2);
    }
  }
  walls() {
    if (this.pos.x >= width - this.dsize / 2 || this.pos.x <= this.dsize / 2) {
      this.vel.x *= -1 * this.energy;
    }
    if (this.pos.y >= height - this.dsize / 2 || this.pos.y <= this.dsize / 2) {
      this.vel.y *= -1 * this.energy;
    }
  }
}

class Pin extends Dot {
  constructor(pos, dsize) {
    super(pos, dsize);
  }
  show() {
    let canvas = new Canvas();
    let mspos = canvas.mspos;
    let vec = p5.Vector.sub(mspos, this.pos);
    let dist = vec.mag();
    if (dist > this.dsize / 2) {
      fill(220, 0, 0);
      ellipse(this.pos.x, this.pos.y, this.dsize, this.dsize);
    } else {
      fill(0, 200, 0);
      ellipse(this.pos.x, this.pos.y, this.dsize + 2.5, this.dsize + 2.5);
    }
  }
}
