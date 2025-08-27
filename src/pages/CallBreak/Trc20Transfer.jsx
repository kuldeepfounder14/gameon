import React, { useState, useEffect } from "react";

const USDT_CONTRACT_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // USDT TRC-20
const RECEIVER_ADDRESS = "TRPx3FcfaHFtmVqXzKiqk2A83a9o2uuHCH"; // Replace with valid TRC-20 address
const SECRET_KEY = "1c77db31cb7816c1f60a6b09919713ad36876178f852ddf1d7d86c1b91dc59f0"
const Trc20Transfer = () => { 
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [usdtBalance, setUsdtBalance] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const checkWallet = async () => {
      if (window.tronWeb && window.tronWeb.ready) {
        setConnected(true);
        setAddress(window.tronWeb.defaultAddress.base58);
        await fetchBalance();
      } else {
        setConnected(false);
      }
    };

    const interval = setInterval(checkWallet, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchBalance = async () => {
    try {
      const contract = await window.tronWeb
        .contract([
          {
            constant: true,
            inputs: [{ name: "_owner", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
            type: "function",
          },
        ])
        .at(USDT_CONTRACT_ADDRESS);

      const result = await contract
        .balanceOf(window.tronWeb.defaultAddress.base58)
        .call();
      const balance = window.tronWeb.toDecimal(result) / 1_000_000;
      setUsdtBalance(balance.toFixed(2));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setUsdtBalance("Error");
    }
  };

  const sendUSDT = async (selectedAmount) => {
    try {
      setStatus("Sending...");
      const contract = await window.tronWeb
        .contract()
        .at(USDT_CONTRACT_ADDRESS);
      const amount = selectedAmount * 1_000_000; // USDT has 6 decimals
      const tx = await contract.transfer(RECEIVER_ADDRESS, amount).send();
      setStatus(`✅ Success! TX ID: ${tx}`);
      if(tx){
        // sfj;safja;sf hitt staus : success
      }else{
        // setStatus("❌ Failed to send USDT");
      }
      await fetchBalance();
    } catch (error) {
      console.error(error);
      setStatus("❌ Failed to send USDT");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-black border border-gray">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        TRC-20 USDT Transfer
      </h2>

      {connected ? (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray">
              <strong>Wallet:</strong> {address}
            </p>
            <p className="text-sm text-gray">
              <strong>USDT Balance:</strong>{" "}
              {usdtBalance !== null ?`${usdtBalance} USDT`  : "Loading..."}
            </p>
          </div>

          <button
            onClick={sendUSDT}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition"
          >
            Send $10 USDT
          </button>
        </>
      ) : (
        <p className="text-red text-center">
          Please install TronLink and unlock your wallet.
        </p>
      )}

      {status && (
        <p className="mt-4 text-sm text-center text-gray">
          <strong>Status:</strong> {status}
        </p>
      )}
    </div>
  );
};

export default Trc20Transfer;