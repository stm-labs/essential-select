import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {DemoSelectAllComponent} from './demo-select-all/demo-select-all.component';
import {EssentialSelectModule} from 'angular-essential-select';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpModule} from '@angular/http';
import {HttpClientModule} from '@angular/common/http';
import {routes} from './app.router';
import {EsformComponent} from './esform/esform.component';
import {MarkdownModule} from 'ngx-md';
import {BootstrapIntegrationComponent} from './bootstrap-integration/bootstrap-integration.component';
import {HeaderComponent} from './header/header.component';
import {EventBus} from './core/eventbus/event-bus.service';

@NgModule({
  declarations: [
    AppComponent,
    DemoSelectAllComponent,
    EsformComponent,
    BootstrapIntegrationComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    EssentialSelectModule,

    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,

    MarkdownModule.forRoot(),

    routes
  ],
  providers: [
    EventBus
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
