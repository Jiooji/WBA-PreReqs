import { Connection, Keypair, SystemProgram, PublicKey } from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
} from "@project-serum/anchor";
import { WbaVault, IDL } from "../programs/wba_vault";
import wallet from "../dev-wallet.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const vaultState = Keypair.generate();
console.log("Vault state: ", vaultState.publicKey.toBase58());

const connection = new Connection("https://api.devnet.solana.com");

const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment: "confirmed",
});

const program = new Program<WbaVault>(
  IDL,
  "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address,
  provider
);

const vaultAuth_seeds = [Buffer.from("auth"), vaultState.publicKey.toBuffer()];
const vaultAuth = PublicKey.findProgramAddressSync(
  vaultAuth_seeds,
  program.programId
)[0];

const vault_seeds = [Buffer.from("vault"), vaultAuth.toBuffer()];
const vault = PublicKey.findProgramAddressSync(
  vault_seeds,
  program.programId
)[0];

(async () => {
  try {
    const txhash = await program.methods
      .initialize()
      .accounts({
        owner: keypair.publicKey,
        vaultState: vaultState.publicKey,
        vaultAuth,
        vault,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair, vaultState])
      .rpc();
    console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
