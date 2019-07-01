/************/
const PIXEL_SIZE = 24;
const _closeSize = PIXEL_SIZE * 0.4;

//Todas las celdas son cuadradas
var Celda = (function() {
  function Celda(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.selected = false;
  }

  Celda.prototype.click = function(hitpos) {
    if (
      hitpos.x > this.x * PIXEL_SIZE &&
      hitpos.x < this.x * PIXEL_SIZE + this.w * PIXEL_SIZE &&
      hitpos.y > this.y * PIXEL_SIZE &&
      hitpos.y < this.y * PIXEL_SIZE + this.h * PIXEL_SIZE
    ) {
      return true;
    }
    return false;
  };

  Celda.prototype.clickCloser = function(hitpos) {
    if (
      hitpos.x > this.x * PIXEL_SIZE + this.w * PIXEL_SIZE - _closeSize &&
      hitpos.x < this.x * PIXEL_SIZE + this.w * PIXEL_SIZE &&
      hitpos.y > this.y * PIXEL_SIZE &&
      hitpos.y < this.y * PIXEL_SIZE + _closeSize
    ) {
      return true;
    }
    return false;
  };

  Celda.prototype.overlap = function(celda) {
    var r1 = {
      bl: {
        x: this.x * PIXEL_SIZE,
        y: this.y * PIXEL_SIZE + this.h * PIXEL_SIZE
      },
      tr: {
        x: this.x * PIXEL_SIZE + this.w * PIXEL_SIZE,
        y: this.y * PIXEL_SIZE
      }
    };

    var r2 = {
      bl: {
        x: celda.x * PIXEL_SIZE,
        y: celda.y * PIXEL_SIZE + celda.h * PIXEL_SIZE
      },
      tr: {
        x: celda.x * PIXEL_SIZE + celda.w * PIXEL_SIZE,
        y: celda.y * PIXEL_SIZE
      }
    };

    if (r1.bl.y <= r2.tr.y || r2.bl.y <= r1.tr.y) return false;
    if (r1.tr.x <= r2.bl.x || r2.tr.x <= r1.bl.x) return false;

    return true;
  };

  return Celda;
})();

var canvasManager = (function(_callbackImpresion) {
  let _ancho = 0,
    _alto = 0;
  var tablero = [],
    espacios = [];
  var isDragging = false,
    indexActual = -1,
    celdaActual,
    isClosing,
    indexClose;

  function crearGrilla() {
    for (let i = 0; i < _ancho; i++) {
      for (let j = 0; j < _alto; j++) {
        tablero.push(
          new Celda(
            i * PIXEL_SIZE,
            j * PIXEL_SIZE,
            PIXEL_SIZE,
            PIXEL_SIZE,
            "#ffffff"
          )
        );
      }
    }
  }

  function putOnTop(index) {
    espacios.splice(index, 1);
    espacios.push(celdaActual);
  }

  function clearEspacio(index) {
    if (index != null) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#a61e22",
        confirmButtonText: "Yes, delete it!"
      }).then(result => {
        if (result.value) {
          espacios.splice(index, 1);

          //calcular espacios restantes
          _callbackImpresion(calcularEspacioRestante());
        }
      });
    }

    isClosing = false;
  }

  function getColor() {
    var colors = [
      [354, 67, 85],
      [240, 246, 159],
      [111, 47, 76],
      [182, 44, 89],
      [145, 57, 88],
      [346, 97, 86],
      [102, 92, 132],
      [158, 100, 14]
    ];
    var rdmColor = colors[Math.floor(Math.random() * colors.length)];

    return color(rdmColor[0], rdmColor[1], rdmColor[2], 99.99);
  }

  function calcularEspacioRestante() {
    let res = 0;
    for (let i = 0; i < espacios.length; i++) {
      res += espacios[i].w * espacios[i].h;
    }

    return _ancho * _alto - res;
  }

  function agregarEspacio(x, y, w, h) {
    espacios.push(new Celda(x, y, w, h, getColor()));

    //calcular espacios restantes
    _callbackImpresion(calcularEspacioRestante());
  }

  function verificarOverlaping() {
    for (let i = 0; i < espacios.length; i++) {
      for (let j = 0; j < espacios.length; j++) {
        if (i == j) continue;
        if (espacios[i].overlap(espacios[j])) {
          return false;
        }
      }
    }
    return true;
  }

  return {
    crearEspacioCustom: function() {
      var w = document.getElementById("ancho").value;
      var h = document.getElementById("alto").value;

      if (!w || !h) {
        Swal.fire({
          type: "error",
          title: "Oops...",
          text: "Enter Values",
          confirmButtonColor: "#a61e22"
        });
        return;
      }

      agregarEspacio(0, 0, parseInt(w), parseInt(h));
    },

    crearCanvas: function(w, h) {
      _ancho = w;
      _alto = h;
      crearGrilla();

      resizeCanvas(_ancho * PIXEL_SIZE + 1, _alto * PIXEL_SIZE + 1);
    },

    getTablero: function() {
      return tablero;
    },

    getEspacios: function() {
      return espacios;
    },

    clickEspacio: function() {
      var m = createVector(mouseX, mouseY);
      indexActual = -1;

      espacios.forEach(function(r, i) {
        if (r.click(m)) {
          if (r.clickCloser(m)) {
            isClosing = true;
            indexClose = i;
          }

          clickOffset = p5.Vector.sub(
            createVector(r.x * PIXEL_SIZE, r.y * PIXEL_SIZE),
            m
          );
          isDragging = true;
          celdaActual = r;
          indexActual = i;
        }
        espacios[i].selected = indexActual == i;
      });

      if (isClosing && indexActual == indexClose) {
        isDragging = false;
        clearEspacio(indexActual);
        return;
      }

      if (isDragging) {
        putOnTop(indexActual);
      }
    },

    dragEspacio: function() {
      var m = createVector(mouseX, mouseY);

      if (isDragging) {
        var vec = createVector(
          celdaActual.x * PIXEL_SIZE,
          celdaActual.y * PIXEL_SIZE
        );
        vec.set(m).add(clickOffset);

        let newx = parseInt(vec.x / PIXEL_SIZE);
        let newy = parseInt(vec.y / PIXEL_SIZE);

        //Para que los espacios no se salgan del canvas
        if (newx < 0) newx = 0;
        if (newx + celdaActual.w > _ancho) newx = _ancho - celdaActual.w;
        if (newy < 0) newy = 0;
        if (newy + celdaActual.h > _alto) newy = _alto - celdaActual.h;

        celdaActual.x = newx;
        celdaActual.y = newy;
      }
    },

    dragEnd: function() {
      isDragging = false;
    },

    agregarEspacio(w, h) {
      agregarEspacio(0, 0, w, h);
    },

    rotarEspacio() {
      let tempW = celdaActual.w;
      celdaActual.w = celdaActual.h;
      celdaActual.h = tempW;
    },

    duplicar() {
      if (celdaActual) {
        agregarEspacio(0, 0, celdaActual.w, celdaActual.h);
      }
    },

    renderizar3d() {
      renderManager.init(PIXEL_SIZE, _ancho, _alto, espacios);
      setInterval(function() {
        renderManager.cambiarTamanio();
      }, 1);
    },

    finalizar() {
      var espRestante = calcularEspacioRestante();

      // if (espRestante > 0) {
      //   Swal.fire({
      //     type: "error",
      //     title: "Oops...",
      //     text: "There are still some spaces to fill",
      //     confirmButtonColor: "#a61e22"
      //   });
      //   return false;
      // }

      // if (espRestante < 0 || !verificarOverlaping()) {
      //   Swal.fire({
      //     type: "error",
      //     title: "Oops...",
      //     text: "There are some rectangles overlapping each other",
      //     confirmButtonColor: "#a61e22"
      //   });
      //   return false;
      // }

      return true;
    }
  };
})(imprimirMensajeEspaciosVacios);

/************/
function imprimirMensajeEspaciosVacios(numero) {
  if (numero > 0) {
    document.getElementById("resumen").textContent =
      "There are still " + numero + " spaces to fill";
    return;
  }
  if (numero < 0) {
    document.getElementById("resumen").textContent =
      "Too much spaces in the tray";
  }
  if (numero == 0) {
    document.getElementById("resumen").textContent = "Completed";
  }
}
/************/

function setup() {
  var myCanvas = createCanvas();
  myCanvas.parent("canvas");
}

function draw() {
  drawGrilla();
  drawEspacios();
}

function mousePressed() {
  canvasManager.clickEspacio();
}

function mouseDragged() {
  canvasManager.dragEspacio();
}

function mouseReleased() {
  canvasManager.dragEnd();
}

function drawGrilla() {
  var tab = canvasManager.getTablero();
  for (let i = 0; i < tab.length; i++) {
    strokeWeight(1);
    stroke("#c8c8c8");
    let c = color(tab[i].color);
    fill(c);
    rect(tab[i].x, tab[i].y, tab[i].w, tab[i].h);
  }
}
function drawEspacios() {
  var esp = canvasManager.getEspacios();
  for (let i = 0; i < esp.length; i++) {
    strokeWeight(2);

    if (esp[i].selected) stroke("#ff0000");
    else stroke("#000000");

    fill(esp[i].color);

    rect(
      esp[i].x * PIXEL_SIZE,
      esp[i].y * PIXEL_SIZE,
      esp[i].w * PIXEL_SIZE,
      esp[i].h * PIXEL_SIZE
    );

    //Dibujar una cruz
    //Se le suma y resta 2 para que no esté sobre el margen del rectángulo
    strokeWeight(3.5);
    stroke(166, 30, 34);
    line(
      esp[i].x * PIXEL_SIZE + esp[i].w * PIXEL_SIZE - _closeSize,
      esp[i].y * PIXEL_SIZE + 2,
      esp[i].x * PIXEL_SIZE + esp[i].w * PIXEL_SIZE - 2,
      esp[i].y * PIXEL_SIZE + _closeSize
    );

    line(
      esp[i].x * PIXEL_SIZE + esp[i].w * PIXEL_SIZE - _closeSize,
      esp[i].y * PIXEL_SIZE + _closeSize,
      esp[i].x * PIXEL_SIZE + esp[i].w * PIXEL_SIZE - 2,
      esp[i].y * PIXEL_SIZE + 2
    );
  }
}

var tabManager = (function() {
  var numFormularios = 4;
  var tabActual = 1;
  return {
    siguienteTab() {
      if (tabActual + 1 > numFormularios) return;

      $("#form-" + tabActual).addClass("hidden");
      $("#item-" + tabActual).removeClass("activo");

      tabActual++;
      $("#form-" + tabActual).removeClass("hidden");
      $("#item-" + tabActual).addClass("activo");
    },

    anteriorTab() {
      if (tabActual - 1 <= 0) return;

      $("#item-" + tabActual).removeClass("activo");
      $("#form-" + tabActual).addClass("hidden");

      tabActual--;
      $("#item-" + tabActual).addClass("activo");
      $("#form-" + tabActual).removeClass("hidden");
    }
  };
})();

$(document).ready(function() {
  $(".btn-siguiente").click(function(e) {
    if ($(e.currentTarget).data("tipo") === "finalizar") {
      if (canvasManager.finalizar()) {
        tabManager.siguienteTab();
      }

      return;
    }

    tabManager.siguienteTab();
  });

  $(".btn-atras").click(function(e) {
    tabManager.anteriorTab();
  });
});
