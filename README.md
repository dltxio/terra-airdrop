# Airdrop
Fork of [mirror-airdrop](https://github.com/Mirror-Protocol/mirror-airdrop).

## How to use

### Create distribution list
Generate a snapshot from the last block:
`npx ts-node ./src/generateSnapshot.ts <PAGE_LIMIT_NUMBER>`  
To ensure all delegators are loaded for the block, the integer `9007199254740991` may be used for the page limit.  
This will save an `airdrop.json` file in the root directory:  
```json
{
  "merkleRoot": "",
  "merkleProof": "",
  "targetAcc": "",
  "verified": true,
  "accounts": [
    {
      "address": "terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8",
      "amount": "1000000"
    },
    {
      "address": "terra1ucp369yry6n70qq3zaxyt85cnug75r7ln8l6se",
      "amount": "2000000"
    },
    {
      "address": "terra1t849fxw7e8ney35mxemh4h3ayea4zf77dslwna",
      "amount": "3000000"
    },
    ...
  ]
}
```

#### Geting proof with user input
```javascript
import { Airdrop } from "@mirror-protocol/mirror-airdrop";
import { accounts } from "../airdrop.json";

const airdrop = new Airdrop(accounts);
const proof = airdrop.getMerkleProof(accounts[0]);

console.log("Merkle Root", airdrop.getMerkleRoot());
console.log("Merkle Proof", proof);
console.log("Target Acc", accounts[0]);
console.log("Verified", airdrop.verify(proof, accounts[0]));
```

#### Taking snapshot
```javascript
import { Snapshot } from "@mirror-protocol/mirror-airdrop";

const snapshot = new Snapshot("https://lcd.terra.dev");
const pageNumber = 1;
const pageLimit = 10;
snapshot.takeSnapshot(pageNumber, pageLimit).then(delegators => {
  console.log(delegators)
});
```

### Building the airdrop contract
Built with [CosmWasm](https://github.com/CosmWasm/cosmwasm#production-builds).
```
$ docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="devcontract_cache_airdrop",target=/code/contracts/airdrop/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.10.2 ./contracts/airdrop
```
