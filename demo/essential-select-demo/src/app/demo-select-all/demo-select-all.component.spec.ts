import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DemoSelectAllComponent} from './demo-select-all.component';
import {EssentialSelectModule, EssentialSelectComponent} from 'angular-essential-select';
import {CommonModule} from '@angular/common';
import {BrowserModule, By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {EventBus} from '../core/eventbus/event-bus.service';

describe('Essential-select examples', () => {
  let component: DemoSelectAllComponent;
  let fixture: ComponentFixture<DemoSelectAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DemoSelectAllComponent
      ],
      imports: [
        EssentialSelectModule,
        BrowserModule,
        EssentialSelectModule,

        CommonModule,
        FormsModule,
        BrowserAnimationsModule
      ],
      providers: [EventBus]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoSelectAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create all essential-select', () => {
    expect(component).toBeTruthy();
  });

  describe('Simple', () => {

    it('Verify ngModel', () => {
      const de = fixture.debugElement.query(By.css('#simpleTextModel'));
      const el2 = de.nativeElement;

      fixture.detectChanges();
      expect(el2.textContent).toBe('herp derp');
    });

    it('Verify placeholder', () => {
      const de = fixture.debugElement.query(By.css('#simpleSelectComponent > div > div:nth-child(1) > form > fieldset > div'));
      const el2 = de.nativeElement;

      fixture.detectChanges();
      expect(el2.innerText).toBe('herp derp');
    });

    // expect simpleSelectComponent to be closed dropdown
    const assertSimpleDropdownClosed = function (selectComponent: EssentialSelectComponent) {
      const wrapperClosed = fixture.debugElement.query(By.css('#simpleSelectComponent > div > div.wrapper > div'));
      expect(wrapperClosed).toBeFalsy(true);
      expect(selectComponent._isOpen).toBe(false);
    };

    it('Open and close dropdown', () => {
      const fieldset = fixture.debugElement.query(By.css('#simpleSelectComponent > div > div:nth-child(1) > form > fieldset > div')).nativeElement;
      const selectComponent = fixture.componentInstance.simpleSelectComponent;

      assertSimpleDropdownClosed(selectComponent);
      fieldset.click();

      fixture.detectChanges();
      expect(selectComponent._isOpen).toBe(true);

      const wrapperOpen = fixture.debugElement.query(By.css('#simpleSelectComponent > div > div.wrapper > div'));
      expect(wrapperOpen).toBeTruthy(true);
      expect(wrapperOpen.nativeElement).toBeTruthy(true);

      const model = fixture.debugElement.query(By.css('#simpleTextModel')).nativeElement;

      // click some element outside dropdown
      model.click();
      fixture.detectChanges();

      assertSimpleDropdownClosed(selectComponent);
    });

    it('Check change detection outside', () => {
      const de = fixture.debugElement.query(By.css('#simpleTextModel'));
      const el2 = de.nativeElement;

      fixture.detectChanges();
      expect(el2.textContent).toBe('herp derp');

      component.simpleSelect = component.selectOptions2[2];
      fixture.detectChanges();
      expect(el2.textContent).toBe(component.selectOptions2[2]);

    });
  });

  describe('Mulltiselect id in object with search', () => {
    it('Verify model', () => {
      const de = fixture.debugElement.query(By.css('#multiselectSearchInputBind'));
      const el2 = de.nativeElement;

      fixture.detectChanges();
      expect(el2.innerText).toBe('[ "US", "RU" ]');
    });

    it('Verify model unselectAll to be zero length array', () => {
      const selectComponent = fixture.componentInstance.multiselectSearchInputSelect;
      expect(selectComponent.value).toEqual(['US', 'RU']);

      selectComponent.deselectAll();
      fixture.detectChanges();

      expect(selectComponent.value).toEqual([]);
      expect(selectComponent._internalValue).toEqual([]);
    });
  });


  describe('Mulltiselect outside changes', () => {

    it('Verify multiselect search outside array changes', () => {
      const selectComponent = fixture.componentInstance.multiselectSearchInputSelect;
      expect(selectComponent.value).toEqual(['US', 'RU']);

      const selectedCountries = ['US', 'RU', 'NO'];
      fixture.componentInstance.setCoutry(selectedCountries);
      selectComponent.ngDoCheck();
      fixture.detectChanges();
      expect(selectComponent.value).toEqual(selectedCountries);

      const y = [
        {code: 'US', name: 'United States (USA)', language: 'en-US'},
        {code: 'RU', name: 'Russian Federation (RU)'},
        {code: 'NO', name: 'Norway'}];

      expect(selectComponent._internalValue).toEqual(y);
    });
  });


});
