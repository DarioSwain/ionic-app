import {Injectable} from '@angular/core';
// import * as contract from 'truffle-contract';
import {Subject} from 'rxjs/Rx';
import {Logger} from "../providers/logger/logger";
import Web3 from 'web3';
import {PersistenceProvider} from "../providers/persistence/persistence";
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

  constructor(private logger: Logger,private storage: PersistenceProvider) {
      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://10.6.240.84:8545'));

      // setInterval(() => this.refreshAccounts(), 100);
      // this.contract = contract(meta).then((MetaCoinAbstraction) => {
      //     this.MetaCoin = MetaCoinAbstraction;
      // });
      this.contract = new this.web3.eth.Contract(meta.abi, this.contractAddress, {gas: '3000000', from: this.account});
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

    public addToken(token: string) {
        return this.contract.methods.addToken(token)
            .send({from: this.account}, function(error, transactionHash){ console.log('ADD TOKEN TRANSACTION HASH' + transactionHash); });
    }

    public applyToken(token: string):Promise<number> {
      //TODO: Fraud problem, should be stored only on success.
        this.storage.saveToken(token);
        return this.contract.methods.applyToken(token)
            .send({from: this.account}, function(error, transactionHash) {
                console.log('APPLY TOKEN TRANSACTION HASH' + transactionHash);
            });
    }

    public generateCreature() {
      //TODO: Very first step. On the account generate. Account should be returned by the Accounts API.
        return this.contract.methods.generateCreature()
            .send({from: this.account}, function(error, transactionHash){ console.log('GENERATE CREATURE TRANSACTION HASH' + transactionHash); });
    }


    public getCreature():Promise<any> {
        return this.contract.methods.getCreature(this.account).call();
    }

    public reGenerateCreature(token: string):Promise<any> {
        return this.contract.methods.reGenerateCreature(token)
            .send({from: this.account}, function(error, transactionHash){ console.log('GENERATE CREATURE TRANSACTION HASH' + transactionHash); });
    }
}
