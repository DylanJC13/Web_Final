import React, { useEffect, useState } from "react";
import { getNFTMetadata } from "../utils/contract";

const Home = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNFTs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Asegura conexión con MetaMask
      if (!window.ethereum) throw new Error("Instala MetaMask para continuar");
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const tokenIds = [1, 2, 3, 4, 5]; // Puedes hacer esto dinámico si sabes cuántos tokens hay
      const metadataPromises = tokenIds.map((id) => getNFTMetadata(id));
      const metadataResults = await Promise.all(metadataPromises);
      setNfts(metadataResults);
    } catch (err) {
      console.error("Error cargando NFTs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Galería de NFTs</h1>

      {loading && <p>Cargando NFTs...</p>}
      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
        {nfts.map((nft) => (
          <div key={nft.tokenId} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <img src={nft.image} alt={nft.name} style={{ width: "100%", borderRadius: "6px" }} />
            <h2 style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>{nft.name}</h2>
            <p>{nft.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

