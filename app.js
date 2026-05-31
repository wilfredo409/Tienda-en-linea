/**
 * OmniShop - Aplicación AngularJS
 * Desafío 2 - Tienda Online - Universidad Don Bosco
 * Módulo principal y Controlador
 */
var app = angular.module('tiendaApp', []);

app.controller('TiendaCtrl', ['$scope', '$http', '$filter',
  function ($scope, $http, $filter) {

    /* ── ESTADO INICIAL ── */
    $scope.productos        = [];   
    $scope.productosMostrados = []; 
    $scope.categorias       = [];   
    $scope.carrito          = [];   
    $scope.categoriaActiva  = '';   
    $scope.filtroBusqueda   = '';   
    $scope.busquedaGlobal   = '';   
    $scope.productoSeleccionado = null; 
    $scope.cantidadModal    = 1;    
    $scope.toastMsg         = '';   
    $scope.toastIcon        = 'bi-check-circle'; 

    var modalProductoEl = document.getElementById('modalProducto');
    var modalCarritoEl  = document.getElementById('modalCarrito');
    var bsModalProducto = modalProductoEl ? new bootstrap.Modal(modalProductoEl) : null;
    var bsModalCarrito  = modalCarritoEl ? new bootstrap.Modal(modalCarritoEl) : null;

    /**
     * FUNCIÓN: procesarDatos
     * Procesa la respuesta exitosa del JSON externo
     */
    var procesarDatos = function(data) {
      data.productos.forEach(function(p) {
        p.stars = new Array(Math.floor(p.rating || 0));
        p.emptyStars = new Array(5 - Math.floor(p.rating || 0));
      });
      
      $scope.productos = data.productos;
      $scope.categorias = data.categorias;
    };

    /**
     * PETICIÓN HTTP EXCLUSIVA AL ARCHIVO JSON EXTERNO
     * Se agrega un parámetro de tiempo para evitar que Chrome guarde caché.
     */
    $http.get('productos.json?v=' + Date.now()).then(function (res) {
      // Éxito: lee el archivo productos.json externo
      procesarDatos(res.data);
    }, function () {
      // Error: Si el navegador lo bloquea (CORS), muestra el error en pantalla
      console.error("Error: El navegador bloqueó la lectura del archivo JSON externo por políticas de CORS.");
      $scope.mostrarToast('Error de servidor: No se pudo cargar el archivo productos.json.', 'bi-exclamation-triangle');
    });

    /* ──────────────────────────────────────
       FILTROS
    ────────────────────────────────────── */
    $scope.$watchGroup(['productos', 'categoriaActiva', 'filtroBusqueda', 'busquedaGlobal'], function() {
      if (!$scope.productos) return;
      var res = $scope.productos;

      if ($scope.categoriaActiva) {
        res = $filter('filter')(res, {categoria: $scope.categoriaActiva}, true);
      }
      if ($scope.filtroBusqueda) {
        res = $filter('filter')(res, {nombre: $scope.filtroBusqueda});
      }
      if ($scope.busquedaGlobal) {
        res = $filter('filter')(res, $scope.busquedaGlobal);
      }
      $scope.productosMostrados = res;
    });

    $scope.setCategoriaTab = function (cat) {
      $scope.categoriaActiva = cat;
      $scope.filtroBusqueda  = '';
      var div = document.getElementById('productos');
      if (div) div.scrollIntoView({ behavior: 'smooth' });
    };

    /* ──────────────────────────────────────
       PRECIOS Y MODAL
    ────────────────────────────────────── */
    $scope.precioConDescuento = function (p) {
      if (!p) return 0;
      return p.descuento > 0 ? p.precio * (1 - p.descuento / 100) : p.precio;
    };

    $scope.abrirModal = function (producto) {
      $scope.productoSeleccionado = producto;
      $scope.cantidadModal = 1;
      if (bsModalProducto) bsModalProducto.show();
    };

    $scope.cerrarModal = function () {
      $scope.productoSeleccionado = null;
      if (bsModalProducto) bsModalProducto.hide();
    };

    $scope.incrementarQty = function (p) {
      if ($scope.cantidadModal < p.stock) { $scope.cantidadModal++; }
    };

    $scope.decrementarQty = function () {
      if ($scope.cantidadModal > 1) { $scope.cantidadModal--; }
    };

    /* ──────────────────────────────────────
       CARRITO DE COMPRAS
    ────────────────────────────────────── */
    $scope.agregarAlCarrito = function (producto) {
      if (!producto) return;
      if ($scope.cantidadModal < 1) return;

      var precioFinal = $scope.precioConDescuento(producto);
      var existente = $scope.carrito.find(function (item) {
        return item.id === producto.id;
      });

      if (existente) {
        var nuevaCantidad = existente.cantidad + $scope.cantidadModal;
        if (nuevaCantidad > producto.stock) {
          $scope.mostrarToast('No hay suficiente stock disponible.', 'bi-exclamation-triangle');
          return;
        }
        existente.cantidad = nuevaCantidad;
      } else {
        $scope.carrito.push({
          id:          producto.id,
          nombre:      producto.nombre,
          imagen:      producto.imagen,
          precioFinal: precioFinal,
          cantidad:    $scope.cantidadModal,
          stock:       producto.stock
        });
      }

      if (bsModalProducto) bsModalProducto.hide();
      $scope.productoSeleccionado = null;
      $scope.mostrarToast(producto.nombre + ' agregado al carrito.', 'bi-cart-check');

      var cartBtn = document.getElementById('cartBtn');
      if (cartBtn) {
        cartBtn.classList.add('pulse');
        setTimeout(function () { cartBtn.classList.remove('pulse'); }, 350);
      }
    };

    $scope.incrementarCarrito = function (item) {
      if (item.cantidad < item.stock) { item.cantidad++; }
    };

    $scope.decrementarCarrito = function (item) {
      if (item.cantidad > 1) { item.cantidad--; } else { $scope.eliminarDelCarrito(item); }
    };

    $scope.eliminarDelCarrito = function (item) {
      var idx = $scope.carrito.indexOf(item);
      if (idx > -1) { $scope.carrito.splice(idx, 1); }
    };

    $scope.totalCarrito = function () {
      return $scope.carrito.reduce(function (total, item) {
        return total + (item.precioFinal * item.cantidad);
      }, 0);
    };

    $scope.cantidadItems = function () {
      return $scope.carrito.reduce(function (total, item) {
        return total + item.cantidad;
      }, 0);
    };

    /* ──────────────────────────────────────
       MODAL CARRITO & PAGO
    ────────────────────────────────────── */
    $scope.abrirModalCarrito = function () {
      if (bsModalCarrito) bsModalCarrito.show();
    };

    $scope.pagar = function () {
      var total = $scope.totalCarrito();

      $scope.carrito.forEach(function(itemCarrito) {
        var productoOriginal = $scope.productos.find(function(p) {
          return p.id === itemCarrito.id;
        });
        if (productoOriginal) {
          productoOriginal.stock = productoOriginal.stock - itemCarrito.cantidad;
        }
      });

      $scope.carrito = [];
      if (bsModalCarrito) bsModalCarrito.hide();
      $scope.mostrarToast(
        '¡Pago exitoso! $' + total.toFixed(2) + ' procesados. ¡Gracias por tu compra!',
        'bi-check-circle-fill'
      );
    };

    $scope.mostrarToast = function (msg, icon) {
      $scope.toastMsg  = msg;
      $scope.toastIcon = icon || 'bi-info-circle';
      var toast = document.getElementById('toastOmni');
      if (toast) {
        toast.classList.add('show');
        setTimeout(function () { toast.classList.remove('show'); }, 3200);
      }
    };

  }
]);