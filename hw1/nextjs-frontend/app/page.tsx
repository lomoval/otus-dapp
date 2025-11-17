"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Activity,
  TrendingUp,
  DollarSign,
  BarChart3,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";
import { TONConnectWrapper } from "../components/TONConnectWrapper";

// Dynamically import wallet components to avoid SSR issues
const EthereumWallet = dynamic(() => import("../components/EthereumWallet"), {
  ssr: false,
  loading: () => <div className="card">Loading Ethereum wallet...</div>,
});

const TONWallet = dynamic(() => import("../components/TONWallet"), {
  ssr: false,
  loading: () => <div className="card">Loading TON wallet...</div>,
});

const SolanaWallet = dynamic(() => import("../components/SolanaWallet"), {
  ssr: false,
  loading: () => <div className="card">Loading Solana wallet...</div>,
});

const Logs = dynamic(() => import("../components/Logs"), {
  ssr: false,
  loading: () => <div className="card">Loading logs...</div>,
});

interface LogEntry {
  timestamp: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeChain, setActiveChain] = useState<"ethereum" | "ton" | "solana">(
    "ethereum",
  );
  const [totalValue, setTotalValue] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("");

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const updateTotalValue = (value: number) => {
    setTotalValue((prev) => prev + value);
  };

  useEffect(() => {
    addLog("🚀 Financial Dashboard initialized", "success");
    addLog(
      "💡 Connect wallets to view balances and interact with contracts",
      "info",
    );

    // Set initial time after component mounts to avoid hydration mismatch
    setCurrentTime(new Date().toLocaleTimeString());

    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <TrendingUp className="logo-icon" />
              <h1>Multi-Chain Finance Dashboard</h1>
            </div>
            <p className="header-subtitle">
              Real-time portfolio tracking and smart contract interactions
            </p>
          </div>
          <div className="header-right">
            <div className="total-value">
              <DollarSign className="value-icon" />
              <div className="value-content">
                <span className="value-label">Total Portfolio</span>
                <span className="value-amount">${totalValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Navigation */}
        <div className="navigation-section">
          <div className="chain-selector">
            <button
              onClick={() => setActiveChain("ethereum")}
              className={`nav-btn ${activeChain === "ethereum" ? "nav-btn-active" : ""}`}
            >
              <div className="nav-icon eth-icon">
                <BarChart3 />
              </div>
              <span>Ethereum</span>
            </button>
            <button
              onClick={() => setActiveChain("ton")}
              className={`nav-btn ${activeChain === "ton" ? "nav-btn-active" : ""}`}
            >
              <div className="nav-icon ton-icon">
                <Zap />
              </div>
              <span>TON</span>
            </button>
            <button
              onClick={() => setActiveChain("solana")}
              className={`nav-btn ${activeChain === "solana" ? "nav-btn-active" : ""}`}
            >
              <div className="nav-icon solana-icon">
                <Activity />
              </div>
              <span>Solana</span>
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Main Content */}
          <div className="main-content">
            {/* Wallet Integration */}
            <div className="wallet-section">
              {activeChain === "ethereum" && (
                <EthereumWallet
                  addLog={addLog}
                  updateTotalValue={updateTotalValue}
                />
              )}
              {activeChain === "ton" && (
                <TONConnectWrapper>
                  <TONWallet
                    addLog={addLog}
                    updateTotalValue={updateTotalValue}
                  />
                </TONConnectWrapper>
              )}
              {activeChain === "solana" && (
                <SolanaWallet
                  addLog={addLog}
                  updateTotalValue={updateTotalValue}
                />
              )}
            </div>

            {/* Quick Actions */}
            <div className="actions-section">
              <div className="card">
                <h3 className="section-title">
                  <Activity className="section-icon" />
                  Quick Actions
                </h3>
                <div className="actions-grid">
                  <button
                    onClick={() =>
                      addLog("📊 Portfolio analysis completed", "success")
                    }
                    className="action-btn primary"
                  >
                    Analyze Portfolio
                  </button>
                  <button
                    onClick={() => addLog("📈 Market data refreshed", "info")}
                    className="action-btn secondary"
                  >
                    Refresh Data
                  </button>
                  <button
                    onClick={() =>
                      addLog("💸 Transaction simulation completed", "success")
                    }
                    className="action-btn success"
                  >
                    Simulate Trade
                  </button>
                  <button onClick={clearLogs} className="action-btn danger">
                    Clear Logs
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <Logs logs={logs} clearLogs={clearLogs} />

            {/* Market Stats */}
            <div className="market-stats">
              <div className="card">
                <h3 className="section-title">
                  <TrendingUp className="section-icon" />
                  Market Overview
                </h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">ETH Price</span>
                    <span className="stat-value">$3,250.75</span>
                    <span className="stat-change positive">+2.3%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">SOL Price</span>
                    <span className="stat-value">$102.45</span>
                    <span className="stat-change positive">+1.8%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">TON Price</span>
                    <span className="stat-value">$2.15</span>
                    <span className="stat-change negative">-0.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <p>Multi-Chain Finance Dashboard v1.0 • Built with Next.js</p>
          <div className="footer-stats">
            <span className="stat">Connected: 3 Networks</span>
            <span className="stat">
              Last Update: {currentTime || "Loading..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
