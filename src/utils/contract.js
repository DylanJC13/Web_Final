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

// ✅ Función para obtener metadata del token usando tokenId
export const getNFTMetadata = async (tokenId) => {
  if (!window.ethereum) throw new Error("MetaMask no está disponible");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  const tokenURI = await contract.tokenURI(tokenId);
  console.log("tokenURI del token", tokenId, ":", tokenURI);
  const response = await fetch(tokenURI);
  const metadata = await response.json();

  return {
    tokenId,
    ...metadata,
  };
};
