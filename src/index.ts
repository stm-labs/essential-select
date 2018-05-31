import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {EssentialSelectFilterPipe} from './essential-select/essential-select-filter.pipe';
import {EssentialSelectComponent} from './essential-select/essential-select.component';
import {FormsModule} from '@angular/forms';
import {EssentialSelectTruncatePipe} from './essential-select/essential-select-truncate.pipe';
import {DEFAULT_LANGUAGE, EssentialSelectModuleConfig} from './essential-select/essential-select-config';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';

export * from './essential-select/essential-select-filter.pipe';
export * from './essential-select/filters/filter.models';
export * from './essential-select/filters/text-to-show.essential-filter';
export * from './essential-select/essential-select.component';
export * from './essential-select/essential-select.printable';
export * from './essential-select/essential-select.validator';
export * from './essential-select/essential-select-truncate.pipe';
export * from './essential-select/essential-select.settings';
export * from './essential-select/essential-select-config';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BrowserAnimationsModule,
        BrowserModule
    ],
    declarations: [
        EssentialSelectFilterPipe,
        EssentialSelectComponent,
        EssentialSelectTruncatePipe
    ], exports: [
        EssentialSelectComponent
    ],
    providers: [
        {provide: EssentialSelectModuleConfig, useValue: {defaultLanguage: DEFAULT_LANGUAGE} }]
})
export class EssentialSelectModule {

    static forRoot(config: EssentialSelectModuleConfig): ModuleWithProviders {
        return {
            ngModule: EssentialSelectModule,
            providers: [
                {provide: EssentialSelectModuleConfig, useValue: config},
            ]
        };
    }

}
