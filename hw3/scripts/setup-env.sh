#!/bin/bash

# DApp Demo - Environment Setup Script
# Этот скрипт автоматически создает минимальные .env файлы для всех проектов

set -e  # Выход при ошибке

# Определяем корневую директорию проекта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔧 Начинаем настройку переменных окружения..."
echo "=============================================="

# Переходим в корневую директорию проекта
cd "$PROJECT_ROOT"

# Функция для настройки .env файла в директории
setup_env() {
    local dir=$1
    local name=$2

    echo ""
    echo "📁 Настройка $name..."
    echo "----------------------"

    if [ -d "$dir" ]; then
        cd "$dir"

        if [ -f ".env" ]; then
            echo "⚠️  .env файл уже существует в $dir, пропускаем..."
        else
            echo "📄 Создаем минимальный .env файл для $name..."
            create_minimal_env "$dir"
            echo "✅ .env файл создан в $dir"
        fi

        cd "$PROJECT_ROOT"
    else
        echo "❌ Директория $dir не существует!"
    fi
}

# Функция для создания минимального .env файла
create_minimal_env() {
    local dir=$1

    case "$dir" in
        "ethereum")
            cat > .env << 'EOF'
# Ethereum Environment Variables
# Заполните эти значения для работы с Ethereum сетями

# Sepolia Testnet RPC URL (Infura, Alchemy, или другой провайдер)
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Приватный ключ кошелька для деплоя (НИКОГДА НЕ КОММИТЬТЕ!)
PRIVATE_KEY=your_private_key_here

# API ключ для верификации контрактов на Etherscan
ETHERSCAN_API_KEY=your_etherscan_api_key

# Hoodi Testnet RPC URL (опционально)
HOODI_URL=https://rpc.hoodi.io/

# Для gas reporter (опционально)
# REPORT_GAS=true
# COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
EOF
            ;;
        "nextjs-frontend")
            cat > .env << 'EOF'
# Next.js Frontend Environment Variables
# Публичные переменные (префикс NEXT_PUBLIC_) доступны в браузере

# Ethereum RPC URL для подключения к сети
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Solana RPC URL для подключения к сети
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# TON RPC URL для подключения к сети
NEXT_PUBLIC_TON_RPC_URL=https://toncenter.com/api/v2/jsonRPC
EOF
            ;;
        "solana")
            cat > .env << 'EOF'
# Solana Environment Variables
# Solana использует стандартный путь к кошельку: ~/.config/solana/id.json
# Для работы с Solana установите Solana CLI и создайте кошелек

# RPC URL для подключения к Solana сети (опционально)
# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Devnet RPC URL (опционально)
# DEVNET_RPC_URL=https://api.devnet.solana.com

# Приватный ключ (опционально, обычно используется файл кошелька)
# PRIVATE_KEY=your_solana_private_key_here
EOF
            ;;
        "ton")
            cat > .env << 'EOF'
# TON Environment Variables
# TON проект не требует специальных переменных окружения для базовой работы

# Для расширенной функциональности можно добавить:
# TON_RPC_URL=https://toncenter.com/api/v2/jsonRPC
# TON_API_KEY=your_toncenter_api_key
EOF
            ;;
        *)
            # Общий минимальный .env файл для других директорий
            cat > .env << 'EOF'
# Environment Variables
# Добавьте необходимые переменные окружения для этого проекта
EOF
            ;;
    esac
}

# Настраиваем .env файлы для существующих проектов
setup_env "ethereum" "Ethereum"
setup_env "ton" "TON"
setup_env "solana" "Solana"
setup_env "nextjs-frontend" "Next.js Frontend"

echo ""
echo "🎉 Настройка переменных окружения завершена!"
echo "============================================"
echo ""
echo "📋 Созданные .env файлы:"
echo "   - ethereum/.env (SEPOLIA_URL, PRIVATE_KEY, ETHERSCAN_API_KEY)"
echo "   - ton/.env (минимальный, для будущего расширения)"
echo "   - solana/.env (минимальный, использует системный кошелек)"
echo "   - nextjs-frontend/.env (NEXT_PUBLIC_* RPC URLs)"
echo ""
echo "🔧 Следующие шаги:"
echo "   1. Отредактируйте .env файлы с реальными значениями"
echo "   2. Особенно важно: ethereum/.env - нужен PRIVATE_KEY для деплоя"
echo "   3. Никогда не коммитьте .env файлы в Git!"
echo "   4. Для демонстрации .env файлы не обязательны"
echo ""
echo "💡 Для редактирования используйте:"
echo "   nano ethereum/.env"
echo "   # или ваш любимый редактор"
echo ""
echo "🚀 Для запуска в демо-режиме (без настройки .env):"
echo "   cd nextjs-frontend && npm run dev"
echo ""
echo "📚 Документация:"
echo "   - README.md - общая структура проекта"
echo "   - QUICK_START.md - быстрый старт"
echo "   - Папка scripts/ - вспомогательные скрипты"
echo ""
