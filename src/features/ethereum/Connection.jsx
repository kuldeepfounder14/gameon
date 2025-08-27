import { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";
import { toast } from "react-toastify";
import Loader from "../../reusable_component/Loader/Loader";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

const contractAddress = import.meta.env.VITE_ETHEREUM_ADDRESS;
const Admin_Wallet_id = "0xfaA81CbBb99C0B630e4d2Ad41eDa0a6A55710a75";

function Connection() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [tokenSymbol, setTokenSymbol] = useState("GUC");
  const [betAmount, setBetAmount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState(null);

  // Check if user is already connected on component mount
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length > 0) {
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethProvider);
          setCurrentAccount(accounts[0]);
          await updateBalance(accounts[0], ethProvider);
        }
      }
    } catch (error) {
      console.log("Error checking wallet connection:", error);
    }
  };

  const updateBalance = async (account, ethProvider) => {
    try {
      if (!contractAddress || !account) return;
      
      const signer = await ethProvider.getSigner();
      const tokenContract = new ethers.Contract(contractAddress, abi, signer);
      
      const rawBalance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      const symbol = await tokenContract.symbol();

      setBalance(ethers.formatUnits(rawBalance, decimals));
      setTokenSymbol(symbol);
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const isMetaMaskMobileApp = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask && isMobile();
  };

  const openInMetaMaskMobile = () => {
    const currentUrl = window.location.href;
    const metamaskDeepLink = `https://metamask.app.link/dapp/${currentUrl.replace('https://', '').replace('http://', '')}`;
    
    // Try to open in MetaMask mobile app
    window.location.href = metamaskDeepLink;
    
    // Fallback: Show instructions after a delay
    setTimeout(() => {
      toast.info("If MetaMask didn't open, please copy this URL and paste it in MetaMask mobile browser", {
        autoClose: 8000
      });
    }, 2000);
  };

  const connectWallet = async () => {
    console.log("Attempting to connect wallet...");
    
    try {
      setIsConnecting(true);

      let ethProvider;
      let accounts;

      // Check if MetaMask is available (desktop or mobile app)
      if (typeof window.ethereum !== 'undefined') {
        console.log("MetaMask detected");

        // Handle MetaMask (both desktop and mobile app)
        ethProvider = new ethers.BrowserProvider(window.ethereum);
        
        try {
          // Request account access
          accounts = await window.ethereum.request({ 
            method: "eth_requestAccounts" 
          });
          console.log("Connected accounts:", accounts);

          if (!accounts || accounts.length === 0) {
            throw new Error("No accounts returned");
          }

        } catch (error) {
          // Handle user rejection
          if (error.code === 4001) {
            toast.error("Please connect your MetaMask wallet");
            return;
          }
          throw error;
        }

      } else if (isMobile()) {
        // Mobile device without MetaMask - guide user to MetaMask mobile app
        console.log("Mobile detected without MetaMask - redirecting to MetaMask app");
        
        toast.info("Redirecting to MetaMask mobile app...", { autoClose: 3000 });
        
        // Try to open the current page in MetaMask mobile app
        openInMetaMaskMobile();
        return;

      } else {
        // Desktop without MetaMask
        toast.error("Please install MetaMask browser extension");
        window.open("https://metamask.io/download/", "_blank");
        return;
      }

      // Set provider and account
      setProvider(ethProvider);
      const account = accounts[0];
      setCurrentAccount(account);

      // Update balance and token info
      await updateBalance(account, ethProvider);

      // Setup account change listener for MetaMask
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (newAccounts) => {
          console.log("Accounts changed:", newAccounts);
          if (newAccounts.length === 0) {
            setCurrentAccount(null);
            setProvider(null);
            setBalance("0");
            toast.info("Please connect your wallet");
          } else {
            setCurrentAccount(newAccounts[0]);
            updateBalance(newAccounts[0], ethProvider);
          }
        });

        window.ethereum.on('chainChanged', (chainId) => {
          console.log("Chain changed:", chainId);
          // Optionally reload or handle chain change
          window.location.reload();
        });
      }

      toast.success("Wallet connected successfully!");

    } catch (error) {
      console.error("Connection error:", error);
      
      if (error.code === -32002) {
        toast.error("Connection request already pending. Please check MetaMask.");
      } else if (error.message.includes("User rejected")) {
        toast.error("Connection rejected. Please approve the connection in your wallet.");
      } else {
        toast.error(`Failed to connect wallet: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setCurrentAccount(null);
    setProvider(null);
    setBalance("0");
    setTokenSymbol("GUC");
    toast.info("Wallet disconnected");
  };

  const placeBet = async (amount) => {
    if (!amount || !provider || !currentAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(contractAddress, abi, signer);

      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
      
      // Check balance
      const userBalanceRaw = await tokenContract.balanceOf(currentAccount);
      if (parsedAmount > userBalanceRaw) {
        toast.error(
          `Insufficient balance. You have only ${balance} ${tokenSymbol}`
        );
        return;
      }

      // Show transaction pending
      toast.info("Transaction pending...");
      
      const tx = await tokenContract.transfer(Admin_Wallet_id, parsedAmount);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success(
          `Transaction successful! ${amount} ${tokenSymbol} transferred to Admin.`
        );
        
        // Update balance after successful transaction
        await updateBalance(currentAccount, provider);
        setBetAmount("");
        return receipt;
      } else {
        throw new Error("Transaction failed");
      }

    } catch (error) {
      console.error("Error placing bet:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error.code === -32603) {
        toast.error("Transaction failed - insufficient gas or network error");
      } else {
        toast.error(`Transaction failed: ${error.message}`);
      }
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
    isConnecting,
    disconnectWallet,
    provider,
    isMobile: isMobile(),
    isMetaMaskMobileApp: isMetaMaskMobileApp(),
    openInMetaMaskMobile
  };
}

export default Connection;