// src/components/Debug.jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';

// Este componente ayuda a debuggear problemas con los NFTs
export default function Debug() {
  const [tokenId, setTokenId] = useState('');
  const [contractAddress, setContractAddress] = useState('0xb7ce52a3c58ab9fa9fccf42d46c068acb368691b');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chainId, setChainId] = useState('');
  
  const ABI = [
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "name": "tokenURI",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "name": "ownerOf",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const checkNetwork = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask no detectado");
        return;
      }
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);
      
      const networkNames = {
        '0x1': 'Ethereum Mainnet',
        '0x5': 'Goerli Testnet',
        '0x13881': 'Mumbai (Polygon)',
        '0x89': 'Polygon Mainnet',
        '0x38': 'BSC Mainnet',
        '0xa86a': 'Avalanche',
        '0xa4b1': 'Arbitrum One'
      };
      
      const networkName = networkNames[chainId] || `Desconocida (${chainId})`;
      setResult(`Red actual: ${networkName} (${chainId})`);
    } catch (err) {
      setError(err.message);
    }
  };

  const queryTokenURI = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask no detectado");
      }
      
      if (!contractAddress) {
        throw new Error("Dirección del contrato requerida");
      }
      
      if (!tokenId && tokenId !== '0') {
        throw new Error("Token ID requerido");
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, ABI, provider);
      
      // Intentar obtener el propietario primero
      try {
        const owner = await contract.ownerOf(tokenId);
        setResult(prev => prev + `\n\nPropietario del NFT: ${owner}`);
      } catch (ownerError) {
        setResult(prev => prev + `\n\nError obteniendo propietario: ${ownerError.message}`);
        setError(`Es posible que el token ID ${tokenId} no exista en este contrato.`);
        setLoading(false);
        return;
      }
      
      // Si el propietario existe, intentar obtener tokenURI
      try {
        const uri = await contract.tokenURI(tokenId);
        setResult(prev => prev + `\n\nURI del NFT: ${uri}`);
        
        if (uri.startsWith('ipfs://')) {
          const httpUri = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
          setResult(prev => prev + `\n\nURI convertida: ${httpUri}`);
          
          // Intentar obtener los metadatos
          try {
            const response = await fetch(httpUri);
            const metadata = await response.json();
            setResult(prev => prev + `\n\nMetadata:\n${JSON.stringify(metadata, null, 2)}`);
          } catch (fetchError) {
            setError(`Error obteniendo metadata: ${fetchError.message}`);
          }
        } else if (uri.startsWith('http')) {
          // Intentar obtener los metadatos
          try {
            const response = await fetch(uri);
            const metadata = await response.json();
            setResult(prev => prev + `\n\nMetadata:\n${JSON.stringify(metadata, null, 2)}`);
          } catch (fetchError) {
            setError(`Error obteniendo metadata: ${fetchError.message}`);
          }
        } else {
          setResult(prev => prev + `\n\nFormato de URI no estándar. No se puede obtener metadata automáticamente.`);
        }
      } catch (uriError) {
        setError(`Error obteniendo tokenURI: ${uriError.message}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '10px',
      marginTop: '20px',
      marginBottom: '20px',
      backgroundColor: '#f9f9f9' 
    }}>
      <h3>Depurador de NFTs</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button onClick={checkNetwork} disabled={loading}>
          Verificar Red
        </button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Dirección del Contrato:
          <input 
            type="text" 
            value={contractAddress} 
            onChange={(e) => setContractAddress(e.target.value)}
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Token ID:
          <input 
            type="number" 
            value={tokenId} 
            onChange={(e) => setTokenId(e.target.value)}
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={queryTokenURI} 
          disabled={loading || (!tokenId && tokenId !== '0')}
        >
          {loading ? 'Cargando...' : 'Consultar Token'}
        </button>
      </div>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffeeee', 
          color: 'red',
          border: '1px solid red',
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          border: '1px solid #ddd',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          <strong>Resultado:</strong>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}