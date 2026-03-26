import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from './carrito/CartContext'
import { useState } from 'react'

const ProductosPage = () => {
  const { category } = useParams()

  const { addToCart } = useCart()
  const [message, setMessage] = useState(null);

  const categoryNames = {
    'gafas-sol': 'Gafas de Sol',
    'gafas-formuladas': 'Gafas Formuladas',
    'lentes-contacto': 'Lentes de Contacto',
    'gafas-deportivas': 'Gafas Deportivas'
  }

  const productosPorCategoria = {
    "gafas-sol": [
      {
        id: 1,
        nombre: "Sol Aviador",
        precio: "$80.000",
        descripcion: "Marco metálico liviano",
        imagen: "https://upload.wikimedia.org/wikipedia/commons/4/4b/RayBanAviator.jpg"
      },
      {
        id: 2,
        nombre: "Sol Retro",
        precio: "$90.000",
        descripcion: "Estilo vintage clásico",
        imagen: "https://down-co.img.susercontent.com/file/037ab01baa41bc38d2f1b08414e7d5fc"
      },
      {
        id: 3,
        nombre: "Sol Moderno",
        precio: "$110.000",
        descripcion: "Marco acetato moda",
        imagen: "https://www.hawkersco.com/on/demandware.static/-/Sites-Master-Catalog-Sunglasses/default/dw463e5ec8/images/w480/HOLR22BGTP_L.jpg"
      },
      {
        id: 4,
        nombre: "Sol Premium",
        precio: "$130.000",
        descripcion: "Polarizadas, UV400",
        imagen: "https://visuallensoptica.com/wp-content/uploads/2020/03/visual-lens-colombia-RB3542-002-5L-05-jpg.webp"
      },
      {
        id: 5,
        nombre: "Sol Doradas",
        precio: "$150.000",
        descripcion: "Marco dorado metálico",
        imagen: "https://mwhite.com.co/cdn/shop/files/persol-po-503302s-800056-gafas-de-sol-231.webp?v=1713411660"
      },
      {
        id: 6,
        nombre: "Sol Redondas",
        precio: "$95.000",
        descripcion: "Gafas estilo Lennon",
        imagen: "https://www.partypeoplecolombia.com/cdn/shop/products/Yoko-Negro-gafas-de-sol-redondas-party-people-colombia_1.png?v=1680909624&width=1445"
      },
      {
        id: 7,
        nombre: "Sol Polarizadas Urban",
        precio: "$120.000",
        descripcion: "Lentes polarizados UV400 para uso diario",
        imagen: "https://www.leurredelapeche.fr/60015-large_default/gafas-polarizadas-rapala-urban-visor-gear.jpg"
      },
      {
        id: 8,
        nombre: "Sol Clasicas Negras",
        precio: "$85.000",
        descripcion: "Diseño clásico atemporal para cualquier ocasión",
        imagen: "https://i5.walmartimages.com/asr/5e0e6f89-1e26-45f1-80f5-887b08f50a45.1a1bc7b4137e89ef27c320a584518dd0.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF"
      },
      {
        id: 9,
        nombre: "Sol Premium Reflex",
        precio: "$160.000",
        descripcion: "Gafas reflectivas de alta calidad",
        imagen: "https://hook-up.eu/64835-product_default/leech-reflex.jpg"
      }
    ],

    "gafas-formuladas": [
      {
        id: 10,
        nombre: "Marco Negro",
        precio: "$130.000",
        descripcion: "Ideal para uso diario",
        imagen: "https://optivisualcare.com/wp-content/uploads/2021/02/MARCO-NEGRO-LATERAL.jpg"
      },
      {
        id: 11,
        nombre: "Marco Transparente",
        precio: "$140.000",
        descripcion: "Diseño moderno y limpio",
        imagen: "https://www.lafam.com.co/cdn/shop/files/front-0RX7185__5943__STD__shad__qt_1800x1800.jpg?v=1697818173"
      },
      {
        id: 12,
        nombre: "Marco Juvenil",
        precio: "$150.000",
        descripcion: "Estilo moderno y ligero",
        imagen: "https://assets2.oakley.com/cdn-record-files-pi/0bf71f23-dbc5-4538-bc23-a8020135c1ed/b34c7a5c-e180-43b7-94b7-a8fd009162be/0OY3002__300203_030A.png?impolicy=OO_ratio&width=768"
      },
      {
        id: 13,
        nombre: "Marco Ovalo Profesional",
        precio: "$160.000",
        descripcion: "Diseño elegante idela para oficina",
        imagen: "https://i.ebayimg.com/thumbs/images/g/zesAAOSw~5RiN7A3/s-l1200.webp"
      },
      {
        id: 14,
        nombre: "Marco Slim Acetato",
        precio: "$135.000",
        descripcion: "Liviano y resistente para uso prolongado",
        imagen: "https://image.made-in-china.com/2f0j00KSIoFOQEfabN/Men-Eyewear-Hot-Sale-Rectangular-Slim-Acetate-Glasses-Optical-Frame-23SA018.webp"
      },
      {
        id: 15,
        nombre: "Marco Cuadrado Moderno",
        precio: "$155.000",
        descripcion: "Estilo moderno con bordes definidos",
        imagen: "https://image.made-in-china.com/318f0j00ganRGphdsPqr/K2084-mp4.webp"
      },
      {
        id: 16,
        nombre: "Marco Metal Minimal",
        precio: "$145.000",
        descripcion: "Delgado y sofisticado, para lentes progresivos",
        imagen: "https://img.joomcdn.net/2b72cbeed5f16969af4d04cdee530d665c502751_original.jpeg"
      },
      {
        id: 17,
        nombre: "Marco Acetato Color Azul",
        precio: "$148.000",
        descripcion: "Color azul solido y textura premium",
        imagen: "https://www.saju.co/cdn/shop/files/rocket-acetato-formuladas-marco-4-estilos-saju-colombia-7647880.jpg?v=1762783018"
      },
      {
        id: 18,
        nombre: "Marco Hibrido Pro",
        precio: "$110.000",
        descripcion: "Combinacion metal-acetato, resistente",
        imagen: "https://images-na.ssl-images-amazon.com/images/I/61-+8aIUI9L._AC_UL600_SR600,600_.jpg"
      }
    ],

    "lentes-contacto": [
      {
        id: 19,
        nombre: "Lentes diarios",
        precio: "$60.000",
        descripcion: "Fáciles de usar, gran hidratación",
        imagen: "https://opticentro.co/cdn/shop/products/1.Moist600x600_1080x.png?v=1591637692"
      },
      {
        id: 20,
        nombre: "Lentes mensuales",
        precio: "$80.000",
        descripcion: "Uso prolongado y seguro",
        imagen: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRTcC67hTOkZoQqLeSBaxejkHMWQbMbeaYlDopyKwRO_KR5TnRFDYW-tayaKuUwjxK1MSi1NSu5rpRRGmqJtoUkrsbCWCg61rF9rSb4B3tdLrbkDUgPLNmUPJgg"
      },
      {
        id: 21,
        nombre: "Lentes cosméticos",
        precio: "$95.000",
        descripcion: "Colores naturales llamativos",
        imagen: "https://www.lentesplus.com/media/catalog/product/l/u/lunare_azucaro_plana_1_1.jpg?auto=webp&format=pjpg&width=640&height=800&fit=cover"
      },
      {
        id: 22,
        nombre: "Lentes Naturales Azul",
        precio: "$70.000",
        descripcion: "Color azul suave con look natural",
        imagen: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQB66Vkgdka9QAUDhjjXJzHSV4PaIq_cJa6JowqSSjBVyIt9RwFaZboQbJjxc8yM20g7DnU1UasXnLmZzLJnpNxpQmASPaZHxwuDx97sKNKo9TAcHedf9wqhQ"
      },
      {
        id: 23,
        nombre: "Lentes Naturales Verde",
        precio: "$75.000",
        descripcion: "Tono verde natural para resaltar tu mirada",
        imagen: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTBjX2itrvNt1ZcU_DZcvaHdSn7ZHZfjJ9l732BwCD6-6fae1-Df3PHqE5w2P25CYoy1dvGyeim6FrOsAmLk267SJ8iCbKMYULRLyKIXzge808hLHgurltc5w"
      },
      {
        id: 24,
        nombre: "Lentes Premium",
        precio: "$65.000",
        descripcion: "Lentes con mayor comodidad, mas oxigeno para el ojo y mejor retención de humedad",
        imagen: "https://www.lentesdecontacto365.es/images/86775/306a4/lentes-de-contacto-hydrasense-1-day-total-confort.webp"
      },
      {
        id: 25,
        nombre: "Lentes Hidratacion +",
        precio: "$85.000",
        descripcion: "Mayor humedad para ojos sensibles",
        imagen: "https://www.myalcon.com/co/sites/g/files/rbvwei3096/files/2023-11/AIR-OPTIX-plus-HydraGlyde-packshot-teaser-1-3.png"
      },
      {
        id: 26,
        nombre: "Lentes Multifocales",
        precio: "$95.000",
        descripcion: "Diseñado para corregir la vision de diferentes distancias",
        imagen: "https://www.myalcon.com/es/sites/g/files/rbvwei2701/files/2024-02/TOTAL30-Multifocal-packshot-teaser-article-page.png"
      },
      {
        id: 27,
        nombre: "Lentes Toricos",
        precio: "$90.000",
        descripcion: "Seguro para corregir el astigmatismo",
        imagen: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTZKbgJDW5Y0O5SGti0Ua27ruCs7tXM-dUpKPLxOTtH8IqZIK84xtt9XfKxosT1ho125b0aa1re6yBk6ymdrCHmEPGvNqkN7xDeqh4HqtlU1ErCJ7b-zWFyEw"
      }
    ],

    "gafas-deportivas": [
      {
        id: 28,
        nombre: "Ciclismo Pro",
        precio: "$150.000",
        descripcion: "Protección UV completa",
        imagen: "https://www.skyapparel.co/cdn/shop/files/GAFADECICLISMO2.jpg?v=1712014389"
      },
      {
        id: 29,
        nombre: "Running Sport",
        precio: "$100.000",
        descripcion: "Ligeras y resistentes",
        imagen: "https://www.latiendadegafas.com/wp-content/uploads/2024/09/gafas-sol-oakley-corridor-oo9248-02.png"
      },
      {
        id: 30,
        nombre: "Outdoor Adventure",
        precio: "$170.000",
        descripcion: "Alta resistencia al impacto",
        imagen: "https://cdnx.jumpseller.com/tienda-ruta-outdoor/image/50692929/resize/3000/3000?1727112835"
      },
      {
        id: 31,
        nombre: "Sport Trail",
        precio: "$180.000",
        descripcion: "Diseñadas para actividades de aire libre",
        imagen: "https://http2.mlstatic.com/D_NQ_NP_873599-MLA95143858178_102025-O.webp"
      },
      {
        id: 32,
        nombre: "Cycling Aero",
        precio: "$210.000",
        descripcion: "Proteccion total para ciclismo profesional",
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzWyfYs1Na2G8J6nWs44ve2UIzZOrYF7wlegHj8QvzHhQysW7MoFhACIQ&s=10"
      },
      {
        id: 33,
        nombre: "Mountain Shield",
        precio: "$195.000",
        descripcion: "Lentes resistentes, ideales para senderismo",
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_nB1zsRPE8Q98GzNwB4Tz2lCjBVShHxO_nlcFEVFpz6wOiLgp9MjKRRc&s=10"
      },
      {
        id: 34,
        nombre: "Trail Runner Pro",
        precio: "$160.000",
        descripcion: "Ventiladas y con anti-vaho",
        imagen: "https://www.styrpe.es/wp-content/uploads/2025/06/STY-03-WHITE-GREEN-GREEN-REVO-1024x1024.webp"
      },
      {
        id: 35,
        nombre: "Gafas Kayak",
        precio: "$1750.000",
        descripcion: "Flotantes y con recubrimiento polarizado",
        imagen: "https://vader-prod.s3.amazonaws.com/1710346383-61pjWsk8V5L.jpg"
      },
      {
        id: 36,
        nombre: "Gafas Ski Performance",
        precio: "$230.000",
        descripcion: "Proteccion para nieve y reflejos intensos",
        imagen: "https://www.bfgcdn.com/1500_1500_90/417-1588/julbo-fusion-performance-hc-s1-3-gafas-de-esqui-detail-2.jpg"
      }
    ],
  };
  const productos = productosPorCategoria[category] || [];

  return (
    <div>

      <div className="container" style={{ marginTop: '120px' }}>
        <h1 className="mb-4">{categoryNames[category] || 'Productos'}</h1>

        <div className="row">
          {productos.map(producto => (
            <div key={producto.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{producto.nombre}</h5>
                  <p className="card-text">{producto.descripcion}</p>
                  <p className="fw-bold text-primary">{producto.precio}</p>

                  <button
                    className="btn btn-primary w-100"
                    onClick={() => {
                      addToCart({
                        id: producto.id,
                        name: producto.nombre,
                        price: parseInt(producto.precio.replace(/\./g, '').replace('$', '')),
                        displayPrice: producto.precio,
                        descripcion: producto.descripcion
                      });

                      setMessage(producto.id);

                      setTimeout(() => setMessage(null), 2000); // Se borra después de 2 segundos
                    }}
                  >
                    Añadir al carrito
                  </button>
                  {message === producto.id && (
                    <div className="alert alert-success mt-2 p-2 text-center">
                      Se añadió al carrito
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link to="/" className="btn btn-outline-secondary mt-3">
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default ProductosPage