const crypto = require("crypto");

function hash(...values) {
  return crypto.createHash("sha256").update(values.join(":")).digest("hex");
}

function randomHex() {
  return crypto.randomBytes(16).toString("hex");
}

console.log("=== Демонстрация доказательства с нулевым разглашением (ZKP) ===\n");
console.log("--- Сценарий ---");
console.log("Алиса знает секретное число и хочет доказать это Бобу, не раскрывая само число.\n");

const secret = "42";
const nonce = randomHex();

const commitment = hash(secret, nonce);
console.log("[Шаг 1] Алиса создает коммитмент");
console.log(`  Секрет Алисы: ${secret}`);
console.log(`  Случайный nonce: ${nonce}`);
console.log(`  Коммитмент (hash): ${commitment}`);
console.log("  -> Алиса отправляет коммитмент Бобу\n");

const challenge = randomHex();
console.log("[Шаг 2] Боб отправляет случайный вызов (challenge)");
console.log(`  Challenge: ${challenge}\n`);

const response = hash(secret, nonce, challenge);
console.log("[Шаг 3] Алиса формирует ответ (response)");
console.log("  Response = hash(секрет + nonce + challenge)");
console.log("  -> Алиса отправляет response и nonce Бобу\n");

console.log("[Шаг 4] Боб проверяет доказательство");

const commitCheck = hash(secret, nonce);
const commitValid = commitCheck === commitment;
console.log(
  `  1. Проверяет коммитмент: hash(секрет + nonce) == коммитмент? ${commitValid ? "ДА" : "НЕТ"}`
);

const responseCheck = hash(secret, nonce, challenge);
const responseValid = responseCheck === response;
console.log(
  `  2. Проверяет response: hash(секрет + nonce + challenge) совпадает? ${responseValid ? "ДА" : "НЕТ"}`
);

if (commitValid && responseValid) {
  console.log("  -> Доказательство ВЕРНО: Алиса знает секрет!\n");
}
