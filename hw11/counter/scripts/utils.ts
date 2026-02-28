import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import { Counter } from '../target/types/counter';

export function loadWallet(): Keypair {
  const walletPath = path.join(__dirname, '..', 'wallet.json');

  if (!fs.existsSync(walletPath)) {
    throw new Error(`Wallet файл не найден: ${walletPath}\n`);
  }

  const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

export async function getProgram(wallet: Keypair): Promise<Program<Counter>> {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: 'confirmed' }
  );

  anchor.setProvider(provider);

  const idlPath = path.join(__dirname, '..', 'target', 'idl', 'counter.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));

  const programId = new PublicKey(idl.address);
  const program = new Program(idl, provider) as Program<Counter>;

  return program;
}

export async function getCounterPDA(
  programId: PublicKey,
  authority: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('counter'), authority.toBuffer()],
    programId
  );
}

export async function getCounterData(program: Program<Counter>, counterPDA: PublicKey) {
  try {
    const counter = await program.account.counter.fetch(counterPDA);
    return counter;
  } catch (error) {
    return null;
  }
}
