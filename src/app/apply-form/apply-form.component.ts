import { Component, Input, OnInit } from '@angular/core';
import {
  NovoFormGroup,
  FormUtils,
  TextBoxControl,
  FileControl,
  NovoToastService,
  FieldInteractionApi,
  SelectControl,
  TilesControl,
} from 'novo-elements';
import { TranslateService } from 'chomsky';
import { SettingsService } from '../services/settings/settings.service';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { ApplyService } from '../services/apply/apply.service';
import { Router } from '@angular/router';
import { states } from './util/states';
import { months } from './util/months';

@Component({
  selector: 'app-apply-form',
  templateUrl: './apply-form.component.html',
  styleUrls: ['./apply-form.component.scss'],
})
export class ApplyFormComponent implements OnInit {
  @Input() job: any;
  public firstName: TextBoxControl = {} as any;
  public lastName: TextBoxControl = {} as any;
  public email: TextBoxControl = {} as any;
  public phoneNumber: TextBoxControl = {} as any;
  public city: TextBoxControl = {} as any;
  public state: SelectControl = {} as any;
  public zip: TextBoxControl = {} as any;
  public workAuthorization: TilesControl = {} as any;
  public relocation: TilesControl = {} as any;
  public codingAbility: TilesControl = {} as any;
  public yearsOfExperience: TilesControl = {} as any;
  public currentlyStudent: TilesControl = {} as any;
  public graduationMonth: SelectControl = {} as any;
  public graduationYear: TilesControl = {} as any;
  public degreeExpected: TilesControl = {} as any;
  public highestDegree: TilesControl = {} as any;
  public major: TextBoxControl = {} as any;
  public isMilitary: TilesControl = {} as any;
  public militaryStatus: TilesControl = {} as any;
  public militaryBranch: TilesControl = {} as any;
  public form: NovoFormGroup;
  public resume: FileControl;
  public loading: boolean = true;
  public hasError: boolean = false;
  public formControls: any[] = [];
  public applying: boolean = false;
  public alreadyApplied: boolean = false;
  public showCategory: boolean = SettingsService.settings.service.showCategory;
  private APPLIED_KEY: string = 'APPLIED_KEY';

  constructor(
    private formUtils: FormUtils,
    private applyService: ApplyService,
    private analytics: AnalyticsService,
    private toaster: NovoToastService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.checkSessionStorage();
    this.setupForm();
  }
  public setupForm(): void {
    this.firstName = new TextBoxControl({
      key: 'firstName',
      label: TranslateService.translate('FIRST_NAME'),
      required: true,
      hidden: false,
    });
    this.lastName = new TextBoxControl({
      key: 'lastName',
      label: TranslateService.translate('LAST_NAME'),
      required: true,
      hidden: false,
    });
    this.email = new TextBoxControl({
      key: 'email',
      label: TranslateService.translate('EMAIL'),
      type: 'email',
      required: true,
      hidden: false,
    });
    this.phoneNumber = new TextBoxControl({
      key: 'phone',
      label: TranslateService.translate('PHONE'),
      type: 'tel',
      required: true,
      hidden: false,
      interactions: [{ event: 'change', script: this.validatePhone, invokeOnInit: false }],
    });
    this.city = new TextBoxControl({
      key: 'city',
      label: 'CITY',
      required: true,
      hidden: false,
    });
    this.state = new SelectControl({
      key: 'state',
      label: 'STATE',
      required: true,
      hidden: false,
      options: states,
    });
    this.zip = new TextBoxControl({
      key: 'zip',
      label: 'ZIP CODE',
      type: 'number',
      required: true,
      hidden: false,
      interactions: [{ event: 'change', script: this.validateZip, invokeOnInit: false }],
    });
    this.workAuthorization = new TilesControl({
      key: 'workAuthorization',
      label: 'Are you legally authorized to work in the U.S.?',
      required: true,
      options: [
        { label: 'Yes - US Citizen', value: 'US Citizen' },
        { label: 'Yes - Permanent Resident', value: 'Permanent Resident' },
        { label: 'Yes - DACA', value: 'DACA' },
        { label: 'Yes - H-1B', value: 'H-1B' },
        { label: 'Yes - OPT/EAD', value: 'OPT/EAD' },
        { label: 'Yes - EAD', value: 'EAD' },
        { label: 'Yes - H-4/EAD', value: 'H-4/EAD' },
        { label: 'Yes - Other', value: 'Other' },
        { label: 'No', value: 'Not Authorized' },
      ],
    });
    this.relocation = new TilesControl({
      key: 'relocation',
      label: 'Willingness to Relocate',
      required: true,
      options: [
        { label: 'Absolutely! Up for a new adventure', value: 'Yes' },
        { label: 'Would consider moving for the right role', value: 'Undecided' },
        { label: 'Not an option', value: 'No' },
      ],
    });
    this.codingAbility = new TilesControl({
      key: 'codingAbility',
      label: 'How would you rank your coding ability? (0 - lowest, 10 - highest)',
      required: true,
      options: Array.from(Array(11).keys()).map((r) => r.toString()),
    });
    this.yearsOfExperience = new TilesControl({
      key: 'yearsOfExperience',
      label: 'Years of Experience (Including Personal/Educational Projects)',
      required: true,
      hidden: false,
      options: [
        { label: '0-1 years', value: '0-1' },
        { label: '1-2 years', value: '1-2' },
        { label: '2-3 years', value: '2-3' },
        { label: '3+ years', value: '3+' },
      ],
    });
    this.currentlyStudent = new TilesControl({
      key: 'currentlyStudent',
      label: 'Are you currently a student?',
      required: true,
      options: ['Yes', 'No'],
      interactions: [{ event: 'change', script: this.showEducationFields }],
    });
    this.graduationMonth = new SelectControl({
      key: 'graduationMonth',
      label: 'Expected Graduation Month',
      required: true,
      hidden: true,
      options: months.map((label, i) => ({ label, value: `${i + 1}`.padStart(2, '0') })),
    });
    this.graduationYear = new TilesControl({
      key: 'graduationYear',
      label: 'Expected Graduation Year',
      required: true,
      hidden: true,
      options: Array.from(Array(4)).map((v, i) => {
        const year = new Date().getFullYear().toString();
        return `${year.substr(0, 3)}${+year.substr(-1) + i}`;
      }),
    });
    this.degreeExpected = new TilesControl({
      key: 'degreeExpected',
      label: 'Degree Expected',
      required: true,
      hidden: true,
      options: ['High School', "Associate's", "Bachelor's", "Master's", 'PhD'],
      interactions: [{ event: 'change', script: this.showMajor }],
    });
    this.highestDegree = new TilesControl({
      key: 'highestDegree',
      label: 'Highest Degree Achieved',
      required: true,
      hidden: true,
      options: ['None', 'GED', 'High School', "Associate's", "Bachelor's", "Master's", 'PhD'],
      interactions: [{ event: 'change', script: this.showMajor }],
    });
    this.major = new TextBoxControl({
      key: 'major',
      label: 'MAJOR',
      required: true,
      hidden: true,
    });
    this.isMilitary = new TilesControl({
      key: 'isMilitary',
      label: 'Are you a veteran or currently serving in the military?',
      required: true,
      options: ['Yes', 'No'],
      interactions: [{ event: 'change', script: this.showMilitaryStatus }],
    });
    this.militaryStatus = new TilesControl({
      key: 'militaryStatus',
      label: 'Military Status',
      required: true,
      hidden: true,
      options: ['Veteran', 'Active'],
    });
    this.militaryBranch = new TilesControl({
      key: 'militaryBranch',
      label: 'Military Branch',
      required: true,
      hidden: true,
      options: ['Army', 'Air Force', 'Navy', 'Marine Corps', 'Coast Guard', 'Reserves', 'Other'],
    });
    this.resume = new FileControl({
      key: 'resume',
      required: true,
      hidden: false,
      label: 'Upload Resume',
      description: `${TranslateService.translate(
        'ACCEPTED_RESUME'
      )} ${SettingsService.settings.acceptedResumeTypes.toString()}`,
    });

    this.formControls = [
      this.firstName,
      this.lastName,
      this.email,
      this.phoneNumber,
      this.city,
      this.state,
      this.zip,
      this.workAuthorization,
      this.relocation,
      this.codingAbility,
      this.yearsOfExperience,
      this.currentlyStudent,
      this.graduationMonth,
      this.graduationYear,
      this.degreeExpected,
      this.highestDegree,
      this.major,
      this.isMilitary,
      this.militaryStatus,
      this.militaryBranch,
      this.resume,
    ];

    this.form = this.formUtils.toFormGroup([...this.formControls]);
    this.loading = false;
  }

  private showEducationFields = (API: FieldInteractionApi) => {
    const activeValue = API.getActiveValue();
    switch (activeValue) {
      case 'Yes':
        API.hide('highestDegree');
        API.show('graduationMonth');
        API.show('graduationYear');
        API.show('degreeExpected');
        break;
      case 'No':
        API.hide('graduationMonth');
        API.hide('graduationYear');
        API.hide('degreeExpected');
        API.show('highestDegree');
        break;
    }
  };

  private showMilitaryStatus = (API: FieldInteractionApi) => {
    const activeValue = API.getActiveValue();

    switch (activeValue) {
      case 'Yes':
        API.show('militaryStatus');
        API.show('militaryBranch');
        break;
      case 'No':
        API.hide('militaryStatus');
        API.hide('militaryBranch');
        break;
    }
  };

  private showMajor = (API: FieldInteractionApi) => {
    const activeValue = API.getActiveValue();
    switch (activeValue) {
      case 'High School':
      case 'GED':
      case 'None':
      case null:
        API.hide('major');
        break;
      default:
        API.show('major');
        break;
    }
  };

  private checkSessionStorage(): void {
    if (!SettingsService.isServer) {
      this.alreadyApplied = JSON.parse(sessionStorage.getItem(this.APPLIED_KEY));
    }
  }

  public goToJobList(): void {
    this.router.navigate(['/']);
  }

  private validatePhone(API: FieldInteractionApi): void {
    const phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    if (!phoneNumberPattern.test(API.getActiveValue())) {
      API.markAsInvalid(API.getActiveKey(), 'Invalid Phone Number');
    }
  }

  private validateZip(API: FieldInteractionApi): void {
    if (API.getActiveValue().length !== 5) {
      API.markAsInvalid(API.getActiveKey(), 'Invalid Zip');
    }
  }

  private getMilitaryStatus = (): string => {
    return this.form.value.isMilitary === 'No' ? 'Civilian' : this.form.value.militaryStatus;
  };

  public save(): void {
    if (this.form.valid) {
      this.applying = true;
      this.analytics.trackEvent(`Apply to Job: ${this.job.id}`);
      let requestParams: any = {
        firstName: encodeURIComponent(this.form.value.firstName),
        lastName: encodeURIComponent(this.form.value.lastName),
        email: encodeURIComponent(this.form.value.email),
        phone: encodeURIComponent(this.form.value.phone),
        format: this.form.value.resume[0].name.substring(this.form.value.resume[0].name.lastIndexOf('.') + 1),
        city: encodeURIComponent(this.form.value.city),
        state: encodeURIComponent(this.form.value.state),
        zip: encodeURIComponent(this.form.value.zip),
        workAuthorization: encodeURIComponent(this.form.value.workAuthorization),
        relocation: encodeURIComponent(this.form.value.relocation),
        codingAbility: encodeURIComponent(this.form.value.codingAbility),
        yearsOfExperience: encodeURIComponent(this.form.value.yearsOfExperience),
        currentlyStudent: encodeURIComponent(this.form.value.currentlyStudent),
        ...(this.form.value.graduationMonth &&
          this.form.value.graduationYear && {
            graduationDate: encodeURIComponent(`${this.form.value.graduationMonth}/01/${this.form.value.graduationYear}`),
          }),
        ...(this.form.value.degreeExpected && { degreeExpected: encodeURIComponent(this.form.value.degreeExpected) }),
        ...(this.form.value.highestDegree && { highestDegree: encodeURIComponent(this.form.value.highestDegree) }),
        ...(this.form.value.major && { major: encodeURIComponent(this.form.value.major) }),
        militaryStatus: encodeURIComponent(this.getMilitaryStatus()),
        ...(this.form.value.militaryBranch && { militaryBranch: encodeURIComponent(this.form.value.militaryBranch) }),
      };
      let formData: FormData = new FormData();
      formData.append('resume', this.form.value.resume[0].file);
      this.applyService
        .apply(this.job.id, requestParams, formData)
        .subscribe(this.applyOnSuccess.bind(this), this.applyOnFailure.bind(this));
    }
  }

  private applyOnSuccess(res: any): void {
    let toastOptions: any = {
      theme: 'success',
      icon: 'check',
      title: TranslateService.translate('THANK_YOU'),
      message: TranslateService.translate('YOU_WILL_BE_CONTACTED'),
      position: 'growlTopRight',
      hideDelay: 3000,
    };
    this.toaster.alert(toastOptions);
    this.storehasApplied();
    this.goToJobList();
    this.applying = false;
  }

  private applyOnFailure(res: any): void {
    this.hasError = true;
    this.applying = false;
  }

  private storehasApplied(): void {
    sessionStorage.setItem(this.APPLIED_KEY, 'true');
  }
}
