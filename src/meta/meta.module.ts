import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
// import {MetaSenderComponent} from './meta-sender/meta-sender.component';
import {UtilModule} from '../util/util.module';

@NgModule({
  imports: [
    CommonModule,
    UtilModule
  ],
  // declarations: [MetaSenderComponent],
  // exports: [MetaSenderComponent]
})
export class MetaModule {
}
