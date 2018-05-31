# Angular Essential Select

STM Angular select component

 - AOT compatible
 - Works with NgForms
 - Select one/multi options with a lot of customizations
 - Angular 6+

## Installation

To install this library, run:

```bash
$ npm install angular-essential-select --save
```

and then import EssentialSelectModule in your Angular `AppModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {EssentialSelectModule} from 'angular-essential-select';

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

## License

MIT © [STM Labs](http://stm-labs.ru)
