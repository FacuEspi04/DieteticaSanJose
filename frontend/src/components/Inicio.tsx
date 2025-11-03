import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // <-- 1. IMPORTAR useNavigate
import logo from "../assets/dietSanJose.png";

// --- 2. AÑADIR UN POCO DE ESTILO PARA EL HOVER ---
// (Esto es opcional, pero mejora la experiencia de usuario)
const style = `
  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
`;

const Inicio: React.FC = () => {
  const navigate = useNavigate(); // <-- 3. INICIALIZAR EL HOOK

  return (
    <div className="mt-4">
      {/* Añadimos el tag <style> para los efectos hover */}
      <style>{style}</style>
      
      <h2 className="mb-4 text-center">Bienvenido a Dietética San José</h2>
      {/* Logo centrado */}
      <div className="d-flex justify-content-center mb-4">
        <img 
          src={logo} 
          alt="Dietética San José" 
          style={{ height: '150px', objectFit: 'contain' }}
        />
      </div>
      <Row className="g-4">
        <Col md={4}>
          {/* --- 4. AÑADIR onClick, style y className --- */}
          <Card 
            className="shadow-sm h-100 card-hover" 
            onClick={() => navigate('/articulos')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center">
              <div style={{ fontSize: "3rem", color: "#8f3d38" }}>📦</div>
              <Card.Title>Artículos</Card.Title>
              <Card.Text>
                Gestiona tu inventario de productos dietéticos y naturales.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* --- 4. AÑADIR onClick, style y className --- */}
          <Card 
            className="shadow-sm h-100 card-hover"
            onClick={() => navigate('/proveedores')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center">
              <div style={{ fontSize: "3rem", color: "#8f3d38" }}>🤝</div>
              <Card.Title>Proveedores</Card.Title>
              <Card.Text>
                Administra tus proveedores y mantén contacto actualizado.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* --- 4. AÑADIR onClick, style y className --- */}
          <Card 
            className="shadow-sm h-100 card-hover"
            onClick={() => navigate('/ventas')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center">
              <div style={{ fontSize: "3rem", color: "#8f3d38" }}>💰</div>
              <Card.Title>Ventas</Card.Title>
              <Card.Text>
                Registra y consulta todas las ventas realizadas.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Inicio;
