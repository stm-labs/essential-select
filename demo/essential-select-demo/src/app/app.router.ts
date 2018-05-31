/**
 * @author Nikita Bakaev
 */
import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DemoSelectAllComponent} from './demo-select-all/demo-select-all.component';
import {EsformComponent} from './esform/esform.component';

export const router: Routes = [
  {path: '', redirectTo: 'demo_all', pathMatch: 'full'},
  {path: 'demo_all', component: DemoSelectAllComponent},
  {path: 'form', component: EsformComponent}
];

export const routes: ModuleWithProviders = RouterModule.forRoot(router, {useHash: true});
