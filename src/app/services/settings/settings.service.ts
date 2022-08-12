import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { TranslateService } from 'chomsky';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { TransferState, makeStateKey } from '@angular/platform-browser';

const APP_CONFIG_URL: any = './app.json';
const LANGUAGE_KEY: any = makeStateKey<string>('language');

@Injectable()
export class SettingsService {
  public static settings: ISettings;
  public static isServer: boolean;
  public static urlRoot: string;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: string,
    @Optional() @Inject(REQUEST) protected request: Request,
    private transferState: TransferState
  ) {
    SettingsService.isServer = isPlatformServer(platformId);
  }

  public async load(): Promise<any> {
    let data: any | ISettings = await this.http.get(APP_CONFIG_URL).toPromise();
    return this.setConfig(data);
  }

  public async setConfig(data: ISettings): Promise<any> {
    SettingsService.settings = data;
    const objectConfigOptions: string[] = [
      'service',
      'staffAugService',
      'additionalJobCriteria',
      'integrations',
      'eeoc',
      'privacyConsent',
    ];

    objectConfigOptions.forEach((option: string) => {
      if (!SettingsService.settings[option]) {
        SettingsService.settings[option] = {};
      }
    });

    this.checkServiceFields(SettingsService.settings.service);
    this.checkServiceFields(SettingsService.settings.staffAugService);

    await TranslateService.use(this.getPreferredLanguage()).toPromise();
  }

  private checkServiceFields = (service: IServiceSettings) => {
    if (!service.fields || service.fields.length === 0) {
      service.fields = [
        'id',
        'corpId',
        'title',
        'publishedCategory(id,name)',
        'address(city,state,countryName)',
        'employmentType',
        'dateLastPublished',
        'publicDescription',
        'isOpen',
        'isPublic',
        'isDeleted',
        'publishedZip',
        'salary',
        'salaryUnit',
        'customText3',
        'customTextBlock2',
      ];
    }

    if (!service.jobInfoChips) {
      service.jobInfoChips = [
        'employmentType',
        {
          type: 'mediumDate',
          field: 'dateLastPublished',
        },
      ];
    }

    if (!service.keywordSearchFields || service.keywordSearchFields.length === 0) {
      service.keywordSearchFields = ['publicDescription', 'title'];
    }
    const validTokenRegex: RegExp = /[^A-Za-z0-9]/;
    if (!service.corpToken || validTokenRegex.test(service.corpToken)) {
      throw new Error('Invalid Corp Token');
    }
    const validSwimlaneRegex: RegExp = /[^0-9]/;
    if (!service.swimlane || validSwimlaneRegex.test(service.swimlane.toString())) {
      throw new Error('Invalid Swimlane');
    }
    if (SettingsService.urlRoot) {
      TranslateService.setLocation(`${SettingsService.urlRoot}i18n/`);
    }
  };

  private getPreferredLanguage(): string {
    let supportedLanguages: string[] = SettingsService.settings.supportedLocales;
    let language: string = SettingsService.settings.defaultLocale;
    if (SettingsService.isServer) {
      language = this.request['acceptsLanguages'](supportedLanguages);
      if (!language) {
        language = SettingsService.settings.defaultLocale;
      }
      this.transferState.set(LANGUAGE_KEY, language);
    } else {
      language = this.transferState.get(LANGUAGE_KEY, undefined);
      if (!language) {
        language = SettingsService.settings.supportedLocales.filter((locale: string) => {
          return navigator.language === locale;
        })[0];
      }
      if (!language) {
        language = SettingsService.settings.defaultLocale;
      }
    }
    return language;
  }
}
