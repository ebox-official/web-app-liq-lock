import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
import { LockListComponent } from './cards/lock-list/lock-list.component';
import { LockListPersonalComponent } from './cards/lock-list-personal/lock-list-personal.component';
import { LockListGeneralComponent } from './cards/lock-list-general/lock-list-general.component';
import { ConnectionInformationComponent } from './connection-information/connection-information.component';

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
    LockListComponent,
    LockListPersonalComponent,
    LockListGeneralComponent,
    ConnectionInformationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
