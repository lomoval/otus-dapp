"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Copy,
  CheckCircle,
  ExternalLink,
  Database,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from "./TONConnectWrapper";
import { Address, toNano } from "@ton/core";
import { SIMPLE_STORAGE_ADDRESS } from "../config/ton-contract";
import { tonService } from "../services/tonService";

interface TONWalletProps {
  addLog: (
    message: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
  updateTotalValue: (value: number) => void;
}

// Inner component that uses TON Connect hooks
function TONWalletContent({ addLog, updateTotalValue }: TONWalletProps) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [balance, setBalance] = useState<string>("0");
  const [copied, setCopied] = useState(false);
  const [contractValue, setContractValue] = useState<string>("-");
  const [contractCounter, setContractCounter] = useState<number>(0);
  const [contractId, setContractId] = useState<number>(0);
  const [newValue, setNewValue] = useState<string>("");
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  useEffect(() => {
    if (wallet) {
      fetchBalance();
      fetchContractValue();
      addLog(
        `TON wallet connected: ${formatAddress(wallet.account.address)}`,
        "success",
      );
      addLog(
        `TON wallet connected: ${formatAddress(wallet.account.address)}`,
        "success",
      );
    } else {
      setBalance("0");
      setContractValue("-");
      setContractCounter(0);
      setContractId(0);
      addLog("TON wallet disconnected", "warning");
    }
  }, [wallet]);

  const fetchBalance = async () => {
    if (!wallet) return;

    setIsBalanceLoading(true);
    try {
      const balance = await tonService.getWalletBalance(wallet.account.address);
      setBalance(parseFloat(balance).toFixed(4));
      updateTotalValue(parseFloat(balance));
      addLog(`TON balance updated: ${balance} TON`, "success");
    } catch (error: any) {
      addLog(`Failed to get TON balance: ${error.message}`, "error");
      setBalance("0");
      updateTotalValue(0);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  const fetchContractValue = async () => {
    if (!wallet) return;

    setIsContractLoading(true);
    try {
      const data = await tonService.getContractStorageValue(
        SIMPLE_STORAGE_ADDRESS,
      );
      const counter = await tonService.getContractCounter(
        SIMPLE_STORAGE_ADDRESS,
      );
      const id = await tonService.getContractId(SIMPLE_STORAGE_ADDRESS);

      setContractValue(data);
      setContractCounter(counter);
      setContractId(id);
      addLog(`TON contract storage read: "${data}"`, "success");
      addLog(`Contract counter: ${counter}, ID: ${id}`, "info");
    } catch (error: any) {
      addLog(`Failed to read TON contract: ${error.message}`, "error");
      setContractValue("-");
      setContractCounter(0);
      setContractId(0);
    } finally {
      setIsContractLoading(false);
    }
  };

  const updateContractValue = async () => {
    if (!wallet || !tonConnectUI) {
      addLog("Please connect wallet first", "warning");
      return;
    }

    if (!newValue.trim()) {
      addLog("Please enter a value to set", "warning");
      return;
    }

    setIsContractLoading(true);
    try {
      const transaction = tonService.createUpdateTransaction(
        SIMPLE_STORAGE_ADDRESS,
        newValue,
      );
      const result = await tonConnectUI.sendTransaction(transaction);

      setContractValue(newValue);
      addLog(
        `TON contract storage update transaction sent: "${newValue}"`,
        "success",
      );
      addLog(`Transaction hash: ${result.boc.slice(0, 20)}...`, "info");
      setNewValue("");

      // Wait a bit and refresh contract data
      setTimeout(() => {
        fetchContractValue();
      }, 3000);
    } catch (error: any) {
      addLog(`Failed to update TON contract: ${error.message}`, "error");
    } finally {
      setIsContractLoading(false);
    }
  };

  const copyAddress = async () => {
    if (!wallet) return;

    try {
      await navigator.clipboard.writeText(wallet.account.address);
      setCopied(true);
      addLog("TON address copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      addLog("Failed to copy TON address", "error");
    }
  };

  const formatAddress = (address: string) => {
    return tonService.formatAddress(address);
  };

  const openInExplorer = () => {
    if (wallet) {
      window.open(
        tonService.getWalletExplorerUrl(wallet.account.address),
        "_blank",
      );
    }
  };

  const openContractInExplorer = () => {
    window.open(
      tonService.getContractExplorerUrl(SIMPLE_STORAGE_ADDRESS),
      "_blank",
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Wallet className="h-6 w-6 mr-3 text-cyan-400" />
          TON Portfolio
        </h2>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            wallet ? "status-connected" : "status-disconnected"
          }`}
        >
          {wallet ? "Connected" : "Disconnected"}
        </div>
      </div>

      {!wallet ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-6">
              Connect your TON wallet to manage your TON portfolio
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <TonConnectButton />
          </div>

          <div className="mt-6 text-sm text-gray-400">
            <p>Supported wallets: TonKeeper, OpenMask, MyTonWallet</p>
            <p className="mt-2">
              Contract Address: {formatAddress(SIMPLE_STORAGE_ADDRESS)}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-400">Account</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={openInExplorer}
                  className="flex items-center text-sm text-cyan-400 hover:text-cyan-300"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Explorer
                </button>
                <button
                  onClick={copyAddress}
                  className="flex items-center text-sm text-cyan-400 hover:text-cyan-300"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <p className="font-mono text-lg break-all text-white">
              {wallet.account.address}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400">Balance</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-white">
                  {balance} TON
                </span>
                <button
                  onClick={fetchBalance}
                  disabled={isBalanceLoading}
                  className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isBalanceLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Smart Contract Interaction */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center text-white">
                <Database className="h-5 w-5 mr-2 text-cyan-400" />
                TON Smart Contract Storage
              </h3>
              <button
                onClick={openContractInExplorer}
                className="flex items-center text-sm text-cyan-400 hover:text-cyan-300"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Contract
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">
                  Current Value
                </span>
                <button
                  onClick={fetchContractValue}
                  disabled={isContractLoading}
                  className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-1 ${isContractLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
              <div className="bg-gray-900 rounded px-3 py-2 font-mono text-white">
                {contractValue}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-400">
                  Counter
                </span>
                <div className="bg-gray-900 rounded px-3 py-2 font-mono text-white">
                  {contractCounter}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-400">
                  Contract ID
                </span>
                <div className="bg-gray-900 rounded px-3 py-2 font-mono text-white">
                  {contractId}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Set New Value
                </label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter new storage value..."
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={updateContractValue}
                disabled={isContractLoading || !newValue.trim()}
                className="btn btn-success w-full flex items-center justify-center"
              >
                {isContractLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Update Contract Storage
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>Contract: {formatAddress(SIMPLE_STORAGE_ADDRESS)}</p>
              <p>Gas fee: ~0.05 TON per transaction</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={fetchBalance}
              disabled={isBalanceLoading}
              className="btn btn-secondary flex items-center justify-center"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isBalanceLoading ? "animate-spin" : ""}`}
              />
              Refresh Balance
            </button>
            <button
              onClick={() => tonConnectUI.disconnect()}
              className="btn btn-danger"
            >
              Disconnect
            </button>
          </div>

          {/* Network Info */}
          <div className="text-sm text-gray-400">
            <p>Network: TON Testnet (testnet.toncenter.com)</p>
            <p>Contract deployed and ready for interactions</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component
export default function TONWallet(props: TONWalletProps) {
  return <TONWalletContent {...props} />;
}
