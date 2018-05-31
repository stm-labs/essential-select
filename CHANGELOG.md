# Changelog

## 3.0.0-RC1

 - Build with rxjs6 and angular 6

### Breaking changes

 - Integration API functions for `EssentialSelectComponent` and other components now have underscore prefix e.g. `_getDropdownWidth`. They are used primary for internal usage and you should avoid to use these API because behaviour of that API can change or they can be removed.
All other public methods are public API and would not be removed in current major version

#### Renamed inputs

 - @Input 'hasSearchInput' -> `searchable`
 - @Input 'searchInputType' -> `searchableType`
 - @Input 'unselectAllText' -> `deselectAllText`
 - @Input 'validateFn' -> `deselectAllText`
 - @Input 'useMultiSelect' -> `multiselect`
 - @Input 'multiSelectMaximumInlinedElements ' -> `multiselectMaximumInlinedElements `
 - @Input 'selectPrintable' -> `settings`

 - Public method `unselectAll` renamed to `deselectAll`

### New features

 - Material design (use `<essential-select [designMaterial]="true" </essential-select>` to enable it)

## 2.0.0

### Breaking changes

 - Component selector was renamed from <essentials-ui-select> to <essential-select>

### Misc

 - Performance improvements
 - Add module configuration via `EssentialSelectModule.forRoot()`