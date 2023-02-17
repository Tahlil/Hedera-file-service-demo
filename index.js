import {
    Wallet,
    LocalProvider,
    FileCreateTransaction,
    FileAppendTransaction,
    FileContentsQuery,
    Hbar,
} from "@hashgraph/sdk";
import { readFile, writeFile } from 'fs/promises';

import dotenv from "dotenv";

dotenv.config();

const bigContents = `Lor`;

async function main() {
    if (process.env.OPERATOR_ID == null || process.env.OPERATOR_KEY == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }
    const imageContent = await readFile('./1kb.png');



    console.log("Init length: " + imageContent.length);
    console.log(imageContent);
    const wallet = new Wallet(
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY,
        new LocalProvider()
    );

    let transaction = await new FileCreateTransaction()
        .setKeys([wallet.getAccountKey()])
        .setContents(imageContent)
        .setMaxTransactionFee(new Hbar(5))
        .freezeWithSigner(wallet);
    transaction = await transaction.signWithSigner(wallet);
    const resp = await transaction.executeWithSigner(wallet);
    
    const receipt = await resp.getReceiptWithSigner(wallet);
    const fileId = receipt.fileId;

    console.log(`file ID = ${fileId.toString()}`);

    

    const contents = await new FileContentsQuery()
        .setFileId(fileId)
        .executeWithSigner(wallet);

    console.log(contents);
    console.log(
        `File content length according to \`FileInfoQuery\`: ${contents.length}`
    );
    await writeFile('recreated.png', contents);
   
}

void main();