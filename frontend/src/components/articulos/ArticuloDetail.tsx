// src/components/articulos/ArticuloDetail.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

const ArticuloDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Detalle del Artículo {id}</h3>
      <p>Aquí se mostraría la información completa del artículo con id {id}.</p>
    </div>
  );
};

export default ArticuloDetail;
