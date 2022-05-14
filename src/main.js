// sizes
var grid = 30;
var dsize = 10;
// objects
var dots = [];
// position
var mspos;
var mspos_gr;
// settings
var state;
// constants
var g = 9.8066;
// multipliers
var g_mult = 0.03;
var energy = 0.9;

function setup() {
  var height = windowHeight;
  var width = windowWidth;
  var canvas = createCanvas(width, height);
  canvas.parent("canvas_block");
}

function draw() {
  background(220);
  strokeWeight(1);
  stroke(200, 200, 200);
  for (let i = 0; i <= int(width / grid); i++) {
    line(i * grid, 0, i * grid, height);
  }
  for (let i = 0; i <= int(height / grid); i++) {
    line(0, i * grid, width, i * grid);
  }
  noStroke();
  let msx = mouseX;
  let msy = mouseY;
  let grx;
  let gry;
  if (chbox.checked) {
    grx = round(msx / grid) * grid;
    gry = round(msy / grid) * grid;
  } else {
    grx = msx;
    gry = msy;
  }
  mspos = createVector(msx, msy);
  mspos_gr = createVector(grx, gry);
  switch (state) {
    case 2 || 3:
      new_dot();
  }
  for (let d in dots) {
    d.show;
  }
}

function new_dot() {
  if (mouseButton == LEFT && mouseIsPressed == true) {
    let dot_near = false;
    for (let i = 0; i < dots.length; i++) {
      let vec = p5.Vector.sub(mspos_gr, dots[i].pos);
      let dist = vec.mag();
      if (dist < dsize + 2.5) dot_near = true;
    }
    if (dot_near == false) {
      switch (state) {
        case 2:
          dots.push(new Pin(mspos_gr));
          break;
        case 3:
          dots.push(
            new Node(mspos_gr, createVector(0, 0), createVector(0, g * g_mult))
          );
          break;
      }
    }
  }
}

function mode(md) {
  document.getElementById("drag").style.background = "black";
  document.getElementById("bond").style.background = "black";
  document.getElementById("pin").style.background = "black";
  document.getElementById("node").style.background = "black";
  state = md;
  switch (state) {
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

class Dot {
  constructor(pos) {
    this.pos = pos;
  }
}

class Node extends Dot {
  constructor(pos, vel, acc) {
    super(pos);
    this.vel = vel;
    this.acc = acc;
  }
  show() {
    let vec = p5.Vector.sub(mspos, this.pos);
    let dist = vec.mag();
    if (dist > dsize / 2) {
      fill(220, 160, 0);
      ellipse(this.pos.x, this.pos.y, dsize, dsize);
    } else {
      fill(0, 200, 0);
      ellipse(this.pos.x, this.pos.y, dsize + 2.5, dsize + 2.5);
    }
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (this.pos.y > ceil(height - dsize / 2)) {
      this.pos.y = ceil(height - dsize / 2);
    }
    if (this.pos.x > ceil(width - dsize / 2)) {
      this.pos.x = ceil(width - dsize / 2);
    } else if (this.pos.x < ceil(dsize / 2)) {
      this.pos.x = ceil(dsize / 2);
    }
  }
  walls() {
    if (this.pos.x >= width - dsize / 2 || this.pos.x <= dsize / 2) {
      this.vel.x *= -1 * energy;
    }
    if (this.pos.y >= height - dsize / 2 || this.pos.y <= dsize / 2) {
      this.vel.y *= -1 * energy;
    }
  }
}

class Pin extends Dot {
  constructor(pos) {
    super(pos);
  }
  show() {
    let vec = p5.Vector.sub(mspos, this.pos);
    let dist = vec.mag();
    if (dist > dsize / 2) {
      fill(220, 0, 0);
      ellipse(this.pos.x, this.pos.y, dsize, dsize);
    } else {
      fill(0, 200, 0);
      ellipse(this.pos.x, this.pos.y, dsize + 2.5, dsize + 2.5);
    }
  }
}
