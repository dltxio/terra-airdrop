import * as request from "request-promise";

export type DelegationSnapshot = {
  [delegator: string]: bigint
};

export type SnapshotResponse = {
  block: number;
  snapshot: DelegationSnapshot
};

class Snapshot {
  URL: string;

  constructor(URL: string) {
    this.URL = URL;
  }

  /**
   * Takes a snapshot of the current block given a page number and limit.
   */
  async takeSnapshot(pageNumber: number, pageLimit: number): Promise<SnapshotResponse> {
    const delegationSnapshot: DelegationSnapshot = {};
    const response = JSON.parse(
      await request.get(`${this.URL}/staking/validators?page=${pageNumber}&limit=${pageLimit}`, {
        timeout: 10000000
      })
    );
    const block = response.height;
    const validators = response.result;

    for (let i = 0; i < validators.length; i++) {
      const operator_addr = validators[i]["operator_address"];
      const delegators: Array<{
        delegator_address: string;
        validator_address: string;
        shares: string;
        balance: {
          denom: string;
          amount: string;
        };
      }> = JSON.parse(
        await request.get(
          `${this.URL}/staking/validators/${operator_addr}/delegations`
        )
      )["result"];

      delegators.forEach((delegation) => {
        if (delegationSnapshot[delegation.delegator_address] === undefined) {
          delegationSnapshot[delegation.delegator_address] = BigInt(0);
        }

        delegationSnapshot[delegation.delegator_address] += BigInt(
          delegation.balance.amount
        );
      });
    }

    return {
      block,
      snapshot: delegationSnapshot,
    };
  }
}

export default Snapshot;
