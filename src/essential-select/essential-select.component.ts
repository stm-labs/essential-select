import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgForm} from '@angular/forms';
import {ValidateEssentialSelectFn} from './essential-select.validator';
import {EssentialSelectOptions, EssentialSelectRowOptions} from './essential-select.printable';
import {ObjectUtils} from '../util/object.utils';
import {StringUtils} from '../util/string.utils';
import {EssentialsSelectFilter} from './filters/filter.models';
import {TextToShowEssentialFilter} from './filters/text-to-show.essential-filter';
import {WrapperContent} from './essential-select.settings';
import {NumberUtils} from '../util/number.utils';
import {ALL_SELECT_LANGUAGES, SelectLang} from './i18n/all-languages';
import {DEFAULT_LANGUAGE, EssentialSelectModuleConfig} from './essential-select-config';
import {of} from 'rxjs';
import {delay, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {
    trigger,
    state,
    style,
    animate,
    transition
} from '@angular/animations';

const DEFAULT_MAXIMUM_NUMBER_OPTIONS_TO_DISPLAY = 500;
const DEFAULT_MULTISELECT_MAXIMUM_INLINED = 100;
const DELAY_UNTIL_UPDATE_FILTER = 100; // miliseconds

// TODO: use Symbol
// internal string to determine of something was initialised in input value
const MAGIC_EMPTY_STRING = 'SOME_MAGIC_STRING_FOR_ESSENTIAL_SELECT';

@Component({
    selector: 'essential-select',
    templateUrl: './essential-select.component.html',
    styleUrls: ['./essential-select.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => EssentialSelectComponent),
        multi: true
    }, {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => EssentialSelectComponent),
        multi: true,
    }],
    animations: [
        trigger('openState', [
            state('true', style({
                transform: 'rotate(0deg)',
            })),
            state('false', style({
                transform: 'rotate(180deg)',
            })),
            transition('false => true', animate('100ms ease-in')),
            transition('true => false', animate('100ms ease-out'))
        ])
    ]
})
export class EssentialSelectComponent implements DoCheck, OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {

    /**
     * analogue of [(ngModel)]; selected value of
     */
    @Input() value: any;

    /**
     * subscribe to value changes
     * @type {EventEmitter<any>}
     */
    @Output() valueChange = new EventEmitter<any>();

    /**
     * array of possible options that user can select
     */
    @Input() options: any[];

    /**
     * limit to show options in list
     * @type {number}
     */
    @Input() optionsDisplayLimit: number = DEFAULT_MAXIMUM_NUMBER_OPTIONS_TO_DISPLAY;

    /**
     *  If you pass some complex objects (not number/string) - you must pass ID of property that every "options" object contains
     */
    @Input() fieldValue: string;

    /**
     * Name of property to show in "options" object
     */
    @Input() fieldName: string;

    /**
     * false - if we want "value" to contain only some ID instead of all object from global; true if we want to store the whole object
     * @type {boolean}
     */
    @Input() bindObject = false;

    /**
     * Is it a required field for validation
     * @type {boolean}
     */
    @Input() required = false;

    /**
     * Enable auto-complete option
     * @type {boolean}
     */
    @Input() searchable = false;
    @Input() searchableType = 'text';

    /**
     * Handle wen user search something; only valid if you have searchable=true
     * @type {EventEmitter<string>}
     */
    @Output() searchChange = new EventEmitter<string>();

    /**
     * Optional. Message when component is invalid
     */
    @Input() invalidText: string;

    @Input() selectAllText: string;

    @Input() deselectAllText: string;

    @Input() notSelectedText: string;

    @Input() placeholder: string;

    /**
     * Hide 'Not selected' option (equals to null)
     */
    @Input() disableUnselected: boolean;

    /**
     * Custom validation function
     */
    @Input() validator: ValidateEssentialSelectFn;

    /**
     * Main object for dynamically customization print and select behaviour of select
     */
    @Input() settings: EssentialSelectOptions<any>;

    /**
     * Customize behaviour of filtering options. By default use TextToShowEssentialFilter.
     * @type {TextToShowEssentialFilter}
     */
    @Input() essentialsSelectFilter: EssentialsSelectFilter = new TextToShowEssentialFilter();

    /**
     * Is multiselect mode
     */
    @Input() multiselect: boolean;

    /**
     * Maximum elements to inline in input
     * @type {number}
     */
    @Input() multiselectMaximumInlinedElements = DEFAULT_MULTISELECT_MAXIMUM_INLINED;

    /**
     * Is select disabled
     */
    @Input() disabled: boolean;

    /**
     * Control dropdown strategy
     * @type {WrapperContent.MATCH_FORM}
     */
    @Input() wrapType: WrapperContent = WrapperContent.MATCH_FORM;

    @Input() wrapperClasses: string[] = [];

    /**
     * angular forms automatically change null/undefined string to empty ""
     * that's a workaround. If you need empty string as a value - disable that
     * @type {boolean}
     */
    @Input() treatEmptyStringAsNull = true;

    @Input() designMaterial = false;

    private prevValueOutside: any = MAGIC_EMPTY_STRING;
    private ourChange = false;

    private onresizeSubscriber: any;

    // number of times user selected some value
    private _userSelectedTimes = 0;

    // limits number of characters of placeholder length
    private _limit: number;
    private __internalValue: any = null;

    @ViewChild('container') private container: ElementRef;
    @ViewChild('containerLength') private containerLength: ElementRef;
    @ViewChild('contentLengthInner') private contentLengthInner: ElementRef;
    @ViewChild('inputSelectPlaceholder') private inputSelectPlaceholder: ElementRef;
    @ViewChild('selectForm') private ngForm: NgForm;
    @ViewChild('notSearchContaner') private notSearchContainer: ElementRef;

    _userHasInputTextToSearchBeforeSelect = false;

    _isValidated = false;

    _showOpenCloseIcon = true;

    // trigger to redraw pipe input
    _pipeNumber = 0;

    _isOpen = false;

    // content of _searchBoxValue field (searchable === true)
    _searchBoxValue = undefined;

    private _manualChangeDetection = false;

    /**
     * Integration API - get current number availbale letters in placeholder
     * @return {number}
     */
    get limit(): number {
        return this._limit;
    }

    /**
     * Integration API - manual change detection. Do not change outside
     * @param {boolean} value
     */
    set manualChangeDetection(value: boolean) {
        this._manualChangeDetection = value;
    }

    /**
     * Integration API
     * @return {boolean} true if manual change detection is enabled
     */
    get manualChangeDetection(): boolean {
        return this._manualChangeDetection;
    }

    /**
     * Integration API - get underlying ES object
     * @returns {any}
     */
    get _internalValue(): any {
        return this.__internalValue;
    }

    /**
     *
     * @returns {boolean} true if user selected some value after components initialized
     */
    isDirty(): boolean {
        return !NumberUtils.isPositive(this._userSelectedTimes);
    }

    // ngForms integration
    propagateChange = (_: any) => {
    };

    private onTouched = () => {
        this._isValidated = true;
    };

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    writeValue(obj: any): void {
        this.select(obj);
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    public validate(c: FormControl) {

        if (this.valid()) {
            return null;
        }

        return false;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = true;
    }

    // end ngForms

    constructor(private _changeDetectionRef: ChangeDetectorRef, private ngZone: NgZone, private essentialSelectModuleConfig: EssentialSelectModuleConfig) {
    }

    /**
     *
     * @returns {ElementRef} html container of element
     */
    public getElementRef(): ElementRef {
        return this.container;
    }

    setOpen(newState: boolean) {

        if (newState === true) {
            this._showOpenCloseIcon = false;
            if (this.multiselect && !this._isOpen) {
                this._searchBoxValue = undefined;
            }

        } else {
            this._showOpenCloseIcon = true;
        }
        this._isOpen = newState;
    }

    // TODO: optimize performance
    _getDropdownWidth(): string {
        if (this.wrapType === WrapperContent.MATCH_FORM && this.searchable) {
            let offsetWidth = this.inputSelectPlaceholder.nativeElement.clientWidth;
            return `${offsetWidth}px`;
        }
        if (this.wrapType === WrapperContent.MATCH_FORM && !this.searchable) {
            let offsetWidth = this.notSearchContainer.nativeElement.clientWidth;
            return `${offsetWidth}px`;
        }

        if (this.wrapType === WrapperContent.AUTO) {
            return 'auto';
        }
        if (this.wrapType === WrapperContent.MAX_CONTENT) {
            return 'max-content';
        }

        return '';
    }

    changeOpen() {
        this.onTouched();
        this._isValidated = true;

        if (this.disabled) {
            return;
        }
        this.setOpen(!this._isOpen);
    }

    _isOpenEditable(): boolean {
        return this._isOpen && !this.disabled;
    }

    _isOpenEditableState(): string {
        return this._isOpenEditable() ? 'true' : 'false';
    }

    _onSearchInputChange($event) {

        this._searchBoxValue = $event;
        if (this._userHasInputTextToSearchBeforeSelect) {
            if (!StringUtils.isEmpty(this._searchBoxValue)) {
                this.setOpen(true);
            }
        }
        this._userHasInputTextToSearchBeforeSelect = true;
    }

    /**
     *
     * @return {boolean} true of current ES is successfully validated
     */
    valid(): boolean {
        let isValid = true;

        if (this.validator) {
            isValid = this.validator(this.value);
        } else if (this.required) {

            if (this.multiselect) {
                this.safeAccessInternalValue();
                if ((this.__internalValue as Array<any>).length === 0) {
                    isValid = false;
                }
            } else {

                if (this.treatEmptyStringAsNull) {
                    isValid = (this.value !== undefined && this.value !== null) && !(typeof this.value === 'string' && StringUtils.isEmpty(this.value));
                } else {
                    isValid = this.value !== undefined && this.value !== null;
                }
            }

        }
        return isValid;
    }

    markTouched() {
        this._isValidated = true;
    }

    /**
     *
     * @returns {boolean} true of form was validated or user touched it
     */
    isTouched() {
        return this._isValidated;
    }

    private getLang(): string {
        if (!StringUtils.isEmpty(this.essentialSelectModuleConfig.forcedDefaultLanguage)) {
            return this.essentialSelectModuleConfig.forcedDefaultLanguage;
        }

        if (window) {
            return window.navigator.language;
        } else {
            return this.essentialSelectModuleConfig.defaultLanguage;
        }
    }

    private getLangTransSelectLang(): SelectLang {
        let find = ALL_SELECT_LANGUAGES.find(x => x.id === this.getLang());
        if (!find) {
            console.info(`Can not find ${this.getLang()} lang. Fallback to default ${DEFAULT_LANGUAGE}`);
            return ALL_SELECT_LANGUAGES.find(x => x.id === DEFAULT_LANGUAGE);
        } else {
            return find;
        }
    }

    ngOnInit() {
        let lang = this.getLangTransSelectLang();

        if (StringUtils.isEmpty(this.invalidText)) {
            this.invalidText = lang.invalidText;
        }

        if (StringUtils.isEmpty(this.notSelectedText)) {
            this.notSelectedText = lang.notSelectedText;
        }

        if (StringUtils.isEmpty(this.deselectAllText)) {
            this.deselectAllText = lang.unselectAllText;
        }

        if (StringUtils.isEmpty(this.selectAllText)) {
            this.selectAllText = lang.selectAllText;
        }

    }

    /**
     * Multiselect only; Select all elements
     */
    selectAll() {
        this.safeAccessInternalValue();

        const selectedValue = (this.options as Array<any>).filter(x => !this.isSelected(x));
        for (const value of selectedValue) {
            // TODO: allow to customize when "break" (does not allowed to select some value)
            if (!this.selectOption(value)) {
                break;
            }
        }
        this.setOpen(false);
    }

    /**
     * only for multiselect. Deselect all selected values
     */
    deselectAll() {
        // that is for multiselect only. So value is array
        this.safeAccessInternalValue();
        this.__internalValue.length = 0;
        this.handleNewInternalMultibindingValue();
        this.setOpen(false);
    }

    ngAfterViewInit() {
        if (!this.searchable) {
            return;
        }
        this.ngForm.valueChanges.pipe(
            debounceTime(DELAY_UNTIL_UPDATE_FILTER),
            distinctUntilChanged())
            .subscribe(x => this.searchChange.emit(x.input));

        this.checkAndUpdateSearchInput();
        this.setOpen(false);

        this.ngZone.runOutsideAngular(() => {
            this.onresizeSubscriber = window.addEventListener('resize', () => {
                this.checkAndUpdateSearchInput();
            });
        });

    }

    // helper
    private haveFieldValue(): boolean {
        return !!(this.value && this.fieldValue);
    }

    // helper
    private getSimpleTextPrintable(item: any): string {
        if (StringUtils.isString(item)) {
            return item;
        }

        if (item instanceof EssentialSelectRowOptions) {
            return item.text;
        }

        return undefined;
    }

    public haveNotValue(value: any): boolean {
        if (!value) {
            return true;
        } else {
            if (ObjectUtils.isArray(value)) {
                if (value.length === 0) {
                    return true;
                }
            }
        }
        return false;
    }

    public _enabledRowClasses() {

        if (this.settings && this.options && this.options.length > 0) {
            const val = this.settings.printValue(this.options[0]);
            if (val instanceof EssentialSelectRowOptions) {
                return true;
            }
        }

        return false;
    }

    public _printRowClasses(item: any): string {
        return (this.settings.printValue(item) as EssentialSelectRowOptions).rowClasses.join(' ');
    }

    /**
     * Get css classes for option row (ul > li element)
     * @param item
     * @return {string}
     */
    _getCssClasses(item: any) {
        // TODO: optimize
        if (!this._enabledRowClasses()) {
            return '';
        }
        return (this.settings.printValue(item) as EssentialSelectRowOptions).entireRowClasses.join(' ');
    }

    ngDoCheck(): void {
        if (this._manualChangeDetection) {
            return;
        }

        this._doOutsideChangeCheck();
    }

    /**
     * Integration API - manually do change detection from outside
     * We need to check to first bind object or detect changes with was done outside the component
     */
    public _doOutsideChangeCheck() {
        // handle when value is changed outside the component
        let haveChangedOutside = false;
        if (!ObjectUtils.objectEquals(this.prevValueOutside, this.value)) {

            if (this.ourChange) {
                this.prevValueOutside = ObjectUtils.deepCopy(this.value);
            } else {
                haveChangedOutside = true;
            }
        }

        this.ourChange = false;

        if (haveChangedOutside && this.options instanceof Array) {

            if (!this.multiselect) {
                // if null/undefined is selected outside the component or it is initial value
                if (this.value == null) {
                    this.select(null);
                    return this.doFinalOutsideChanges();
                }

                if (this.haveFieldValue()) {
                    let selectedValue = null;

                    // if he have input/output complex object - find it by id from this.option
                    if (this.bindObject) {
                        selectedValue = this.options.find(x => x[this.fieldValue] === this.value[this.fieldValue]);
                    } else {
                        // if we have simple object - just find it from this.options
                        selectedValue = this.options.find(x => x[this.fieldValue] === this.value);
                    }
                    this.select(selectedValue == null ? null : selectedValue);
                    this.doFinalOutsideChanges();
                    return;
                } else {
                    let selectedValue: any;
                    selectedValue = this.options.find(x => x === this.value);
                    this.select(selectedValue == null ? null : selectedValue);
                    return this.doFinalOutsideChanges();
                }
            }

            // TODO: check other cases
            if (this.multiselect && this.value instanceof Array) {

                // если у нас входной/выходной value сложный объект - нужно найти его из this.options так же по ID
                const initialValueCopy = ObjectUtils.deepCopy(this.value);
                this.value.length = 0;
                this.safeAccessInternalValue();
                this.__internalValue.length = 0;

                if (!this.haveFieldValue()) {
                    (initialValueCopy as Array<any>).forEach(x => {
                        this.select(x);
                    });
                } else {
                    (initialValueCopy as Array<any>).forEach(y => {
                        if (this.bindObject) {
                            const selectedValue = this.options.find(x => x[this.fieldValue] === y[this.fieldValue]);
                            this.select(selectedValue);
                        } else {
                            const selectedValue = this.options.find(x => x[this.fieldValue] === y);
                            this.select(selectedValue);
                        }

                    });
                }
                return this.doFinalOutsideChanges();
            }
        }

    }

    private doFinalOutsideChanges() {
        this.prevValueOutside = ObjectUtils.deepCopy(this.value);
    }

    /**
     * Pretty print current selected state
     * @return {string}
     */
    public printValue(): string {
        return this.printItemValue(this.__internalValue);
    }

    /**
     * Check if passed val is currently selected
     * @param val
     * @return {boolean} true if passed val value is selected
     */
    public isSelected(val: any): boolean {

        if (this.multiselect) {
            this.safeAccessInternalValue();

            // assume that always have this.value && this.fieldValue in multiselect
            if (this.bindObject) {
                return this.__internalValue.find(x => ObjectUtils.objectEquals(x, val));
            } else {
                return this.__internalValue.find(x => x[this.fieldValue] === val[this.fieldValue]);
            }

        }

        return ObjectUtils.objectEquals(val, this.__internalValue);
    }

    public printItemValueAdditionalNotes(item: any): string[] {

        if (!this.settings || !this.settings.printAdditionalLinesOnOpen) {
            return [];
        }

        const printAdditionalLinesOnOpen = this.settings.printAdditionalLinesOnOpen(item);
        if (printAdditionalLinesOnOpen instanceof EssentialSelectRowOptions) {
            // TODO: support that
            console.error('Not supported printAdditionalLinesOnOpen with EssentialSelectRowOptions');
            return [];
        }

        return printAdditionalLinesOnOpen.map(x => this.getSimpleTextPrintable(x));
    }

    public printItemValue(item: any): string {

        // if item is null - immediately return and do not pass to printable
        if (!item) {
            return undefined;
        }

        // if we have custom printer - use it
        if (this.settings) {

            // если меню открыто - то можно задавать отдельный опциональный печатальщик под это
            if (this.settings.printValueOnOpen && this._isOpen) {
                return this.getSimpleTextPrintable(this.settings.printValueOnOpen(item));
            } else {
                return this.getSimpleTextPrintable(this.settings.printValue(item));
            }

        }

        if (!this.fieldName) {
            return item as string;
        } else {
            return item[this.fieldName] as string;
        }

    }

    /**
     * Public API to select option on user action
     * @param option
     * @return {boolean}
     */
    public selectUserOption(option: any): boolean {
        this._userSelectedTimes++;
        return this.selectOption(option);
    }

    /**
     * Public API for select option - typically integration
     * @param option
     * @returns {boolean} - true if can select option
     */
    public selectOption(option: any): boolean {

        const selectedResult = this.select(option);
        if (selectedResult.wasSelected) {
            this.setOpen(false);
            this.valueChange.emit(selectedResult.selectedValue);
        } else {
            return false;
        }

        this.checkAndUpdateSearchInput();
        return true;
    }

    private safeAccessInternalValue() {
        if ((this.__internalValue == null || typeof this.__internalValue === 'undefined') && this.multiselect) {
            this.__internalValue = [];
        }
    }

    private handleNewInternalMultibindingValue() {
        if (!this.bindObject) {
            ObjectUtils.replaceObject(this.__internalValue.map(x => x[this.fieldValue]), this.value);
        } else {
            ObjectUtils.replaceObject(this.__internalValue, this.value);
        }
    }

    private checkCanBeDeSelected(form: any): boolean {
        if (this.settings && this.settings['allowToDeselectValue']) {
            const allowedSelect = this.settings.allowToDeselectValue(form, this.__internalValue);
            if (!allowedSelect) {
                return false;
            }
        }
        return true;
    }

    private checkCanBeSelected(form: any): boolean {
        if (this.settings && this.settings['allowToSelectValue']) {
            const allowedSelect = this.settings.allowToSelectValue(form, this.__internalValue);
            if (!allowedSelect) {
                return false;
            }
        }
        return true;
    }

    /** Internal generic select some option
     * @param form selected value
     * @return object if that value was selected or not
     */
    private select(form: any): { selectedValue: any, wasSelected: boolean } {
        let val;
        this.safeAccessInternalValue();

        this._userHasInputTextToSearchBeforeSelect = false;

        if (this.multiselect) {

            // clear array of we set 'not selected' for multiselect
            if (form === null) {
                this.__internalValue.length = 0;
                this.handleNewInternalMultibindingValue();
                this.ourChange = true;
                this.propagateChange(this.value);
                return {selectedValue: this.value, wasSelected: true};

            } else {

                let formInValue;
                if (this.bindObject && this.haveFieldValue()) {
                    formInValue = this.__internalValue.findIndex(x => x[this.fieldValue] === form[this.fieldValue]);
                } else {
                    formInValue = this.__internalValue.findIndex(x => ObjectUtils.objectEquals(x, form));
                }

                // if we already have selected element - remove
                // otherwise - add
                if (formInValue !== -1) {

                    let b = this.checkCanBeDeSelected(form);
                    if (!b) {
                        return {selectedValue: null, wasSelected: false};
                    }

                    // remove selected value
                    this.__internalValue.splice(formInValue, 1);

                } else {
                    let b = this.checkCanBeSelected(form);
                    if (!b) {
                        return {selectedValue: null, wasSelected: false};
                    }
                    this.__internalValue.push(form);
                }

                this.handleNewInternalMultibindingValue();
                this.ourChange = true;
                this.propagateChange(this.value);
                return {selectedValue: this.value, wasSelected: true};
            }
        } else {
            let b = this.checkCanBeSelected(form);
            if (!b) {
                return {selectedValue: null, wasSelected: false};
            }
        }

        // null - element is not selected
        if (form === null) {
        } else if (!StringUtils.isEmpty(this.fieldValue) && !this.bindObject) {
            val = form[this.fieldValue];
        } else {
            val = form;
        }

        this.value = val;
        this.__internalValue = form;
        this.ourChange = true;
        this.checkAndUpdateSearchInput();

        this.propagateChange(this.value);
        return {selectedValue: val, wasSelected: true};
    }

    /**
     * Refresh search input after model changes
     */
    private checkAndUpdateSearchInput(): void {

        if (this.multiselect) {
            if (!this._isOpen) {
                of({}).pipe(delay(0)).subscribe(() => {
                    this._searchBoxValue = this._joinDefaultMultiSelect();
                })
            }

        } else {
            this._searchBoxValue = this.printItemValue(this.__internalValue);
        }

        this.setOpen(this._isOpen);
        this._findPlaceholderLength(this._searchBoxValue || this.placeholder);
        this.searchChange.emit(this._searchBoxValue);

        of({}).pipe(delay(0)).subscribe(() => {
            if (!this._changeDetectionRef['destroyed']) {
                this._pipeNumber++;
                this._changeDetectionRef.detectChanges();
            }
            // TODO: if immediately set pipNumber => get ExpressionChangedAfterItHasBeenCheckedError
        })

    }

    public _joinDefaultMultiSelect(): string {
        if (!ObjectUtils.isArray(this.__internalValue) || (this.__internalValue as Array<any>).length === 0) {
            return undefined;
        }
        return (this.__internalValue as Array<any>).map(x => this.printItemValue(x)).slice(0, this.multiselectMaximumInlinedElements).join(', ');
    }

    private getStringVisualLengthInPx(stringTest: string): number {
        const ruler = this.contentLengthInner.nativeElement;
        this.contentLengthInner.nativeElement.innerHTML = stringTest;
        return ruler.offsetWidth;
    }

    /**
     * Integration API to truncate width of text in input to prevent overflow on long string
     * @param {string} stringTest
     * @private
     */
    public _findPlaceholderLength(stringTest: string): void {
        if (!this.inputSelectPlaceholder || !this.containerLength || !this.inputSelectPlaceholder) {
            return;
        }

        const inputWidth = this.inputSelectPlaceholder.nativeElement;
        let limit = stringTest.length;

        const ruler = this.containerLength.nativeElement;

        // ruler dudth must match select
        ruler.style.width = this._getDropdownWidth();
        ruler.style.display = 'inline';
        // TODO: better algorithm
        for (let i = stringTest.length; i > 0; i--) {
            let candidateSubstring = stringTest.slice(0, i);

            // 45 is a bit larger that offset right + offset let
            if (this.getStringVisualLengthInPx(candidateSubstring) + 45 < inputWidth.offsetWidth) {
                break;
            }
            limit = i;
        }
        ruler.style.display = 'none';
        this._limit = limit;
    }

    ngOnDestroy(): void {
        if (this.onresizeSubscriber) {
            this.onresizeSubscriber();
        }
    }

    // handle when user clicked outside the essential-select => close
    @HostListener('window:click', ['$event'])
    clickHandler(event: any): void {
        let parent = event.target;

        while (parent !== this.container.nativeElement && parent !== document) {
            parent = parent ? parent.parentNode : document;
        }

        if (parent === document) {
            this.setOpen(false);
            this.checkAndUpdateSearchInput();
        }
    }
}
