import { useParams } from 'react-router-dom';

export default function NFTDetail() {
  const { id } = useParams();

  return (
    <main className="container">
      <h2>Detalle del NFT #{id}</h2>
      {/* Aquí puedes cargar metadata usando el ID y mostrarla */}
    </main>
  );
}
