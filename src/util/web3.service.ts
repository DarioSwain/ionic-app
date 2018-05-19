import {Injectable} from '@angular/core';
// import * as contract from 'truffle-contract';
import {Subject} from 'rxjs/Rx';
import {Logger} from "../providers/logger/logger";
import Web3 from 'web3';
let meta = require('./../../metaBuild/contracts/MetaCoin.json');

@Injectable()
export class Web3Service {
  public web3: any;
  private accounts: string[];
  public ready = false;
  public MetaCoin: any;
  public accountsObservable = new Subject<string[]>();

  private contractAddress: string = '0x1e6e121f30330d4949595792d9144047c48d1e55';

  private account: string = '0xf1bb5e3b28fafda8a2ec1ac913a6e6a83b7c4112';
  public contract: any;

  constructor(private logger: Logger,) {
      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://10.6.240.84:8545'));

      // setInterval(() => this.refreshAccounts(), 100);
      // this.contract = contract(meta).then((MetaCoinAbstraction) => {
      //     this.MetaCoin = MetaCoinAbstraction;
      // });
      this.contract = new this.web3.eth.Contract(meta.abi, this.contractAddress);
  }

    public async getAccount(): Promise<string> {
        if (this.account == null) {
            this.account = await new Promise((resolve, reject) => {
                this.web3.eth.getAccounts((err, accs) => {
                    if (err != null) {
                        alert('There was an error fetching your accounts.');
                        return;
                    }

                    if (accs.length === 0) {
                        alert(
                            'Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.'
                        );
                        return;
                    }
                    resolve(accs[0]);
                })
            }) as string;

            this.web3.eth.defaultAccount = this.account;
        }

        return Promise.resolve(this.account);
    }

    public balance():Promise<number> {
        return this.contract.methods.getBalance(this.account).call();
    }


    public async getUserBalance(): Promise<number> {
        let account = await this.getAccount();

        return new Promise((resolve, reject) => {
            let _web3 = this.web3;
            this.contract.methods.getBalance(account).call(account, function (err, result) {
                if(err != null) {
                    reject(err);
                }

                resolve(_web3.fromWei(result));
            });
        }) as Promise<number>;
    }

  // public async artifactsToContract(artifacts) {
  //   if (!this.web3) {
  //     const delay = new Promise(resolve => setTimeout(resolve, 100));
  //     await delay;
  //     return await this.artifactsToContract(artifacts);
  //   }
  //
  //   this.logger.error(artifacts);
  //   // const contractAbstraction = contract(artifacts);
  //   // contractAbstraction.setProvider(this.web3.currentProvider);
  //   // return contractAbstraction;
  //
  // }

  // private refreshAccounts() {
  //   this.web3.eth.getAccounts((err, accs) => {
  //     console.log('Refreshing accounts');
  //     if (err != null) {
  //       console.warn('There was an error fetching your accounts.');
  //       return;
  //     }
  //
  //     // Get the initial account balance so it can be displayed.
  //     if (accs.length === 0) {
  //       console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
  //       return;
  //     }
  //
  //     if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
  //       console.log('Observed new accounts');
  //
  //       this.accountsObservable.next(accs);
  //       this.accounts = accs;
  //     }
  //
  //     this.ready = true;
  //   });
  // }
}
