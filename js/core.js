var tour1 = new Tour({
  name: "tour1",
  backdrop: true,
  steps: [
    {
      element: "#tour-wizard",
      title: "Steps",
      content: "4 Steps to customize your tray as you want"
    },
    {
      element: "#form-1",
      title: "Choose Sizes",
      content:
        "First, you have to choose the Width, Height, and Depth or your tray"
    },
    {
      element: "#tour-btn-next-form1",
      title: "Next Step",
      content:
        "When you are done click here, later you can come back here to change any size"
    },
    {
      element: "#tour-btn-help",
      title: "Help",
      content: "If you need to see these hints again click here"
    }
  ]
});

var tour2 = new Tour({
  name: "tour2",
  backdrop: true,
  steps: [
    {
      element: "#tour-btn-tamanios",
      title: "Customize",
      content:
        "Here you can choose any size of space to put it on the tray, then you can move it as you want"
    },
    {
      element: "#tour-resumen",
      title: "Spaces to fill",
      content: "Here you will see how many spaces left to complete your tray"
    },
    {
      element: "#tour-btn-functions",
      title: "Functions",
      content:
        "If you want to copy any space click on the first button, the second will delete the space selected"
    },
    {
      element: "#canvas",
      title: "Tray",
      content:
        "This is your tray, select, move any space, remember spaces can't overlap each other"
    },
    {
      element: "#tour-prices",
      title: "Prices",
      content:
        "When you add any space, here you will see the price for each one and the total"
    },
    {
      element: "#tour-btn-next-form2",
      title: "Next Step",
      content: "When you are done click here, you can come back any time"
    }
  ]
});

var tour3 = new Tour({
  name: "tour3",
  backdrop: true,
  steps: [
    {
      element: "#tour-btn-colores",
      title: "Change color",
      content:
        "Once you finish your tray we will show you the 3d version, you can change colors with these buttons"
    },
    {
      element: "#canvas-3d",
      title: "3D versión of your tray",
      content: "You can move your tray with the mouse"
    },
    {
      element: "#tour-btn-next-form3",
      title: "Next Step",
      content: "Then the final step"
    }
  ]
});

tour1.init();
tour1.start();

function restartTour(tour) {
  if (tour === 1) tour1.restart();
  if (tour === 2) tour2.restart();
  if (tour === 3) tour3.restart();
}

/************/
const PIXEL_SIZE = 24;
const _closeSize = PIXEL_SIZE * 0.4;
const PRECIO_CELDA = 1;
const PRECIO_CELDA_RING = 2;

//Todas las celdas son cuadradas
//Tipo 1 = normal
//tipo 2 = ring
var Celda = (function() {
  function Celda(x, y, w, h, color, tipo) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.tipo = tipo || 1;
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
    _alto = 0, //depth
    _height = 0;

  /////////
  _ancho_f = "";
  _alto_f = "";
  _height_f = "";

  var tablero = [],
    espacios = [];
  var isDragging = false,
    indexActual = -1,
    celdaActual,
    isClosing,
    indexClose;

  var app4 = new Vue({
    el: "#app-4",
    data: {
      espacios: espacios
    },
    methods: {
      calcularPrecio: function(espacio) {
        if (espacio.tipo === 1) {
          return `$${espacio.w * espacio.h * espacio.count * PRECIO_CELDA}`;
        }
        return `$${espacio.w * espacio.h * espacio.count * PRECIO_CELDA_RING}`;
      },

      getName: function(espacio) {
        return (
          "" + espacio.w + "x" + espacio.h + (espacio.tipo === 2 ? " Ring" : "")
        );
      },

      calcularTotal: function() {
        let justPrice = 89.5;
        let res = 0;
        for (let i = 0; i < this.espacios.length; i++) {
          res +=
            this.espacios[i].w *
            this.espacios[i].h *
            (this.espacios[i].tipo === 1 ? PRECIO_CELDA : PRECIO_CELDA_RING);
        }

        res += justPrice;

        return `$${res}`;
      }
    },
    computed: {
      espaciosAgrupados: function() {
        var map = this.espacios.reduce(function(obj, b) {
          const key = "" + b.w + "x" + b.h + "-" + b.tipo;

          obj[key] = {
            count: obj[key] ? ++obj[key].count : 0 || 1,
            tipo: b.tipo,
            w: b.w,
            h: b.h
          };
          return obj;
        }, {});
        return map;
      }
    }
  });

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

  function agregarEspacio(x, y, w, h, tipo) {
    espacios.push(new Celda(x, y, w, h, getColor(), tipo));

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

      agregarEspacio(0, 0, parseInt(w), parseInt(h), 1);
    },

    crearEspacioCustomRing: function() {
      var w = document.getElementById("anchoRing").value;
      var h = document.getElementById("altoRing").value;

      if (!w || !h) {
        Swal.fire({
          type: "error",
          title: "Oops...",
          text: "Enter Values",
          confirmButtonColor: "#a61e22"
        });
        return;
      }

      agregarEspacio(0, 0, parseInt(w), parseInt(h), 2);
    },

    saveTamanio: function(tipo, value) {
      if (tipo === "ancho") _ancho = parseInt(value);
      if (tipo === "ancho_f") _ancho_f = parseInt(value);
      if (tipo === "alto") _alto = parseInt(value);
      if (tipo === "alto_f") _alto_f = value;
      if (tipo === "height") _height = value;
      if (tipo === "height_f") _height_f = value;
    },

    crearCanvas: function() {
      crearGrilla();

      resizeCanvas(_ancho * PIXEL_SIZE + 1, _alto * PIXEL_SIZE + 1);
    },

    crearCanvasTest: function() {
      _ancho = 17;
      _ancho_f = "123";
      _alto = 15;
      _alto_f = "123";
      _height = 3;
      _height_f = "123";

      crearGrilla();
      resizeCanvas(_ancho * PIXEL_SIZE + 1, _alto * PIXEL_SIZE + 1);
    },

    resize: function() {
      const variacion = 1;

      for (let i = 0; i < espacios.length; i++) {
        let celda = espacios[i];
        if (celda.x + celda.w + variacion === _ancho) {
          celda.w += variacion;
        }
        if (celda.y + celda.h + variacion === _alto) {
          celda.h += variacion;
        }
      }
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
      agregarEspacio(0, 0, w, h, 1);
    },

    agregarEspacioRing(w, h) {
      agregarEspacio(0, 0, w, h, 2);
    },

    rotarEspacio() {
      let tempW = celdaActual.w;
      celdaActual.w = celdaActual.h;
      celdaActual.h = tempW;
    },

    duplicar() {
      if (celdaActual) {
        agregarEspacio(0, 0, celdaActual.w, celdaActual.h, celdaActual.tipo);
      }
    },

    renderizar3d() {
      var espRestante = calcularEspacioRestante();

      if (espRestante > 0) {
        Swal.fire({
          type: "error",
          title: "Oops...",
          text: "There are still some spaces to fill",
          confirmButtonColor: "#a61e22"
        });
        return false;
      }

      if (espRestante < 0 || !verificarOverlaping()) {
        Swal.fire({
          type: "error",
          title: "Oops...",
          text: "There are some rectangles overlapping each other",
          confirmButtonColor: "#a61e22"
        });
        return false;
      }

      renderManager.init(PIXEL_SIZE, _ancho, _alto, espacios);
      setInterval(function() {
        renderManager.cambiarTamanio();
      }, 1);

      return true;
    },

    comprobarValores() {
      return _ancho && _alto && _height && _ancho_f && _alto_f && _height_f;
    },

    finalizar() {
      return true;
    }
  };
})(imprimirMensajeEspaciosVacios);

/************/
function imprimirMensajeEspaciosVacios(numero) {
  if (numero > 0) {
    document.getElementById("resumen").textContent = numero;
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

      if (tabActual === 1) {
        if (!canvasManager.comprobarValores()) {
          Swal.fire(
            "Incomplete Data",
            "There are some data you need to fill",
            "warning"
          );
          return;
        }
      }

      $("#form-" + tabActual).addClass("hidden");
      $("#item-" + tabActual).removeClass("activo");

      tabActual++;
      $("#form-" + tabActual).removeClass("hidden");
      $("#item-" + tabActual).addClass("activo");

      if (tabActual === 2) {
        tour2.init();
        tour2.start();
      }

      if (tabActual === 3) {
        tour3.init();
        tour3.start();
      }
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
    if ($(e.currentTarget).data("tipo") === "renderizar3d") {
      if (canvasManager.renderizar3d()) {
        tabManager.siguienteTab();
      }

      return;
    }

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

$("#myModal").on("show.bs.modal", function(e) {
  document.getElementById("ancho").value = 3;
  document.getElementById("alto").value = 2;
});

$("#myModalRing").on("show.bs.modal", function(e) {
  document.getElementById("anchoRing").value = 8;
  document.getElementById("altoRing").value = 2;
});
