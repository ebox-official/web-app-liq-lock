import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TapbarComponent } from './tapbar/tapbar.component';
import { CardArchetypeComponent } from './cards/card-archetype/card-archetype.component';
import { HomeComponent } from './cards/home/home.component';
import { ConnectComponent } from './cards/connect/connect.component';
import { ModalsComponent } from './modals/modals.component';
import { ModalArchetypeComponent } from './modals/modals/modal-archetype/modal-archetype.component';
import { ConfirmComponent } from './modals/modals/confirm/confirm.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { ToasterComponent } from './toaster/toaster.component';
import { ChooseNetworkComponent } from './modals/modals/choose-network/choose-network.component';
import { PolkadotProviderComponent } from './modals/modals/polkadot-provider/polkadot-provider.component';
import { UnsupportedNetworkOverlayComponent } from './unsupported-network-overlay/unsupported-network-overlay.component';
import { FormatMultiplierPipe } from './pipes/format-multiplier.pipe';
import { FormatDatePipe } from './pipes/format-date.pipe';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { WidthAsValueLengthDirective } from './directives/width-as-value-length.directive';
import { PasswordTogglerDirective } from './directives/password-toggler.directive';
import { BsPopDirective } from './directives/bs-pop.directive';
import { BsTipDirective } from './directives/bs-tip.directive';
import { NotFoundComponent } from './cards/not-found/not-found.component';
import { CopyrightComponent } from './copyright/copyright.component';
import { LockListShellComponent } from './cards/lock-list-shell/lock-list-shell.component';
import { LockListComponent } from './cards/lock-list-shell/lock-list/lock-list.component';
import { ConnectionInformationComponent } from './connection-information/connection-information.component';
import { LockListItemComponent } from './cards/lock-list-shell/lock-list-item/lock-list-item.component';
import { LockComponent } from './cards/lock-list-shell/lock/lock.component';
import { CreateLockComponent } from './cards/create-lock/create-lock.component';
import { EditLockComponent } from './cards/edit-lock/edit-lock.component';
import { WithdrawLockComponent } from './cards/withdraw-lock/withdraw-lock.component';
import { PleaseConnectComponent } from './cards/please-connect/please-connect.component';
import { WeiToDecimalPipe } from './pipes/wei-to-decimal.pipe';
import { DecimalToWeiPipe } from './pipes/decimal-to-wei.pipe';
import { ScannerLinkComponent } from './scanner-link/scanner-link.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    TapbarComponent,
    CardArchetypeComponent,
    HomeComponent,
    ConnectComponent,
    ModalsComponent,
    ModalArchetypeComponent,
    ConfirmComponent,
    LoadingIndicatorComponent,
    ToasterComponent,
    ChooseNetworkComponent,
    PolkadotProviderComponent,
    UnsupportedNetworkOverlayComponent,
    FormatMultiplierPipe,
    FormatDatePipe,
    EllipsisPipe,
    WidthAsValueLengthDirective,
    PasswordTogglerDirective,
    BsPopDirective,
    BsTipDirective,
    NotFoundComponent,
    CopyrightComponent,
    LockListShellComponent,
    LockListComponent,
    ConnectionInformationComponent,
    LockListItemComponent,
    LockComponent,
    CreateLockComponent,
    EditLockComponent,
    WithdrawLockComponent,
    PleaseConnectComponent,
    WeiToDecimalPipe,
    DecimalToWeiPipe,
    ScannerLinkComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
