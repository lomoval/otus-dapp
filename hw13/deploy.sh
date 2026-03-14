#!/bin/bash
set -e

NEARDEV_DIR="./neardev"
ACCOUNT_FILE="$NEARDEV_DIR/dev-account"
WASM_FILE="./target/near/message_board.wasm"

echo "Сборка..."
cargo near build non-reproducible-wasm

if [ -f "$ACCOUNT_FILE" ]; then
    CONTRACT_ID=$(cat "$ACCOUNT_FILE")
    echo "Используем созданный аккаунт: $CONTRACT_ID"
else
    CONTRACT_ID="msgboard-$(date +%s).testnet"
    echo "Создаем аккаунт: $CONTRACT_ID"

    near account create-account sponsor-by-faucet-service "$CONTRACT_ID" \
        autogenerate-new-keypair save-to-legacy-keychain \
        network-config testnet create

    mkdir -p "$NEARDEV_DIR"
    echo "$CONTRACT_ID" > "$ACCOUNT_FILE"
    echo "Аккаунт сохранен в $ACCOUNT_FILE"
fi

echo "Деплоим $CONTRACT_ID..."
near contract deploy "$CONTRACT_ID" use-file "$WASM_FILE" \
    without-init-call network-config testnet sign-with-legacy-keychain send

echo ""
echo "=== Контракт задеплоин: $CONTRACT_ID ==="