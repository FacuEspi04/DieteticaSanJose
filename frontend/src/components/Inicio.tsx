// src/components/Inicio.tsx
import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import logo from "../assets/dietSanJose.png"

const Inicio: React.FC = () => {
  return (
    <div className="mt-4">
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
          <Card className="shadow-sm h-100">
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
          <Card className="shadow-sm h-100">
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
          <Card className="shadow-sm h-100">
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

