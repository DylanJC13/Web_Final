// src/utils/contract.js
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xb7ce52a3c58ab9fa9fccf42d46c068acb368691b";

const ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
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

// Función para obtener metadata del token usando tokenId
export const getNFTMetadata = async (tokenId) => {
  if (!window.ethereum) throw new Error("MetaMask no está disponible");

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    // Intenta obtener la tokenURI del contrato
    const tokenURI = await contract.tokenURI(tokenId);
    console.log("tokenURI del token", tokenId, ":", tokenURI);
    
    // Solo verifica que la URI no sea vacía
    if (!tokenURI) {
      throw new Error(`URI vacía para token ${tokenId}`);
    }
    
    // Convertimos la URI de IPFS a HTTP si es necesario
    let fetchUri = tokenURI;
    if (tokenURI.startsWith('ipfs://')) {
      // Usamos gateway público de IPFS
      fetchUri = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      console.log(`Convertida IPFS URI a: ${fetchUri}`);
    }
    
    // Intenta obtener los metadatos
    try {
      const response = await fetch(fetchUri);
      
      if (!response.ok) {
        throw new Error(`Error al cargar metadata: ${response.status}`);
      }
      
      const metadata = await response.json();
      
      // Verifica que la metadata tenga los campos necesarios
      if (!metadata.name || !metadata.image) {
        console.warn(`Metadata incompleta para token ${tokenId}`, metadata);
      }
      
      // Si la imagen es IPFS, reemplaza el protocolo para que funcione en navegadores
      let imageUrl = metadata.image;
      if (imageUrl && imageUrl.startsWith('ipfs://')) {
        imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      return {
        tokenId,
        ...metadata,
        image: imageUrl || metadata.image // Usa la URL convertida si existe
      };
    } catch (error) {
      console.error(`Error procesando metadata para token ${tokenId}:`, error);
      // Devuelve datos mínimos para que la UI no se rompa
      return {
        tokenId,
        name: `NFT #${tokenId}`,
        description: 'Metadata no disponible',
        image: '/placeholder-nft.png' // Asegúrate de tener una imagen placeholder
      };
    }
  } catch (error) {
    console.error(`Error obteniendo datos para token ${tokenId}:`, error);
    throw error;
  }
};

// Función para verificar si MetaMask está instalado y accesible
export const checkMetaMaskAvailability = () => {
  return window.ethereum !== undefined;
};

// Función para conectarse a MetaMask
export const connectToMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask no está instalado");
  }
  
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    return accounts[0]; // Devuelve la dirección conectada
  } catch (error) {
    console.error("Error conectando a MetaMask:", error);
    throw error;
  }
};