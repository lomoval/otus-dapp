"use client";

import {
  TonConnectUIProvider,
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
  THEME,
} from "@tonconnect/ui-react";

interface TONConnectWrapperProps {
  children: React.ReactNode;
}

export function TONConnectWrapper({ children }: TONConnectWrapperProps) {
  return (
    <TonConnectUIProvider
      manifestUrl="https://ton.rut.radianceteam.com/tonconnect-manifest.json"
      uiPreferences={{ theme: THEME.DARK }}
      actionsConfiguration={{
        twaReturnUrl: "https://t.me/DemoDappWithTonConnectBot/demo",
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
}

export { TonConnectButton, useTonConnectUI, useTonWallet };
