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

    /* ── Instancias de modales Bootstrap ── */
    var modalProductoEl = document.getElementById('modalProducto');
    var modalCarritoEl  = document.getElementById('modalCarrito');
    // Verificamos si los modales existen en el DOM antes de instanciarlos
    var bsModalProducto = modalProductoEl ? new bootstrap.Modal(modalProductoEl) : null;
    var bsModalCarrito  = modalCarritoEl ? new bootstrap.Modal(modalCarritoEl) : null;

    /**
     * FUNCIÓN: procesarDatos
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
     * FALLBACK (DATOS DE RESPALDO)
     */
    var fallbackData = {
      "productos": [
        { "id": 1, "nombre": "Laptop UltraSlim Pro 15", "descripcion": "Portátil de alto rendimiento con procesador Intel Core i7.", "precio": 899.99, "descuento": 15, "categoria": "Electrónica", "tag": "Más Vendido", "imagen": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop", "rating": 4, "destacado": true, "stock": 25 },
        { "id": 2, "nombre": "Smartphone Galaxy Z5", "descripcion": "Teléfono inteligente con pantalla AMOLED de 6.7 pulgadas.", "precio": 749.99, "descuento": 0, "categoria": "Electrónica", "tag": "Nuevo", "imagen": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop", "rating": 5, "destacado": true, "stock": 40 },
        { "id": 3, "nombre": "Audífonos Noise Pro X", "descripcion": "Auriculares inalámbricos con cancelación activa de ruido.", "precio": 199.99, "descuento": 20, "categoria": "Electrónica", "tag": "Oferta", "imagen": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop", "rating": 4, "destacado": false, "stock": 60 },
        { "id": 7, "nombre": "Camiseta Casual Premium", "descripcion": "Camiseta de algodón pima 100% de alta calidad.", "precio": 29.99, "descuento": 0, "categoria": "Ropa", "tag": "Básico", "imagen": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop", "rating": 4, "destacado": false, "stock": 150 },
        { "id": 8, "nombre": "Chaqueta Impermeable Trek", "descripcion": "Chaqueta outdoor con membrana Gore-Tex.", "precio": 189.99, "descuento": 25, "categoria": "Ropa", "tag": "Outdoor", "imagen": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=300&fit=crop", "rating": 5, "destacado": true, "stock": 30 },
        { "id": 11, "nombre": "Sofá Sectional Comfort+", "descripcion": "Sofá seccional de 4 plazas.", "precio": 1299.99, "descuento": 20, "categoria": "Hogar", "tag": "Premium", "imagen": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop", "rating": 5, "destacado": true, "stock": 8 },
        { "id": 17, "nombre": "Bicicleta MTB Carbon X9", "descripcion": "Bicicleta de montaña con cuadro de carbono.", "precio": 2499.99, "descuento": 10, "categoria": "Deportes", "tag": "Pro", "imagen": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", "rating": 5, "destacado": true, "stock": 5 },
        { "id": 26, "nombre": "Perfume Noir Absolu 100ml", "descripcion": "Eau de parfum oriental amaderado.", "precio": 89.99, "descuento": 15, "categoria": "Belleza", "tag": "Lujo", "imagen": "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&h=300&fit=crop", "rating": 5, "destacado": true, "stock": 35 }
      ],
      "categorias": [ "Electrónica", "Ropa", "Hogar", "Deportes", "Arte y Manualidades", "Belleza" ]
    };

    /**
     * Petición HTTP a la misma carpeta
     */
    $http.get('productos.json').then(function (res) {
      procesarDatos(res.data);
    }, function () {
      console.warn("No se pudo cargar productos.json por problemas de red/CORS. Utilizando el listado de emergencia.");
      procesarDatos(fallbackData);
      $scope.mostrarToast('Modo sin servidor activo. Algunos productos podrían faltar.', 'bi-info-circle');
    });

    /* ──────────────────────────────────────
       FILTROS (SISTEMA MEJORADO Y EFICIENTE)
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
       PRECIOS
    ────────────────────────────────────── */
    $scope.precioConDescuento = function (p) {
      if (!p) return 0;
      return p.descuento > 0 ? p.precio * (1 - p.descuento / 100) : p.precio;
    };

    /* ──────────────────────────────────────
       MODAL PRODUCTO
    ────────────────────────────────────── */
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
      if ($scope.cantidadModal < 1) {
        $scope.mostrarToast('La cantidad debe ser al menos 1.', 'bi-exclamation-triangle');
        return;
      }

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
       MODAL CARRITO & NOTIFICACIONES
    ────────────────────────────────────── */
    $scope.abrirModalCarrito = function () {
      if (bsModalCarrito) bsModalCarrito.show();
    };

    $scope.pagar = function () {
      var total = $scope.totalCarrito();
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