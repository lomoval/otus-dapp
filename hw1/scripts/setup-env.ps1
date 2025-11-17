# DApp Demo - Environment Setup Script (PowerShell)
# Этот скрипт автоматически создает минимальные .env файлы для всех проектов

$ErrorActionPreference = "Stop"

Write-Host "🔧 Начинаем настройку переменных окружения..."
Write-Host "=============================================="

# Определяем директорию скрипта и корень проекта
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir

Set-Location $ProjectRoot

# -----------------------------
# Функция создания .env файла
# -----------------------------
function Create-MinimalEnv {
    param([string]$dir)

    switch ($dir) {
        "ethereum" {
@"
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
"@ | Out-File ".env" -Encoding UTF8
        }

        "nextjs-frontend" {
@"
# Next.js Frontend Environment Variables

NEXT_PUBLIC_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_TON_RPC_URL=https://toncenter.com/api/v2/jsonRPC
"@ | Out-File ".env" -Encoding UTF8
        }

        "solana" {
@"
# Solana Environment Variables

# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# DEVNET_RPC_URL=https://api.devnet.solana.com
# PRIVATE_KEY=your_solana_private_key_here
"@ | Out-File ".env" -Encoding UTF8
        }

        "ton" {
@"
# TON Environment Variables

# TON_RPC_URL=https://toncenter.com/api/v2/jsonRPC
# TON_API_KEY=your_toncenter_api_key
"@ | Out-File ".env" -Encoding UTF8
        }

        default {
@"
# Environment Variables
# Добавьте необходимые переменные окружения для этого проекта
"@ | Out-File ".env" -Encoding UTF8
        }
    }
}

# -----------------------------
# Функция настройки директории
# -----------------------------
function Setup-Env {
    param(
        [string]$dir,
        [string]$name
    )

    Write-Host ""
    Write-Host "📁 Настройка $name..."
    Write-Host "----------------------"

    $path = Join-Path $ProjectRoot $dir

    if (!(Test-Path $path)) {
        Write-Host "❌ Директория $dir не существует!"
        return
    }

    Set-Location $path

    if (Test-Path ".env") {
        Write-Host "⚠️  .env файл уже существует в $dir, пропускаем..."
    }
    else {
        Write-Host "📄 Создаем минимальный .env файл для $name..."
        Create-MinimalEnv $dir
        Write-Host "✅ .env файл создан в $dir"
    }

    Set-Location $ProjectRoot
}

# -----------------------------
# Устанавливаем .env файлы
# -----------------------------

Setup-Env "ethereum"        "Ethereum"
Setup-Env "ton"             "TON"
Setup-Env "solana"          "Solana"
Setup-Env "nextjs-frontend" "Next.js Frontend"

Write-Host ""
Write-Host "🎉 Настройка переменных окружения завершена!"
Write-Host "============================================"
Write-Host ""
Write-Host "📋 Созданные .env файлы:"
Write-Host "   - ethereum/.env (SEPOLIA_URL, PRIVATE_KEY, ETHERSCAN_API_KEY)"
Write-Host "   - ton/.env (минимальный)"
Write-Host "   - solana/.env (минимальный)"
Write-Host "   - nextjs-frontend/.env (NEXT_PUBLIC_* RPC URLs)"
Write-Host ""
Write-Host "🔧 Следующие шаги:"
Write-Host "   1. Отредактируйте .env файлы"
Write-Host "   2. Никогда не коммитьте .env в Git"
Write-Host "   3. Для демонстрации .env файлы не обязательны"
Write-Host ""
Write-Host "🚀 Для запуска без .env:"
Write-Host "   cd nextjs-frontend && npm run dev"
Write-Host ""
Write-Host "📚 Документация:"
Write-Host "   - README.md"
Write-Host "   - QUICK_START.md"
Write-Host "   - scripts/ папка"
Write-Host ""
