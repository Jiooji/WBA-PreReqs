import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
  BN,
} from "@project-serum/anchor";
import { WbaVault, IDL } from "../programs/wba_vault";
import wallet from "../dev-wallet.json";
import myVaultState from "../vault_state.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const vaultState = new PublicKey(myVaultState);

const connection = new Connection("https://api.devnet.solana.com");

const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment: "confirmed",
});

const program = new Program<WbaVault>(
  IDL,
  "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address,
  provider
);

const vaultAuth_seeds = [Buffer.from("auth"), vaultState.toBuffer()];
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
      .withdraw(new BN(0.1 * LAMPORTS_PER_SOL))
      .accounts({
        owner: keypair.publicKey,
        vaultState: vaultState,
        vaultAuth,
        vault,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
      .rpc();
    console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
