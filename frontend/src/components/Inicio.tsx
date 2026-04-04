import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ClipboardList, ShoppingCart } from "lucide-react";

const Inicio: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Removemos la sobreescritura de body overflow para evitar problemas de scroll en esta vista
  }, []);

  const cards = [
    {
      title: "Artículos",
      desc: "Gestiona tu inventario de productos.",
      icon: <Package size={28} className="text-white" />,
      iconBg: "bg-blue-500",
      path: "/articulos",
    },
    {
      title: "Pedidos",
      desc: "Administra y haz seguimiento de tus pedidos a proveedores.",
      icon: <ClipboardList size={28} className="text-white" />,
      iconBg: "bg-emerald-500",
      path: "/proveedores/pedidos/lista",
    },
    {
      title: "Ventas",
      desc: "Registra y consulta todas las ventas realizadas.",
      icon: <ShoppingCart size={28} className="text-white" />,
      iconBg: "bg-amber-500",
      path: "/ventas",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in w-full h-full pb-8">
      <div className="flex flex-col items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Gestor de negocios
        </h2>
        <p className="text-slate-500 text-sm mt-0">
          Selecciona una sección para comenzar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full">
        {cards.map((card) => (
          <div
            key={card.title}
            className="nav-card"
            onClick={() => navigate(card.path)}
          >
            <div className={`icon-wrapper ${card.iconBg}`} style={{ borderRadius: 12 }}>
              {card.icon}
            </div>
            <h5 className="text-lg font-semibold text-slate-900 mb-1">{card.title}</h5>
            <p className="text-sm text-slate-500 mb-0">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inicio;
