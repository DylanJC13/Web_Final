import { Link } from 'react-router-dom';

export default function NFTCard({ nft }) {
  return (
    <article>
      <hgroup>
        <h3>{nft.name}</h3>
        <h4>{nft.description}</h4>
      </hgroup>
      <img src={nft.image} alt={`Imagen del NFT ${nft.name}`} />
      <small>Token ID: {nft.tokenId}</small>
      <p><Link to={`/nft/${nft.tokenId}`}>Ver Detalle</Link></p>
    </article>
  );
}
