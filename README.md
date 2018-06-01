# STM Essential Select

[![Travis Widget]][Travis]

[Travis]: https://travis-ci.org/stm-labs/essential-select
[Travis Widget]: https://travis-ci.org/stm-labs/essential-select.svg?branch=master

STM Angular select component

 - AOT compatible
 - Works with NgForms
 - Select one/multi options with a lot of customizations
 - Angular 6+

## Installation

```bash
$ npm i @stm-labs/essential-select --save
```

and then import EssentialSelectModule in your Angular `AppModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {EssentialSelectModule} from 'essential-select';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    EssentialSelectModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Or you can force to use some language by default
`EssentialSelectModule.forRoot({forcedDefaultLanguage: "en-US"}),`

## Development

To generate all `*.js`, `*.d.ts` and `*.metadata.json` files:

```bash
$ npm run build
```

```bash
$ npm run build:watch
```

To lint all `*.ts` files:

```bash
$ npm run lint
```

Publish - go to dist folder and run
```bash
npm publish --access=public
```

## License

MIT © [STM Labs](http://stm-labs.ru)
