import React from 'react';
import { toast } from 'react-toastify';
import Connection from './Connection';

const WalletConnectButton = () => {
  const {
    currentAccount,
    balance,
    tokenSymbol,
    connectWallet,
    disconnectWallet,
    isConnecting,
    isMobile,
    isMetaMaskMobileApp,
    openInMetaMaskMobile
  } = Connection();

  // Helper function to format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Show different UI based on device and connection state
  const renderConnectionButton = () => {
    // Already connected
    if (currentAccount) {
      return (
        <div className="wallet-connected">
          <div className="account-info">
            <p><strong>Connected:</strong> {formatAddress(currentAccount)}</p>
            <p><strong>Balance:</strong> {parseFloat(balance).toFixed(4)} {tokenSymbol}</p>
            {isMetaMaskMobileApp && (
              <p className="mobile-indicator">📱 MetaMask Mobile</p>
            )}
          </div>
          <button 
            onClick={disconnectWallet}
            className="disconnect-btn"
          >
            Disconnect
          </button>
        </div>
      );
    }

    // Mobile without MetaMask
    if (isMobile && !window.ethereum) {
      return (
        <div className="mobile-metamask-guide">
          <h3>🦊 MetaMask Required</h3>
          <p>For the best experience on mobile, use MetaMask mobile app:</p>
          
          <div className="mobile-options">
            <button 
              onClick={openInMetaMaskMobile}
              className="metamask-mobile-btn primary"
            >
              📱 Open in MetaMask App
            </button>
            
            <div className="or-divider">OR</div>
            
            <div className="manual-steps">
              <h4>Manual Steps:</h4>
              <ol>
                <li>Download MetaMask mobile app</li>
                <li>Open MetaMask browser</li>
                <li>Navigate to: <code>{window.location.href}</code></li>
              </ol>
              <div className="app-links">
                <a 
                  href="https://apps.apple.com/app/metamask/id1438144202" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="app-link ios"
                >
                  📱 iOS App Store
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=io.metamask" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="app-link android"
                >
                  📱 Google Play
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Desktop without MetaMask
    if (!isMobile && !window.ethereum) {
      return (
        <div className="desktop-metamask-guide">
          <h3>🦊 MetaMask Required</h3>
          <p>Please install MetaMask browser extension:</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="metamask-download-btn"
          >
            Download MetaMask Extension
          </a>
        </div>
      );
    }

    // Ready to connect (MetaMask available)
    return (
      <button 
        onClick={connectWallet}
        disabled={isConnecting}
        className="connect-btn primary"
      >
        {isConnecting ? (
          <>
            <span className="spinner"></span>
            Connecting...
          </>
        ) : (
          <>
            🦊 Connect MetaMask
            {isMobile && <span className="mobile-indicator"> (Mobile)</span>}
          </>
        )}
      </button>
    );
  };

  return (
    <div className="wallet-connection-container">
      {renderConnectionButton()}
      
      {/* Additional mobile tips */}
      {isMobile && !isMetaMaskMobileApp && (
        <div className="mobile-tips">
          <h4>💡 Mobile Tips:</h4>
          <ul>
            <li>Use MetaMask mobile app's built-in browser</li>
            <li>Don't use regular Safari/Chrome - they can't access your wallet</li>
            <li>If the page doesn't load in MetaMask, try refreshing</li>
          </ul>
        </div>
      )}
      
      <style jsx>{`
        .wallet-connection-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .wallet-connected {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
        }

        .account-info {
          margin-bottom: 10px;
        }

        .account-info p {
          margin: 5px 0;
          font-size: 14px;
        }

        .mobile-indicator {
          color: #6c757d;
          font-size: 12px;
        }

        .disconnect-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .disconnect-btn:hover {
          background: #c82333;
        }

        .mobile-metamask-guide {
          text-align: center;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
        }

        .mobile-metamask-guide h3 {
          margin-top: 0;
          color: #856404;
        }

        .metamask-mobile-btn {
          background: #f6851b;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin: 10px 0;
          display: block;
          width: 100%;
        }

        .metamask-mobile-btn:hover {
          background: #e2761b;
        }

        .or-divider {
          margin: 15px 0;
          color: #6c757d;
          font-weight: bold;
        }

        .manual-steps {
          text-align: left;
          background: #f8f9fa;
          border-radius: 4px;
          padding: 15px;
          margin-top: 15px;
        }

        .manual-steps h4 {
          margin-top: 0;
          color: #495057;
        }

        .manual-steps ol {
          padding-left: 20px;
        }

        .manual-steps li {
          margin: 8px 0;
        }

        .manual-steps code {
          background: #e9ecef;
          padding: 2px 4px;
          border-radius: 2px;
          font-size: 12px;
          word-break: break-all;
        }

        .app-links {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .app-link {
          flex: 1;
          display: block;
          text-align: center;
          background: #007bff;
          color: white;
          text-decoration: none;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .app-link:hover {
          background: #0056b3;
        }

        .connect-btn {
          background: #f6851b;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
        }

        .connect-btn:hover:not(:disabled) {
          background: #e2761b;
        }

        .connect-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .desktop-metamask-guide {
          text-align: center;
          background: #d1ecf1;
          border: 1px solid #bee5eb;
          border-radius: 8px;
          padding: 20px;
        }

        .desktop-metamask-guide h3 {
          margin-top: 0;
          color: #0c5460;
        }

        .metamask-download-btn {
          display: inline-block;
          background: #f6851b;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          margin-top: 10px;
        }

        .metamask-download-btn:hover {
          background: #e2761b;
        }

        .mobile-tips {
          background: #d1ecf1;
          border: 1px solid #bee5eb;
          border-radius: 8px;
          padding: 15px;
          margin-top: 15px;
        }

        .mobile-tips h4 {
          margin-top: 0;
          color: #0c5460;
        }

        .mobile-tips ul {
          margin: 0;
          padding-left: 20px;
        }

        .mobile-tips li {
          margin: 8px 0;
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .wallet-connection-container {
            padding: 15px;
          }
          
          .app-links {
            flex-direction: column;
          }
          
          .manual-steps code {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default WalletConnectButton;