import { Component } from '@angular/core';
import {Events, NavController, Platform} from 'ionic-angular';
import {Web3Service} from "../../../util/web3.service";

@Component({
    selector: 'incoming-data-menu',
    templateUrl: 'incoming-data-menu.html',
    providers: [NavController],
})
export class IncomingDataMenuPage {
  public https: boolean;
  public data: string;
  public type: string;
  public coin: string;
  public showIncomingDataMenu: boolean;
  public showSlideEffect: boolean;

  constructor(
    private events: Events,
    private platform: Platform,
    private w3Service: Web3Service,
    private navCtrl: NavController,
  ) {
    this.https = false;
    this.showIncomingDataMenu = false;
    this.showSlideEffect = false
    this.events.subscribe('showIncomingDataMenuEvent', (data: any) => {
      this.showIncomingDataMenu = true;
      this.data = data.data;
      this.type = data.type;
      this.coin = data.coin;
      if (this.type === 'url') {
        this.https = this.data.indexOf('https://') === 0 ? true : false;
      }

      setTimeout(() => {
        this.showSlideEffect = true;
      }, 50);

      let unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
        unregisterBackButtonAction();
        this.backdropDismiss();
      }, 0);
    });
  }

  public backdropDismiss(): void {
    this.close(null, null);
  }

  public close(redirTo: string, value: string) {
    this.w3Service.addToken(value);
    this.w3Service.applyToken(value);

    if (redirTo == 'AmountPage') {
      let coin = this.coin ? this.coin : 'btc';
      this.events.publish('finishIncomingDataMenuEvent', { redirTo, value, coin });
    } else {
      this.events.publish('finishIncomingDataMenuEvent', { redirTo, value });
    }

    if (redirTo != 'OpenExternalLink') {
      this.showSlideEffect = false;
      setTimeout(() => {
        this.showIncomingDataMenu = false;
      }, 150);
    }
  }

}