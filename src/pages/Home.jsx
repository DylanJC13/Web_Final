// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { getNFTMetadata } from "../utils/contract";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NFTCard from "../components/NFTCard";

// Red donde está desplegado el contrato (ajustar según tu caso)
const REQUIRED_NETWORK_ID = "0x89"; // Polygon Mainnet
const REQUIRED_NETWORK_NAME = "Polygon Mainnet";


const Home = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");

  // Verificar si estamos en la red correcta
  const checkNetwork = async () => {
    try {
      if (!window.ethereum) return false;
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log("Red actual:", chainId);
      
      if (chainId !== REQUIRED_NETWORK_ID) {
        setNetworkError(true);
        console.warn(`Por favor, cambia a ${REQUIRED_NETWORK_NAME}`);
        return false;
      } else {
        setNetworkError(false);
        return true;
      }
    } catch (err) {
      console.error("Error verificando red:", err);
      return false;
    }
  };

  // Cambiar de red automáticamente
  const switchNetwork = async () => {
    try {
      if (!window.ethereum) return false;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: REQUIRED_NETWORK_ID }],
      });
      
      return true;
    } catch (switchError) {
      // Si el error es porque la red no está configurada en MetaMask
      if (switchError.code === 4902) {
        try {
          // Para Mumbai Testnet
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: REQUIRED_NETWORK_ID,
                chainName: REQUIRED_NETWORK_NAME,
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
                rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                blockExplorerUrls: ['https://mumbai.polygonscan.com/']
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Error añadiendo red:", addError);
          return false;
        }
      }
      console.error("Error cambiando red:", switchError);
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      // Verifica si MetaMask está instalado
      if (!window.ethereum) {
        setError("Por favor instala MetaMask para continuar");
        return false;
      }
      
      // Solicita acceso a las cuentas
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      
      if (accounts.length === 0) {
        setError("No se detectaron cuentas. Por favor desbloquea MetaMask.");
        return false;
      }
      
      console.log("Cuenta conectada:", accounts[0]);
      setCurrentAccount(accounts[0]);
      setWalletConnected(true);
      
      // Verifica si estamos en la red correcta
      const correctNetwork = await checkNetwork();
      if (!correctNetwork) {
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Error al conectar wallet:", err);
      setError(`Error conectando wallet: ${err.message}`);
      return false;
    }
  };

  const fetchNFTs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Asegura que wallet esté conectado primero
      const connected = await connectWallet();
      if (!connected) {
        setLoading(false);
        return;
      }
      
      // Lista de IDs a probar - ajusta según los tokens que realmente existan
      // Comenzamos con IDs más bajos que tienen más probabilidad de existir
      const tokenIds = [1]; // Empezando desde 0 en lugar de 1
      
      // Usa Promise.allSettled para manejar fallos individuales
      const metadataPromises = tokenIds.map((id) => getNFTMetadata(id));
      const metadataResults = await Promise.allSettled(metadataPromises);
      
      console.log("Resultados de metadata:", metadataResults);
      
      const successfulResults = metadataResults
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failedResults = metadataResults
        .filter(result => result.status === 'rejected')
        .map((result, index) => ({
          tokenId: tokenIds[index],
          error: result.reason
        }));
      
      console.log("NFTs cargados exitosamente:", successfulResults);
      console.log("NFTs con error:", failedResults);
      
      if (successfulResults.length === 0) {
        setError("No se pudo cargar ningún NFT. Verifica la conexión y la dirección del contrato.");
      } else {
        setNfts(successfulResults);
      }
    } catch (err) {
      console.error("Error cargando NFTs:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
    
    // Configurar event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Cuenta de MetaMask cambiada a:', accounts[0]);
        setCurrentAccount(accounts[0] || "");
        fetchNFTs();
      });
      
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Red de MetaMask cambiada a:', chainId);
        checkNetwork();
        fetchNFTs();
      });
    }
    
    // Limpiar event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', fetchNFTs);
        window.ethereum.removeListener('chainChanged', fetchNFTs);
      }
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Mi Colección de NFTs</h1>
        
        {/* Estado de la wallet */}
        {currentAccount && (
          <div style={{ marginBottom: "1rem" }}>
            <small>Cuenta conectada: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</small>
          </div>
        )}

        {/* Error de red */}
        {networkError && (
          <div style={{ color: "red", padding: "1rem", background: "#ffeeee", borderRadius: "8px", marginBottom: "1rem" }}>
            <p>⚠️ Red incorrecta. Por favor, cambia a {REQUIRED_NETWORK_NAME}</p>
            <button onClick={switchNetwork}>Cambiar red</button>
          </div>
        )}

        {/* Estado de carga */}
        {loading && (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>Cargando NFTs...</p>
            <div style={{ display: "inline-block", width: "50px", height: "50px", border: "5px solid #f3f3f3", borderTop: "5px solid #646cff", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Errores generales */}
        {error && !loading && (
          <div style={{ color: "red", padding: "1rem", background: "#ffeeee", borderRadius: "8px", marginBottom: "1rem" }}>
            <p>⚠️ {error}</p>
            <button onClick={fetchNFTs}>Reintentar</button>
          </div>
        )}

        {/* Prompt para conectar wallet */}
        {!walletConnected && !loading && (
          <div style={{ padding: "2rem", textAlign: "center", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "1rem" }}>
            <p>Conecta tu wallet para ver tus NFTs</p>
            <button onClick={connectWallet}>Conectar Wallet</button>
          </div>
        )}

        {/* Lista de NFTs */}
        {nfts.length > 0 ? (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
            gap: "1.5rem" 
          }}>
            {nfts.map((nft) => (
              <NFTCard key={nft.tokenId} nft={nft} />
            ))}
          </div>
        ) : (
          walletConnected && !loading && !error && (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p>No se encontraron NFTs en esta colección</p>
            </div>
          )
        )}
      </main>
      <Footer />
    </>
  );
};

export default Home;