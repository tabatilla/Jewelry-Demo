var renderManager = (function() {
  var _pixelSize, _tray_width, _tray_height, _celdas;
  var _scene, _camera, _renderer, _controls, _light, _container;

  function crearMarco(x, y, w, h, anchoBorde, profundidad) {
    var materialBorde = new THREE.MeshLambertMaterial({
      color: 0x660e21,
      side: THREE.DoubleSide
    });

    var BordesVerticalesGeometry = new THREE.BoxGeometry(
      anchoBorde * _pixelSize,
      _pixelSize * h,
      profundidad
    );
    var BordesHorizontalesGeometry = new THREE.BoxGeometry(
      _pixelSize * w,
      anchoBorde * _pixelSize,
      profundidad
    );

    var bordeIzq = new THREE.Mesh(BordesVerticalesGeometry, materialBorde);
    var bordeDer = new THREE.Mesh(BordesVerticalesGeometry, materialBorde);
    var bordeSup = new THREE.Mesh(BordesHorizontalesGeometry, materialBorde);
    var bordeInf = new THREE.Mesh(BordesHorizontalesGeometry, materialBorde);

    bordeIzq.position.set(
      (x - w / 2 + anchoBorde / 2) * _pixelSize,
      y * _pixelSize,
      0
    );
    bordeDer.position.set(
      (x + w / 2 - anchoBorde / 2) * _pixelSize,
      y * _pixelSize,
      0
    );
    bordeSup.position.set(
      x * _pixelSize,
      (y + h / 2 - anchoBorde / 2) * _pixelSize,
      0
    );
    bordeInf.position.set(
      x * _pixelSize,
      (y - h / 2 + anchoBorde / 2) * _pixelSize,
      0
    );

    _scene.add(bordeIzq);
    _scene.add(bordeDer);
    _scene.add(bordeSup);
    _scene.add(bordeInf);

    return;
  }

  return {
    init: function(pixelSize, tray_width, tray_height, celdas) {
      _pixelSize = pixelSize;
      _tray_width = tray_width;
      _tray_height = tray_height;
      _celdas = celdas;

      _container = document.getElementById("canvas-3d");
      _scene = new THREE.Scene();
      _camera = new THREE.PerspectiveCamera(
        45,
        _container.innerWidth / _container.innerHeight,
        1,
        5000
      );
      _camera.position.set(_tray_width / 2, _tray_height / 2, 700);

      //_camera.rotation.y = Math.PI / 2;

      _renderer = new THREE.WebGLRenderer({ antialias: true });
      _renderer.setClearColor("#FFFFFF");
      _renderer.setSize(_container.offsetWidth, _container.offsetHeight);

      renderManager.borrarElementos();
      _container.appendChild(_renderer.domElement);
      //document.body.appendChild(_renderer.domElement);

      window.addEventListener("resize", () => {
        _renderer.setSize(_container.offsetWidth, 600);
        _camera.aspect = _container.offsetWidth / 600;

        _camera.updateProjectionMatrix();
      });

      //_controls
      _controls = new THREE.OrbitControls(_camera);
      _controls.rotateSpeed = 1.0;
      _controls.zoomSpeed = 1.2;
      _controls.panSpeed = 0.8;
      _controls.target = new THREE.Vector3(
        (_tray_width / 2) * _pixelSize,
        (_tray_height / 2) * _pixelSize,
        0
      );

      //_scene
      _scene = new THREE.Scene();

      // Helpers
      // var helper = new THREE.GridHelper(1000, 10);
      // helper.setColors(0x0000ff, 0x808080);

      //Creación Joyero
      var materialFondo = new THREE.MeshLambertMaterial({
        color: 0x660e21,
        side: THREE.DoubleSide
      });

      //FONDO
      var fondoGeometry = new THREE.PlaneGeometry(
        _pixelSize * _tray_width,
        _pixelSize * _tray_height
      );

      var fondo = new THREE.Mesh(fondoGeometry, materialFondo);
      fondo.position.set(
        (_pixelSize * _tray_width) / 2,
        (_pixelSize * _tray_height) / 2,
        -11
      );
      _scene.add(fondo);

      crearMarco(
        _tray_width / 2,
        _tray_height / 2,
        _tray_width,
        _tray_height,
        0.5,
        20
      );

      for (let i = 0; i < _celdas.length; i++) {
        crearMarco(
          _celdas[i].x + _celdas[i].w / 2,
          _celdas[i].y + _celdas[i].h / 2,
          _celdas[i].w,
          _celdas[i].h,
          0.2,
          20
        );
      }

      _light = new THREE.SpotLight(0xffffff);
      _light.position.set(
        (_tray_width / 2) * _pixelSize,
        (_tray_height / 2) * _pixelSize,
        620
      );

      _light.target.position.set(
        (_tray_width / 2) * _pixelSize,
        (_tray_height / 2) * _pixelSize,
        0
      );

      _scene.add(_light);
      _scene.add(_light.target);

      // var render = () => {
      //   requestAnimationFrame(render);
      //   _renderer.render(_scene, _camera);
      //   _controls.update();
      // };

      renderManager.render();
    },

    render: function() {
      requestAnimationFrame(renderManager.render);
      _renderer.render(_scene, _camera);
      _controls.update();
    },

    borrarElementos: function() {
      while (_container.firstChild) {
        _container.removeChild(_container.firstChild);
      }
    },

    cambiarColor: function(color) {
      _scene.traverse(function(node) {
        if (node instanceof THREE.Mesh) {
          node.material.color.setHex(color);
        }
      });
    },

    cambiarTamanio: function() {
      _renderer.setSize(_container.offsetWidth, 600);
      _camera.aspect = _container.offsetWidth / 600;
      _camera.updateProjectionMatrix();
    },

    rotar: function() {
      _camera.rotation.x += 0.1;
    }
  };
})();
