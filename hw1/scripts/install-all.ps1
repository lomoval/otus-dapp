# Скрипт установки зависимостей для DApp-шаблона (PowerShell)
# Аналог bash-версии

$ErrorActionPreference = "Stop"

Write-Host "🚀 Начинаем установку шаблона проекта для домашнего задания DApp..."
Write-Host "========================================================"

# Определяем директорию скрипта и корень проекта
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "ScriptDir = $ScriptDir"
Write-Host "ProjectRoot = $ProjectRoot"

# Проверка Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js не установлен. Установите Node.js версии 16 или выше."
    exit 1
}

Write-Host "✅ Node.js найден: $(node --version)"

# Проверка npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm не установлен. Установите npm."
    exit 1
}

Write-Host "✅ npm найден: $(npm --version)"

# -----------------------------
# Функция установки зависимостей
# -----------------------------
function Install-Deps {
    param(
        [string]$dir,
        [string]$name
    )

    Write-Host ""
    Write-Host "📦 Устанавливаем зависимости для $name..."
    Write-Host "------------------------------------------"

    $fullPath = Join-Path $ProjectRoot $dir

    if (-not (Test-Path $fullPath)) {
        Write-Host "❌ Директория $fullPath не существует!"
        exit 1
    }

    Set-Location $fullPath

    if (Test-Path "package.json") {
        Write-Host "📄 Найден package.json в $dir"

        try {
            npm install
            Write-Host "✅ Зависимости для $name установлены успешно!"
        }
        catch {
            Write-Host "⚠️ Конфликт зависимостей, пробуем с --legacy-peer-deps..."

            try {
                npm install --legacy-peer-deps
                Write-Host "✅ Зависимости для $name установлены с --legacy-peer-deps!"
            }
            catch {
                Write-Host "❌ Не удалось установить зависимости для $name"
                exit 1
            }
        }
    }
    else {
        Write-Host "⚠️ package.json не найден в $dir, пропускаем..."
    }

    Set-Location $ProjectRoot
}

# Переходим в корень проекта
Set-Location $ProjectRoot

# Устанавливаем зависимости для всех компонентов
Install-Deps "ethereum" "Ethereum"
Install-Deps "ton" "TON"
Install-Deps "solana" "Solana"
Install-Deps "nextjs-frontend" "Next.js Frontend"

Write-Host ""
Write-Host "🎉 Все зависимости шаблона успешно установлены!"
Write-Host "================================================"
Write-Host ""
Write-Host "🔧 Для настройки переменных окружения для разработки:"
Write-Host "   ./scripts/setup-env.ps1"
Write-Host ""
Write-Host "🚀 Для тестирования шаблона выполните:"
Write-Host "   cd nextjs-frontend && npm run dev"
Write-Host ""
Write-Host "🌐 Затем откройте в браузере: http://localhost:3000"
Write-Host ""
Write-Host "📚 Следующие шаги для студентов:"
Write-Host "   - Изучите структуру проекта в README.md и QUICK_START.md"
Write-Host "   - Определите свою уникальную идею проекта"
Write-Host "   - Выберите блокчейн-платформу для реализации:"
Write-Host "     * Ethereum: cd ethereum && npm test && npm run deploy"
Write-Host "     * TON: cd ton && npm test && npm run deploy"
Write-Host "     * Solana: cd solana && anchor test && anchor deploy"
Write-Host "   - Начните модификацию смарт-контрактов под ваши нужды"
Write-Host "   - Настройте фронтенд в nextjs-frontend для работы с вашим контрактом"
Write-Host "   - Протестируйте изменения на локальной сети"
Write-Host "   - Деплой на тестовые сети и проверка функциональности"
Write-Host ""
