import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getNFTs } from "../utils/contract";
import NFTCard from "../components/NFTCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNFTs().then((data) => {
      setNfts(data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Navbar />
      <main className="container">
        <h2>Tus NFTs</h2>
        {loading ? (
          <p>Cargando NFTs...</p>
        ) : (
          <section className="grid">
            {nfts.map((nft) => (
              <motion.div
                key={nft.tokenId}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <NFTCard nft={nft} />
              </motion.div>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
