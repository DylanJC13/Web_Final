import { Link } from 'react-router-dom';

export default function NFTCard({ nft }) {
  return (
    <article style={styles.card}>
      <img
        src={nft.image}
        alt={`Imagen del NFT ${nft.name}`}
        style={styles.image}
      />
      <div style={styles.content}>
        <h3 style={styles.title}>{nft.name}</h3>
        <p style={styles.description}>{nft.description}</p>
        <small style={styles.tokenId}>🆔 Token ID: {nft.tokenId}</small>
        <Link to={`/nft/${nft.tokenId}`} style={styles.link}>
          Ver Detalle →
        </Link>
      </div>
    </article>
  );
}

const styles = {
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out',
  },
  image: {
    width: '100%',
    borderRadius: '8px',
    objectFit: 'cover',
    marginBottom: '1rem',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  title: {
    fontSize: '1.2rem',
    color: '#ffffff',
    margin: 0,
  },
  description: {
    fontSize: '0.95rem',
    color: '#ccc',
    margin: 0,
  },
  tokenId: {
    fontSize: '0.8rem',
    color: '#999',
  },
  link: {
    marginTop: '0.5rem',
    alignSelf: 'flex-start',
    color: '#646cff',
    fontWeight: 'bold',
    textDecoration: 'none',
    transition: 'color 0.2s',
  }
};
