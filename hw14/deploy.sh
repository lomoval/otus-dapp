#!/bin/bash
set -e

NEARDEV_DIR="./neardev"
ACCOUNT_FILE="$NEARDEV_DIR/dev-account"
VERIFIER_ACCOUNT_FILE="$NEARDEV_DIR/verifier-account"
MB_WASM="./target/near/message_board/message_board.wasm"
VER_WASM="./target/near/verifier/verifier.wasm"

echo "=== Сборка обоих контрактов ==="
cd message-board && cargo near build non-reproducible-wasm && cd ..
cd verifier && cargo near build non-reproducible-wasm && cd ..

mkdir -p "$NEARDEV_DIR"

# --- Verifier ---
if [ -f "$VERIFIER_ACCOUNT_FILE" ]; then
    VERIFIER_ID=$(cat "$VERIFIER_ACCOUNT_FILE")
    echo "Используем Verifier аккаунт: $VERIFIER_ID"
else
    VERIFIER_ID="verifier-$(date +%s).testnet"
    echo "Создаем Verifier аккаунт: $VERIFIER_ID"

    near account create-account sponsor-by-faucet-service "$VERIFIER_ID" \
        autogenerate-new-keypair save-to-legacy-keychain \
        network-config testnet create

    echo "$VERIFIER_ID" > "$VERIFIER_ACCOUNT_FILE"
fi

echo "Деплоим Verifier: $VERIFIER_ID..."
near contract deploy "$VERIFIER_ID" use-file "$VER_WASM" \
    without-init-call network-config testnet sign-with-legacy-keychain send

# --- MessageBoard ---
if [ -f "$ACCOUNT_FILE" ]; then
    CONTRACT_ID=$(cat "$ACCOUNT_FILE")
    echo "Используем MessageBoard аккаунт: $CONTRACT_ID"
else
    CONTRACT_ID="msgboard-$(date +%s).testnet"
    echo "Создаем MessageBoard аккаунт: $CONTRACT_ID"

    near account create-account sponsor-by-faucet-service "$CONTRACT_ID" \
        autogenerate-new-keypair save-to-legacy-keychain \
        network-config testnet create

    echo "$CONTRACT_ID" > "$ACCOUNT_FILE"
fi

echo "Деплоим MessageBoard: $CONTRACT_ID..."
near contract deploy "$CONTRACT_ID" use-file "$MB_WASM" \
    with-init-call new json-args "{\"verifier_id\":\"$VERIFIER_ID\"}" \
    prepaid-gas '30.0 Tgas' attached-deposit '0 NEAR' \
    network-config testnet sign-with-legacy-keychain send

echo ""
echo "=== Деплой завершён ==="
echo "MessageBoard: $CONTRACT_ID"
echo "Verifier:     $VERIFIER_ID"
echo ""
echo "Регистрация:"
echo "near contract call-function as-transaction $CONTRACT_ID register json-args '{}' prepaid-gas '30.0 Tgas' attached-deposit '0.1 NEAR' sign-as $CONTRACT_ID network-config testnet sign-with-keychain send"
