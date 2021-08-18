
export const getParsedAirdropObjectForLoopTokens = (airdrop: any) => {
  airdrop = JSON.parse(JSON.stringify(airdrop));
  const lunaDecimals = 6;
  const delegatorCount = airdrop.accounts.length;
  const initialSupply = 4.5*1e6;
  console.log("Delegator count: ", delegatorCount);
  console.log("LOOP airdrop supply for LUNA stakers: ", initialSupply);
  
  const calculate = (totalAmount: number): number => {
    totalAmount = totalAmount / (10 ** lunaDecimals);
    console.log("Parsed amount (LUNA): ", totalAmount);
    const tokenPerLuna = initialSupply / totalAmount;
    console.log("LOOP per LUNA delegated: ", tokenPerLuna);
    console.log("LOOP per 1,000 LUNA delegated: ", tokenPerLuna * 1000);
    return tokenPerLuna;
  };
  
  const maxCap = 10*1e3 * (10 ** lunaDecimals);
  let totalAmount = airdrop.accounts
    .map((x: { amount: string }) => parseInt(x.amount))
    .reduce(
      (a: number, b: number) => a + b,
      0
    );
  let totalAmountCapped = airdrop.accounts
    .map((x: { amount: string }) => parseInt(x.amount) > maxCap ? maxCap : parseInt(x.amount))
    .reduce(
      (a: number, b: number) => a + b,
      0
    );
  
  console.log("====== CALCULATIONS WITHOUT PER-USER CAP  ======");
  calculate(totalAmount);
  console.log("=== CALCULATIONS WITH PER-USER CAP OF 10,000 ===");
  let tokenPerLuna = calculate(totalAmountCapped);

  // Re-write the amounts.
  for (let account of airdrop.accounts) {
    let amount = parseInt(account.amount);
    if (amount > maxCap)
      amount = maxCap;
    amount = amount * tokenPerLuna;
    account.amount = parseInt(amount.toString()).toString();
  }
  
  return airdrop;
};
