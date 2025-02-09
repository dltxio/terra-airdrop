import { Airdrop, Snapshot } from "./index";
import path from "path";
import fs from "fs";
import { getParsedAirdropObjectForLoopTokens } from "./getLoopAmounts";
const airdropFilePath = path.resolve(__dirname, "../airdrop.json");

type AirDropObject = {
  merkleRoot: string,
  merkleProof: string[],
  targetAcc: {
    address: string,
    amount: string,
  },
  verified: boolean,
  addressCount: number,
  block: number,
  accounts: {
    address: string,
    amount: string
  }[],
};

const pageLimit = parseInt(process.argv
  .find(x => !isNaN(parseInt(x)))?.toString() || "1"
);

console.log(`Generating airdrop for latest block with a page limit of ${pageLimit}...`);
const snapshot = new Snapshot("https://lcd.terra.dev");
snapshot.takeSnapshot(1, pageLimit).then(result => {
  console.log(result)
  const delegators = Object.keys(result.snapshot);
  let airdropObject: AirDropObject = {
    merkleRoot: "",
    merkleProof: [],
    targetAcc: { address: "", amount: "" },
    verified: false,
    addressCount: 0,
    block: result.block,
    accounts: [],
  };

  for (let delegator of delegators) {
    airdropObject.accounts.push({
      address: delegator,
      amount: result.snapshot[delegator].toString()
    });
  }
  
  // Cap amounts.
  airdropObject = getParsedAirdropObjectForLoopTokens(airdropObject);

  const airdrop = new Airdrop(airdropObject.accounts);
  const proof = airdrop.getMerkleProof(airdropObject.accounts[0]);

  airdropObject.merkleRoot = airdrop.getMerkleRoot();
  airdropObject.merkleProof = proof;
  airdropObject.targetAcc = airdropObject.accounts[0]; 
  airdropObject.verified = airdrop.verify(proof, airdropObject.accounts[0]);
  airdropObject.addressCount = airdropObject.accounts.length;
  
  console.log("Merkle Root", airdropObject.merkleRoot);
  console.log("Merkle Proof", airdropObject.merkleProof);
  console.log("Target Acc", airdropObject.targetAcc);
  console.log("Verified", airdropObject.verified);
  console.log("Address count", airdropObject.addressCount);
  
  fs.writeFileSync(airdropFilePath, JSON.stringify(
    airdropObject,
    null,
    4
  ), "utf-8");

  console.log(`Airdrop data written to ${airdropFilePath}`);
});