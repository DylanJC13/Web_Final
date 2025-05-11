// src/utils/contract.js

import { ethers } from "ethers";

// ✅ Dirección del contrato inteligente en la red de Polygon
const CONTRACT_ADDRESS = "0xb7ce52a3c58ab9fa9fccf42d46c068acb368691b";

// ✅ ABI del contrato (copiado de Polygonscan)
const ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "tokenURI",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "ownerOf",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
  // Puedes agregar más funciones del ABI si las necesitas (como mint o transfer)
];

// ✅ Función para obtener metadata del token usando tokenId
export const getNFTMetadata = async (tokenId) => {
  if (!window.ethereum) throw new Error("MetaMask no está disponible");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  const tokenURI = await contract.tokenURI(tokenId);
  const response = await fetch(tokenURI);
  const metadata = await response.json();

  return {
    tokenId,
    ...metadata,
  };
};
