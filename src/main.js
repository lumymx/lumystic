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
    let actions = new Actions();
    switch (this.state) {
      case 0:
        actions.drag();
        break;
      case 2:
      case 3:
        actions.new_dot();
        break;
    }
    for (let dot of this.dots) {
      dot.show();
      if (dot instanceof Node) {
        dot.move();
        dot.walls();
        dot.collide();
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
}

class Physics {
  _g = 9.8066;
  _energy = 0.7;
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

class Input {
  constructor() {
    if (Input._instance) {
      return Input._instance;
    }
    Input._instance = this;
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
}

class Actions {
  constructor() {
    if (Actions._instance) {
      return Actions._instance;
    }
    Actions._instance = this;
    canvas = new Canvas();
  }
  drag() {
    let input = new Input();
    let mspos_gr = input.mspos_gr;
    let x = -1;
    for (let i = 0; i < canvas.dots.length; i++) {
      let vec = p5.Vector.sub(mspos_gr, canvas.dots[i].pos);
      let dist = vec.mag();
      if (dist < canvas.dsize) {
        x = i;
        break;
      }
    }
    if (mouseButton == LEFT && mouseIsPressed == true && x != -1) {
      let mspos = input.mspos;
      canvas.dots[x].pos = mspos;
      canvas.dots[x].vel = createVector(0, 0);
    }
  }
  new_dot() {
    let input = new Input();
    if (mouseButton == LEFT && mouseIsPressed == true) {
      let dot_near = false;
      let mspos_gr = input.mspos_gr;
      for (let i = 0; i < canvas.dots.length; i++) {
        let vec = p5.Vector.sub(mspos_gr, canvas.dots[i].pos);
        let dist = vec.mag();
        if (dist < canvas.dsize) {
          dot_near = true;
          break;
        }
      }
      if (dot_near == false) {
        switch (canvas.state) {
          case 2:
            canvas.dots.push(new Pin(mspos_gr));
            break;
          case 3:
            canvas.dots.push(
              new Node(
                mspos_gr,
                createVector(0, 0),
                createVector(0, canvas.g_result)
              )
            );
            break;
        }
      }
    }
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
    noStroke();
    let input = new Input();
    let mspos = input.mspos;
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
    } else if (this.pos.y < ceil(this.dsize / 2)) {
      this.pos.y = ceil(this.dsize / 2);
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
  collide() {
    let dir;
    let dist;
    let v1;
    let v2;
    let canvas = new Canvas();
    for (let i = 0; i < canvas.dots.length; i++) {
      dir = p5.Vector.sub(canvas.dots[i].pos, this.pos);
      dist = dir.mag();
      if (dist <= this.dsize) {
        dir.normalize();
        let correction = this.dsize - dist;
        v1 = p5.Vector.dot(dir, this.vel);
        v2 = p5.Vector.dot(dir, canvas.dots[i].vel);
        dir.mult(v1 - v2, this.energy);
        this.pos.sub(p5.Vector.mult(dir, correction / 2));
        this.vel.sub(dir);
        if (canvas.dots[i] instanceof Node) {
          canvas.dots[i].pos.add(p5.Vector.mult(dir, correction / 2));
          canvas.dots[i].vel.add(dir);
        }
      }
    }
  }
}

class Pin extends Dot {
  constructor(pos, dsize) {
    super(pos, dsize);
  }
  show() {
    noStroke();
    let input = new Input();
    let mspos = input.mspos;
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
