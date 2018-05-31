import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EsformComponent } from './esform.component';
import {EssentialSelectModule} from 'angular-essential-select';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';

describe('EsformComponent', () => {
  let component: EsformComponent;
  let fixture: ComponentFixture<EsformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EsformComponent
      ],
      imports: [
        EssentialSelectModule,
        BrowserModule,
        EssentialSelectModule,

        CommonModule,
        FormsModule,
        BrowserAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EsformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
