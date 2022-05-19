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
    this.ends = [];
    this.bonds = [];
    this.dsize = 10;
    let physics = new Physics();
    this.g_result = physics.g_result;
  }
  setup() {
    let canvas = createCanvas(width, height);
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
      case 1:
        if (canvas.ends.length == 1) {
          let input = new Input();
          strokeWeight(1);
          stroke(200, 200, 200);
          line(
            canvas.dots[canvas.ends[0]].pos.x,
            canvas.dots[canvas.ends[0]].pos.y,
            input.mspos.x,
            input.mspos.y
          );
        }
        actions.new_bond();
        break;
      case 2:
      case 3:
        actions.new_dot();
        break;
    }
    for (let b of this.bonds) {
      b.show();
      b.move();
    }
    noStroke();
    let pause = this.pause;
    for (let dot of this.dots) {
      dot.show();
      if (dot instanceof Node && !pause) {
        dot.collide();
        dot.move();
        dot.walls();
      }
    }
    let x = actions.select;
    if (x != -1) {
      this.dots[x].show();
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
        canvas.ends = [];
        document.getElementById("bond").style.background = "white";
        break;
      case 2:
        document.getElementById("pin").style.background = "white";
        break;
      case 3:
        document.getElementById("node").style.background = "white";
    }
  }
  get pause() {
    if (pause_chbox.checked) {
      return true;
    } else {
      return false;
    }
  }
}

class Physics {
  _g = 9.8066;
  _energy = 0.7;
  _stiffness = 0.009;
  _mass = 1;
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
    if (grid_chbox.checked) {
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
  get select() {
    let input = new Input();
    let mspos = input.mspos;
    let x = -1;
    for (let i = 0; i < canvas.dots.length; i++) {
      let vec = p5.Vector.sub(mspos, canvas.dots[i].pos);
      let dist = vec.mag();
      if (dist < canvas.dsize) {
        x = i;
        break;
      }
    }
    return x;
  }
  drag() {
    let input = new Input();
    let x = this.select;
    if (mouseButton == LEFT && mouseIsPressed == true && x != -1) {
      let mspos = input.mspos;
      canvas.dots[x].pos = mspos;
      canvas.dots[x].vel = createVector(0, 0);
    }
  }
  new_dot() {
    let x = this.select;
    let input = new Input();
    let mspos_gr = input.mspos_gr;
    if (
      x == -1 &&
      mouseButton == LEFT &&
      mouseIsPressed == true &&
      !(mspos_gr.x <= 182 && mspos_gr.y <= 260)
    ) {
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
  new_bond() {
    let x = this.select;
    if (
      x != -1 &&
      x != canvas.ends[0] &&
      mouseButton == LEFT &&
      mouseIsPressed == true
    ) {
      canvas.ends.push(x);
      if (canvas.ends.length > 1) {
        let p1 = canvas.dots[canvas.ends[0]];
        let p2 = canvas.dots[canvas.ends[1]];
        let vec = p5.Vector.sub(p1.pos, p2.pos);
        canvas.bonds.push(new Bond(p1, p2, vec.mag()));
        canvas.ends = [];
        canvas.mode(-1);
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
    this.energy = physics._energy;
    canvas = new Canvas();
  }
  show() {
    noStroke();
    let actions = new Actions();
    let x = actions.select;
    if (canvas.dots[x] === this) {
      fill(0, 200, 0);
      circle(this.pos.x, this.pos.y, this.dsize + 2.5);
    } else {
      fill(220, 160, 0);
      circle(this.pos.x, this.pos.y, this.dsize);
    }
  }
  intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false;
    }
    let denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denominator == 0) {
      return false;
    }
    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return false;
    }
    let x = x1 + ua * (x2 - x1);
    let y = y1 + ua * (y2 - y1);
    return createVector(x, y);
  }
  move() {
    this.vel.add(this.acc);
    let dir;
    let dist;
    let way;
    let p1 = this.pos;
    let p2;
    let p3 = createVector(p1.x + this.vel.x, p1.y + this.vel.y);
    let rat;
    let x1;
    let x2;
    let c;
    let cc = false;
    let minc = 99999;
    for (let i = 0; i < canvas.dots.length; i++) {
      if (this !== canvas.dots[i]) {
        p2 = canvas.dots[i].pos;
        dir = p5.Vector.sub(p2, p1);
        dist = dir.mag();
        way = this.vel.mag();
        if (way > dist - this.dsize / 2) {
          rat = this.dsize / dist;
          x1 = dir.copy().mult(rat);
          x1 = createVector(-1 * x1.y, x1.x);
          x2 = createVector(-1 * x1.x, -1 * x1.y);
          x1.add(p2);
          x2.add(p2);
          c = this.intersect(p1.x, p1.y, p3.x, p3.y, x1.x, x1.y, x2.x, x2.y);
          if (c) {
            if (c.mag() < minc) {
              minc = c.mag();
              cc = c;
            }
          }
          if (cc) {
            rat = this.dsize / 2 / cc.mag();
            cc.mult(1 - rat);
            this.pos.add(cc);
            return;
          }
        }
      }
    }
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
    for (let i = 0; i < canvas.dots.length; i++) {
      dir = p5.Vector.sub(canvas.dots[i].pos, this.pos);
      dist = dir.mag();
      if (dist <= this.dsize) {
        dir.normalize();
        let correction = this.dsize - dist;
        v1 = p5.Vector.dot(dir, this.vel);
        v2 = p5.Vector.dot(dir, canvas.dots[i].vel);
        dir.mult(v1 - v2);
        dir.mult(this.energy);
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
    let actions = new Actions();
    let x = actions.select;
    if (canvas.dots[x] === this) {
      fill(0, 200, 0);
      circle(this.pos.x, this.pos.y, this.dsize + 2.5);
    } else {
      fill(220, 0, 0);
      circle(this.pos.x, this.pos.y, this.dsize);
    }
  }
}

class Bond {
  constructor(n1, n2, len) {
    this.n1 = n1;
    this.n2 = n2;
    this.len = len;
    let canvas = new Canvas();
    this.dsize = canvas.dsize;
  }
  show() {
    strokeWeight(this.dsize * 0.5);
    stroke(220, 160, 0);
    line(this.n1.pos.x, this.n1.pos.y, this.n2.pos.x, this.n2.pos.y);
  }
  move() {
    let physics = new Physics();
    let m = physics._mass;
    let k = physics._stiffness;
    let e = physics._energy;
    let vec = p5.Vector.sub(this.n1.pos, this.n2.pos);
    let dist = vec.mag();
    let x = Math.abs(dist - this.len);
    let a = (-k * x * e) / m;
    let ap = a / dist;
    vec.mult(ap);
    if (dist > this.len) {
      if (this.n1 instanceof Node) {
        this.n1.vel.add(vec);
      }
      if (this.n2 instanceof Node) {
        vec.mult(-1);
        this.n2.vel.add(vec);
      }
    } else if (dist < this.len) {
      if (this.n2 instanceof Node) {
        this.n2.vel.add(vec);
      }
      if (this.n1 instanceof Node) {
        vec.mult(-1);
        this.n1.vel.add(vec);
      }
    }
  }
}
