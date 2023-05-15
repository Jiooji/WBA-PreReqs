import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import wallet from "../dev-wallet.json";
import myMint from "../mint.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const commitment: Commitment = "max";
const connection = new Connection("https://api.devnet.solana.com/", commitment);

const mint = new PublicKey(myMint);

const to = new PublicKey(wallet);

(async () => {
  try {
    const from_ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    const to_ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to
    );
    const txhash = transfer(
      connection,
      keypair,
      from_ata.address,
      to_ata.address,
      keypair.publicKey,
      1000
    );
    console.log(
      "Success! Check ouy your TX here:\nhttps://explorer.solana.com/tx/${txhash}?cluster=devnet"
    );
  } catch (e) {
    console.error("Oops, something went wrong: ${e}");
  }
})();
