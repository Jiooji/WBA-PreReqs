import {
  Commitment,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import wallet from "../dev-wallet.json";
import myMint from "../mint.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const mint = new PublicKey(myMint);

const token_metadata_program_id = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const metadata_seeds = [
  Buffer.from("metadata"),
  token_metadata_program_id.toBuffer(),
  mint.toBuffer(),
  //Buffer.from('edition')
];
const [metadata_pda, _bump] = PublicKey.findProgramAddressSync(
  metadata_seeds,
  token_metadata_program_id
);

(async () => {
  try {
    let tx = new Transaction().add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadata_pda,
          mint: mint,
          mintAuthority: keypair.publicKey,
          payer: keypair.publicKey,
          updateAuthority: keypair.publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: "Something cool",
              symbol: "COOL",
              uri: "https://arweave.net/1234",
              sellerFeeBasisPoints: 100,
              creators: [
                { address: keypair.publicKey, verified: true, share: 100 },
              ],
              collection: null,
              uses: null,
            },
            isMutable: true,
            collectionDetails: null,
          },
        }
      )
    );

    //sign the tx
    let txhash = await sendAndConfirmTransaction(connection, tx, [keypair]);
    console.log(txhash);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
