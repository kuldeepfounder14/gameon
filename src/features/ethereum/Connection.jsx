import { useState } from 'react';
import { ethers } from 'ethers';
import abi from './abi.json'; // Adjust path as needed

const contractAddress = import.meta.env.VITE_ETHEREUM_ADDRESS;

function Connection() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [tokenSymbol, setTokenSymbol] = useState("GUC");
  const [betAmount, setBetAmount] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(contractAddress, abi, signer);

      const rawBalance = await tokenContract.balanceOf(accounts[0]);
      const decimals = await tokenContract.decimals();
      const symbol = await tokenContract.symbol();

      setBalance(ethers.formatUnits(rawBalance, decimals));
      setTokenSymbol(symbol);
    } catch (error) {
      console.error("Error connecting wallet", error);
    }
  };

  const placeBet = async () => {
    if (!betAmount || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(contractAddress, abi, signer);

      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(betAmount, decimals);

      const tx = await tokenContract.transfer(contractAddress, parsedAmount);
      await tx.wait();

      alert(`Bet placed successfully! ${betAmount} ${tokenSymbol} transferred to Admin.`);
      setBetAmount("");
    } catch (error) {
      console.error("Error placing bet", error);
      alert("Bet placement failed!");
    }
  };

  return {
    currentAccount,
    balance,
    tokenSymbol,
    betAmount,
    setBetAmount,
    connectWallet,
    placeBet,
  };
}

export default Connection;
