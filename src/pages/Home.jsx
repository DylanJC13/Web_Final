import React, { useEffect, useState } from "react";
import { getNFTMetadata } from "../utils/contract";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NFTCard from "../components/NFTCard";
import { motion } from "framer-motion";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme
} from "victory";

const REQUIRED_NETWORK_ID = "0x89";
const REQUIRED_NETWORK_NAME = "Polygon Mainnet";

const Home = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");

  const checkNetwork = async () => {
    try {
      if (!window.ethereum) return false;
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== REQUIRED_NETWORK_ID) {
        setNetworkError(true);
        return false;
      } else {
        setNetworkError(false);
        return true;
      }
    } catch {
      return false;
    }
  };

  const switchNetwork = async () => {
    try {
      if (!window.ethereum) return false;
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: REQUIRED_NETWORK_ID }],
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
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
        } catch {
          return false;
        }
      }
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("Por favor instala MetaMask para continuar");
        return false;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        setError("No se detectaron cuentas.");
        return false;
      }
      setCurrentAccount(accounts[0]);
      setWalletConnected(true);
      return await checkNetwork();
    } catch (err) {
      setError(`Error conectando wallet: ${err.message}`);
      return false;
    }
  };

  const fetchNFTs = async () => {
    setLoading(true);
    setError(null);
    try {
      const connected = await connectWallet();
      if (!connected) {
        setLoading(false);
        return;
      }
      const tokenIds = [1,2];
      const metadataResults = await Promise.allSettled(tokenIds.map(id => getNFTMetadata(id)));
      const successful = metadataResults.filter(r => r.status === 'fulfilled').map(r => r.value);
      setNfts(successful);
      if (successful.length === 0) setError("No se pudo cargar ningún NFT.");
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setCurrentAccount(accounts[0] || "");
        fetchNFTs();
      });
      window.ethereum.on('chainChanged', () => {
        checkNetwork();
        fetchNFTs();
      });
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', fetchNFTs);
        window.ethereum.removeListener('chainChanged', fetchNFTs);
      }
    };
  }, []);

  const nftSummaryData = [
    { label: "Total NFTs", value: nfts.length },
    { label: "Tokens Válidos", value: nfts.length },
    { label: "Errores", value: error ? 1 : 0 },
  ];

  return (
    <>
      <Navbar />
      <main className="container">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Mi Colección de NFTs
        </motion.h1>

        {currentAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginBottom: "1rem" }}
          >
            <small>Cuenta conectada: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</small>
          </motion.div>
        )}

        {networkError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: "red", padding: "1rem", background: "#ffeeee", borderRadius: "8px", marginBottom: "1rem" }}
          >
            <p>⚠️ Red incorrecta. Por favor, cambia a {REQUIRED_NETWORK_NAME}</p>
            <button onClick={switchNetwork}>Cambiar red</button>
          </motion.div>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "2rem", textAlign: "center" }}
          >
            <p>Cargando NFTs...</p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: "red", padding: "1rem", background: "#ffeeee", borderRadius: "8px", marginBottom: "1rem" }}
          >
            <p>⚠️ {error}</p>
            <button onClick={fetchNFTs}>Reintentar</button>
          </motion.div>
        )}

        {!walletConnected && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "2rem", textAlign: "center", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "1rem" }}
          >
            <p>Conecta tu wallet para ver tus NFTs</p>
            <button onClick={connectWallet}>Conectar Wallet</button>
          </motion.div>
        )}

        {/* Gráfico de estadísticas */}
        {walletConnected && nfts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginBottom: "2rem" }}
          >
            <h3>📊 Estadísticas rápidas</h3>
            <VictoryChart domainPadding={20} theme={VictoryTheme.material}>
              <VictoryAxis />
              <VictoryAxis dependentAxis />
              <VictoryBar
                data={nftSummaryData}
                x="label"
                y="value"
                style={{ data: { fill: "#646cff" } }}
              />
            </VictoryChart>
          </motion.div>
        )}

        {nfts.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "1.5rem"
            }}
          >
            {nfts.map((nft) => (
              <motion.div
                key={nft.tokenId}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <NFTCard nft={nft} />
              </motion.div>
            ))}
          </motion.div>
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
