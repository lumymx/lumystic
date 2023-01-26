function setup() {
  let canvas = new Canvas();
  canvas.setup();
}

function draw() {
  let canvas = new Canvas();
  canvas.draw();
}

class Canvas {
  GRID_SIZE = 30;
  DOT_SIZE = 10;
  height = windowHeight;
  width = windowWidth;
  dots = [];
  ends = [];
  bonds = [];
  constructor() {
    if (Canvas._instance) {
      return Canvas._instance;
    }
    Canvas._instance = this;
    let physics = new Physics();
    this.g = physics.g;
  }
  setup() {
    let canvas = createCanvas(this.width, this.height);
    canvas.parent("canvas_block");
  }
  draw() {
    background(220);
    strokeWeight(1);
    stroke(200, 200, 200);
    for (let i = 0; i <= int(width / this.GRID_SIZE); i++) {
      line(i * this.GRID_SIZE, 0, i * this.GRID_SIZE, height);
    }
    for (let i = 0; i <= int(height / this.GRID_SIZE); i++) {
      line(0, i * this.GRID_SIZE, width, i * this.GRID_SIZE);
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
            input.mousePosition.x,
            input.mousePosition.y
          );
        }
        actions.newBond();
        break;
      case 2:
      case 3:
        actions.newDot();
        break;
    }
    for (let b of this.bonds) {
      b.display();
      b.move();
    }
    noStroke();
    for (let dot of this.dots) {
      dot.display();
      if (dot instanceof Node && !this.pause) {
        dot.collide();
        dot.move();
        dot.walls();
      }
    }
    let x = actions.select;
    if (x != -1) {
      this.dots[x].display();
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
    if (pauseCheckbox.checked) {
      return true;
    } else {
      return false;
    }
  }
}

class Physics {
  _G = 9.8066;
  _G_MULTIPLIER = 0.045;
  ENERGY = 0.7;
  BOND_STIFFNESS = 0.03;
  NODE_MASS = 1;
  constructor() {
    if (Physics._instance) {
      return Physics._instance;
    }
    Physics._instance = this;
  }
  get g() {
    return this._G_MULTIPLIER * this._G;
  }
}

class Input {
  constructor() {
    if (Input._instance) {
      return Input._instance;
    }
    Input._instance = this;
  }
  get mousePosition() {
    return createVector(mouseX, mouseY);
  }
  get positionOnGrid() {
    let canvas = new Canvas();
    let gridSize = canvas.GRID_SIZE;
    return createVector(
      round(mouseX / gridSize) * gridSize,
      round(mouseY / gridSize) * gridSize
    );
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
    let mousePosition = input.mousePosition;
    let x = -1;
    for (let i = 0; i < canvas.dots.length; i++) {
      let vec = p5.Vector.sub(mousePosition, canvas.dots[i].pos);
      let dist = vec.mag();
      if (dist < canvas.DOT_SIZE) {
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
      let mousePosition = input.mousePosition;
      canvas.dots[x].pos = mousePosition;
      canvas.dots[x].vel = createVector(0, 0);
    }
  }
  newDot() {
    let input = new Input();
    let dotPosition;
    if (gridCheckbox.checked) {
      dotPosition = input.positionOnGrid;
    } else {
      dotPosition = input.mousePosition;
    }
    let isDotNear = false;
    for (let i = 0; i < canvas.dots.length; i++) {
      if (
        p5.Vector.sub(dotPosition, canvas.dots[i].pos).mag() < canvas.DOT_SIZE
      ) {
        isDotNear = true;
        break;
      }
    }
    if (
      !isDotNear &&
      mouseButton == LEFT &&
      mouseIsPressed == true &&
      !(dotPosition.x <= 182 && dotPosition.y <= 260)
    ) {
      switch (canvas.state) {
        case 2:
          canvas.dots.push(new Pin(dotPosition));
          break;
        case 3:
          canvas.dots.push(
            new Node(dotPosition, createVector(0, 0), createVector(0, canvas.g))
          );
          break;
      }
    }
  }
  newBond() {
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
    this.dotSize = canvas.DOT_SIZE;
  }
}

class Node extends Dot {
  constructor(pos, vel, acc, dotSize) {
    super(pos, dotSize);
    this.vel = vel;
    this.acc = acc;
    let physics = new Physics();
    this.energy = physics.ENERGY;
    canvas = new Canvas();
  }
  display() {
    noStroke();
    let actions = new Actions();
    let x = actions.select;
    if (canvas.dots[x] === this) {
      fill(0, 200, 0);
      circle(this.pos.x, this.pos.y, this.dotSize + 2.5);
    } else {
      fill(220, 160, 0);
      circle(this.pos.x, this.pos.y, this.dotSize);
    }
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (this.pos.y > ceil(height - this.dotSize / 2)) {
      this.pos.y = ceil(height - this.dotSize / 2);
    } else if (this.pos.y < ceil(this.dotSize / 2)) {
      this.pos.y = ceil(this.dotSize / 2);
    }
    if (this.pos.x > ceil(width - this.dotSize / 2)) {
      this.pos.x = ceil(width - this.dotSize / 2);
    } else if (this.pos.x < ceil(this.dotSize / 2)) {
      this.pos.x = ceil(this.dotSize / 2);
    }
  }
  walls() {
    if (
      this.pos.x >= width - this.dotSize / 2 ||
      this.pos.x <= this.dotSize / 2
    ) {
      this.vel.x *= -1 * this.energy;
    }
    if (
      this.pos.y >= height - this.dotSize / 2 ||
      this.pos.y <= this.dotSize / 2
    ) {
      this.vel.y *= -1 * this.energy;
    }
  }
  collide() {
    let dir;
    let distance;
    let v1;
    let v2;
    for (let i = 0; i < canvas.dots.length; i++) {
      dir = p5.Vector.sub(canvas.dots[i].pos, this.pos);
      distance = dir.mag();
      if (distance <= this.dotSize) {
        dir.normalize();
        let correction = this.dotSize - distance;
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
  constructor(pos, dotSize) {
    super(pos, dotSize);
  }
  display() {
    let actions = new Actions();
    let x = actions.select;
    if (canvas.dots[x] === this) {
      fill(0, 200, 0);
      circle(this.pos.x, this.pos.y, this.dotSize + 2.5);
    } else {
      fill(220, 0, 0);
      circle(this.pos.x, this.pos.y, this.dotSize);
    }
  }
}

class Bond {
  constructor(n1, n2, length) {
    this.n1 = n1;
    this.n2 = n2;
    this.length = length;
    let canvas = new Canvas();
    this.dotSize = canvas.dotSize;
  }
  display() {
    strokeWeight(this.dotSize * 0.5);
    stroke(220, 160, 0);
    line(this.n1.pos.x, this.n1.pos.y, this.n2.pos.x, this.n2.pos.y);
  }
  move() {
    let physics = new Physics();
    let m = physics.NODE_MASS;
    let k = physics.BOND_STIFFNESS;
    let e = physics.ENERGY;
    let vec = p5.Vector.sub(this.n1.pos, this.n2.pos);
    let distance = vec.mag();
    let x = Math.abs(distance - this.length);
    let a = (-k * x) / m;
    let ap = a / distance;
    vec.mult(ap * e);
    if (distance > this.length) {
      if (this.n1 instanceof Node) {
        this.n1.vel.add(vec);
      }
      if (this.n2 instanceof Node) {
        vec.mult(-1);
        this.n2.vel.add(vec);
      }
    } else if (distance < this.length) {
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
