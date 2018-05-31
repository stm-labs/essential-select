export const DEFAULT_LANGUAGE = 'en-US';

export class EssentialSelectModuleConfig {

    /**
     * Default language if window.navigator is empty
     */
    defaultLanguage = DEFAULT_LANGUAGE;

    /**
     * Force language to use instead if window.navigator
     */
    forcedDefaultLanguage?: string;

}
