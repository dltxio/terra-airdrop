import { Airdrop, Snapshot } from "./index";
import path from "path";
import fs from "fs";
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
  accounts: {
    address: string,
    amount: string
  }[],
};

console.log(`Generating airdrop for latest block...`);
const snapshot = new Snapshot("https://lcd.terra.dev");
snapshot.takeSnapshot(1, Number.MAX_SAFE_INTEGER).then(result => {
  console.log(result)
  const delegators = Object.keys(result.snapshot);
  const airdropObject: AirDropObject = {
    merkleRoot: "",
    merkleProof: [],
    targetAcc: { address: "", amount: "" },
    verified: false,
    addressCount: 0,
    accounts: [],
  };
  
  for (let delegator of delegators) {
    airdropObject.accounts.push({
      address: delegator,
      amount: result.snapshot[delegator].toString()
    });
  }

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