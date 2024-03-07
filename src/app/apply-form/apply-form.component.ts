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
import { ActivatedRoute, Router } from '@angular/router';
import { states } from './util/states';
import { months } from './util/months';
import { CORPORATION, CORP_TYPE, getCorpTypeByCorpId, workAuthorizationMap } from '../typings/corporation';
import { EMAIL_TYPOS } from './util/email';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TilesControlExt } from './util/TilesControlExt';
import {
  TooltipModalContentRace,
  TooltipModalContentDisability,
  TooltipModalContentVeteran,
  TooltipModalContentVoluntary,
} from '../tooltip-modal/tooltip-modal-content/tooltip-modal-content.component';

@Component({
  selector: 'app-apply-form',
  templateUrl: './apply-form.component.html',
  styleUrls: ['./apply-form.component.scss', './../utils/apply-form-overwrite.component.scss'],
})
export class ApplyFormComponent implements OnInit {
  @Input() job: any;
  @Input() isContactUs: boolean = false;
  public formTitle: string = '';
  public firstName: TextBoxControl = {} as any;
  public lastName: TextBoxControl = {} as any;
  public nickName: TextBoxControl = {} as any;
  public email: TextBoxControl = {} as any;
  public phoneNumber: TextBoxControl = {} as any;
  public city: TextBoxControl = {} as any;
  public state: SelectControl = {} as any;
  public zip: TextBoxControl = {} as any;
  public workAuthorization: TilesControl = {} as any;
  public relocation: TilesControl = {} as any;
  public codingAbility: TilesControl = {} as any;
  public yearsOfExperience: TilesControl = {} as any;
  public yearsOfProfessionalExperience: TilesControl = {} as any;
  public currentlyStudent: TilesControl = {} as any;
  public graduationMonth: SelectControl = {} as any;
  public graduationYear: TilesControl = {} as any;
  public degreeExpected: TilesControl = {} as any;
  public highestDegree: TilesControl = {} as any;
  public major: TextBoxControl = {} as any;
  public voluntaryLabel: TilesControlExt = {} as any;
  public gender: TilesControl = {} as any;
  public race: TilesControlExt = {} as any;
  public disability: TilesControlExt = {} as any;
  public isMilitary: TilesControlExt = {} as any;
  public militaryStatus: TilesControl = {} as any;
  public militaryBranch: TilesControl = {} as any;
  public form: NovoFormGroup;
  public resume: FileControl;
  public loading: boolean = true;
  public hasError: boolean = false;
  public formControls: any[] = [];
  public applying: boolean = false;
  public alreadyApplied: boolean = false;
  public showCategory: boolean;
  private APPLIED_KEY: string = 'APPLIED_KEY';
  private utmSource: string;
  private corpType: CORP_TYPE;
  private utmMedium: string;
  private utmCampaign: string;
  private utmTerm: string;
  private techSelection: TilesControl = {} as any;
  private hardwareDesign: TilesControl = {} as any;
  private hardwareSkillsLabel: TilesControl = {} as any;
  private hardwareSkills1: TilesControl = {} as any;
  private hardwareSkills2: TilesControl = {} as any;
  private hardwareSkills3: TilesControl = {} as any;
  public linkedin: TextBoxControl = {} as any;
  public instagram: TextBoxControl = {} as any;

  constructor(
    private formUtils: FormUtils,
    private applyService: ApplyService,
    private analytics: AnalyticsService,
    private toaster: NovoToastService,
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceDetectorService
  ) {}

  public ngOnInit(): void {
    const corpId = this.route.snapshot.paramMap.get('corpId') || this.job.corpId;
    this.corpType = getCorpTypeByCorpId(corpId);
    this.showCategory = SettingsService.settings[CORPORATION[this.corpType].serviceName].showCategory;
    this.formTitle = this.isContactUs ? 'Apply to Join Our Team' : 'Quick Apply';
    this.getUTM();
    this.checkLocalStorage();
    this.setupForm();

    // remove hidden attribue from the page
    let listItem = document.getElementsByTagName('i');
    for (let i = 0; i < listItem.length; i++) {
      listItem[i].removeAttribute('hidden');
    }
  }

  public getUTM(): void {
    this.route.queryParams.subscribe((params) => {
      this.utmSource = params['utm_source'];
      this.utmMedium = params['utm_medium'];
      this.utmCampaign = params['utm_campaign'];
      this.utmTerm = params['utm_term'];
    });
  }

  public setupForm(): void {
    this.firstName = new TextBoxControl({
      key: 'firstName',
      label: `${TranslateService.translate('FIRST_NAME')}*`,
      required: true,
      hidden: false,
    });
    this.lastName = new TextBoxControl({
      key: 'lastName',
      label: `${TranslateService.translate('LAST_NAME')}*`,
      required: true,
      hidden: false,
    });
    this.nickName = new TextBoxControl({
      key: 'nickName',
      label: 'Preferred Name (OPTIONAL)',
      required: false,
      hidden: false,
    });
    this.email = new TextBoxControl({
      key: 'email',
      label: `${TranslateService.translate('EMAIL')}*`,
      type: 'email',
      required: true,
      hidden: false,
      interactions: [{ event: 'change', script: this.validateEmail, invokeOnInit: false }],
    });
    this.phoneNumber = new TextBoxControl({
      key: 'phone',
      label: `${TranslateService.translate('PHONE')}*`,
      type: 'tel',
      required: true,
      hidden: false,
      interactions: [{ event: 'change', script: this.validatePhone, invokeOnInit: false }],
    });
    this.workAuthorization = new TilesControl({
      key: 'workAuthorization',
      label: 'Are you legally authorized to work in the U.S.?*',
      required: true,
      options: workAuthorizationMap[this.corpType],
    });
    this.resume = new FileControl({
      key: 'resume',
      required: this.isResumeRequired(),
      hidden: false,
      label: 'Upload Resume' + (this.isResumeRequired() ? '*' : ' (Optional)'),
      description: `${TranslateService.translate(
        'ACCEPTED_RESUME'
      )} ${SettingsService.settings.acceptedResumeTypes.toString()}`,
    });

    this.city = new TextBoxControl({
      key: 'city',
      label: 'CITY*',
      required: true,
      hidden: false,
    });
    this.state = new SelectControl({
      key: 'state',
      label: 'STATE*',
      required: true,
      hidden: false,
      options: states,
    });
    this.zip = new TextBoxControl({
      key: 'zip',
      label: 'ZIP CODE*',
      type: 'number',
      required: true,
      hidden: false,
      interactions: [{ event: 'change', script: this.validateZip, invokeOnInit: false }],
    });
    this.codingAbility = new TilesControl({
      key: 'codingAbility',
      label: 'How would you rank your coding ability? (0 - lowest, 10 - highest)*',
      required: true,
      options: Array.from(Array(11).keys()).map((r) => r.toString()),
    });
    this.yearsOfExperience = new TilesControl({
      key: 'yearsOfExperience',
      label: 'Years of Coding Experience (Including Personal/Educational Projects)*',
      required: true,
      hidden: false,
      options: [
        { label: '0-1 years', value: '0-1' },
        { label: '1-2 years', value: '1-2' },
        { label: '2-3 years', value: '2-3' },
        { label: '3+ years', value: '3+' },
      ],
    });
    this.yearsOfProfessionalExperience = new TilesControl({
      key: 'yearsOfProfessionalExperience',
      label: 'Years of Professional Experience*',
      required: true,
      hidden: false,
      options: [
        { label: '0', value: '0' },
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
        { label: '6', value: '6' },
        { label: '7', value: '7' },
        { label: '8', value: '8' },
        { label: '9', value: '9' },
        { label: '10+', value: '10+' },
      ],
    });
    this.currentlyStudent = new TilesControl({
      key: 'currentlyStudent',
      label: 'Are you currently a student?*',
      required: true,
      options: ['Yes', 'No'],
      interactions: [{ event: 'change', script: this.showEducationFields }],
    });
    this.graduationMonth = new SelectControl({
      key: 'graduationMonth',
      label: 'Expected Graduation Month*',
      required: true,
      hidden: true,
      options: months.map((label, i) => ({ label, value: `${i + 1}`.padStart(2, '0') })),
    });
    this.graduationYear = new TilesControl({
      key: 'graduationYear',
      label: 'Expected Graduation Year*',
      required: true,
      hidden: true,
      options: Array.from(Array(4)).map((v, i) => {
        const year = new Date().getFullYear().toString();
        return `${year.substr(0, 3)}${+year.substr(-1) + i}`;
      }),
    });
    this.degreeExpected = new TilesControl({
      key: 'degreeExpected',
      label: 'Degree Expected*',
      required: true,
      hidden: true,
      options: ['High School', "Associate's", "Bachelor's", "Master's", 'PhD'],
      interactions: [{ event: 'change', script: this.showMajor }],
    });
    this.highestDegree = new TilesControl({
      key: 'highestDegree',
      label: 'Highest Degree Achieved*',
      required: true,
      hidden: true,
      options: ['None', 'GED', 'High School', "Associate's", "Bachelor's", "Master's", 'PhD'],
      interactions: [{ event: 'change', script: this.showMajor }],
    });
    this.major = new TextBoxControl({
      key: 'major',
      label: 'MAJOR*',
      required: true,
      hidden: true,
    });
    this.voluntaryLabel = new TilesControlExt({
      key: 'voluntaryLabel',
      extLabel: 'Voluntary Disclosures',
      required: false,
      extToolTip: {
        icon: 'question',
        content: TooltipModalContentVoluntary,
      },
    });
    this.gender = new TilesControl({
      key: 'gender',
      label: 'Gender*',
      required: true,
      options: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Nonbinary', value: 'Nonbinary' },
        { label: 'Opt Out', value: 'Opt Out' },
      ],
    });
    this.race = new TilesControlExt({
      key: 'race',
      extLabel: 'Race/Ethnicity*',
      extToolTip: {
        icon: 'question',
        content: TooltipModalContentRace,
      },
      required: true,
      options: [
        { label: 'Hispanic or Latino', value: 'Hispanic or Latino' },
        { label: 'American Indian', value: 'American Indian' },
        { label: 'Alaska Native', value: 'Alaska Native' },
        { label: 'Asian', value: 'Asian' },
        { label: 'Black or African American', value: 'Black or African American' },
        { label: 'Native Hawaiian', value: 'Native Hawaiian' },
        { label: 'Other Pacific Islander', value: 'Other Pacific Islander' },
        { label: 'Two or More Races', value: 'Two or More Races' },
        { label: 'White', value: 'White' },
        { label: 'Opt Out', value: 'Opt Out' },
      ],
    });
    this.disability = new TilesControlExt({
      key: 'disability',
      extLabel: 'Disability*',
      extToolTip: {
        icon: 'question',
        content: TooltipModalContentDisability,
      },
      required: true,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' },
        { label: 'Opt Out', value: 'Opt Out' },
      ],
    });
    this.isMilitary = new TilesControlExt({
      key: 'isMilitary',
      extLabel: 'Are you a veteran or currently serving in the military?*',
      extToolTip: {
        icon: 'question',
        content: TooltipModalContentVeteran,
      },
      required: true,
      options: [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
        { label: 'Do not wish to specify', value: 'Undisclosed' },
      ],
      interactions: [{ event: 'change', script: this.showMilitaryStatus }],
    });
    this.militaryStatus = new TilesControl({
      key: 'militaryStatus',
      label: 'Military Status*',
      required: true,
      hidden: true,
      options: ['Veteran', 'Active'],
    });
    this.militaryBranch = new TilesControl({
      key: 'militaryBranch',
      label: 'Military Branch*',
      required: true,
      hidden: true,
      options: ['Army', 'Air Force', 'Navy', 'Marine Corps', 'Coast Guard', 'Reserves', 'Other'],
    });

    this.relocation = new TilesControl({
      key: 'relocation',
      label: 'Willingness to Relocate*',
      required: true,
      options: [
        { label: 'Absolutely! Up for a new adventure', value: 'Yes' },
        { label: 'Would consider moving for the right role', value: 'Undecided' },
        { label: 'Not an option', value: 'No' },
      ],
    });
    this.techSelection = new TilesControl({
      key: 'techSelection',
      label: 'If you had to choose one, which language would be your strongest?*',
      required: true,
      options: [
        { label: 'Java', value: 'java' },
        { label: 'Python', value: 'python' },
        { label: 'C/C++', value: 'c' },
        { label: '.NET', value: 'dotNet' },
        { label: 'Other', value: 'other' },
      ],
      interactions: [{ event: 'change', script: this.showHardwareDesign }],
    });

    this.hardwareDesign = new TilesControl({
      key: 'hardwareDesign',
      label: 'Do you have basic understanding & interest in digital hardware architecture/design?*',
      hidden: true,
      required: true,
      options: [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
      ],
      interactions: [{ event: 'change', script: this.showHardwareSkills }],
    });

    this.hardwareSkillsLabel = new TilesControl({
      key: 'hardwareSkillsLabel',
      label: 'Do you have any knowledge or experience with:',
      required: false,
      hidden: true,
    });

    this.hardwareSkills1 = new TilesControl({
      key: 'hardwareSkills1',
      label: '-> OS internals, Libraries, Linux/Windows, Drivers, Compilers',
      required: true,
      hidden: true,
      options: [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
      ],
    });

    this.hardwareSkills2 = new TilesControl({
      key: 'hardwareSkills2',
      label: '-> Computer Architecture, System Design, Simulation, Modeling, Verification',
      required: true,
      hidden: true,
      options: [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
      ],
    });

    this.hardwareSkills3 = new TilesControl({
      key: 'hardwareSkills3',
      label: '-> CAD/EDA development (tools/flows for Silicon design)',
      required: true,
      hidden: true,
      options: [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
      ],
    });

    this.linkedin = new TextBoxControl({
      key: 'linkedin',
      label: `LINKEDIN URL (OPTIONAL)`,
      required: false,
      hidden: false,
    });

    this.instagram = new TextBoxControl({
      key: 'instagram',
      label: `INSTAGRAM HANDLE (OPTIONAL)`,
      required: false,
      hidden: false,
    });

    if (this.corpType === CORP_TYPE.APPRENTICESHIP) {
      this.formControls = [
        this.firstName,
        this.lastName,
        this.nickName,
        this.email,
        this.phoneNumber,
        this.city,
        this.state,
        this.zip,
        this.workAuthorization,
        this.relocation,
        this.codingAbility,
        this.techSelection,
        this.hardwareDesign,
        this.hardwareSkillsLabel,
        this.hardwareSkills1,
        this.hardwareSkills2,
        this.hardwareSkills3,
        this.currentlyStudent,
        this.graduationMonth,
        this.graduationYear,
        this.degreeExpected,
        this.highestDegree,
        this.major,
        this.yearsOfExperience,
        this.voluntaryLabel,
        this.gender,
        this.disability,
        this.race,
        this.isMilitary,
        this.militaryStatus,
        this.militaryBranch,
        this.linkedin,
        this.instagram,
        this.resume,
      ];
    } else {
      this.formControls = [
        this.firstName,
        this.lastName,
        this.nickName,
        this.email,
        this.phoneNumber,
        this.city,
        this.state,
        this.zip,
        this.yearsOfProfessionalExperience,
        this.workAuthorization,
        this.relocation,
        this.resume,
      ];
    }

    this.form = this.formUtils.toFormGroup([...this.formControls]);
    this.loading = false;
  }

  private showHardwareDesign = (API: FieldInteractionApi) => {
    const activeValue = API.getActiveValue();
    switch (activeValue) {
      case 'python':
      case 'c':
        API.show('hardwareDesign');
        break;
      default:
        API.hide('hardwareDesign');
        API.hide('hardwareSkillsLabel');
        API.hide('hardwareSkills1');
        API.hide('hardwareSkills2');
        API.hide('hardwareSkills3');
        break;
    }
  };

  private showHardwareSkills = (API: FieldInteractionApi) => {
    const activeValue = API.getActiveValue();
    switch (activeValue) {
      case 'Yes':
        API.show('hardwareSkillsLabel');
        API.show('hardwareSkills1');
        API.show('hardwareSkills2');
        API.show('hardwareSkills3');
        break;
      case 'No':
        API.hide('hardwareSkillsLabel');
        API.hide('hardwareSkills1');
        API.hide('hardwareSkills2');
        API.hide('hardwareSkills3');
        break;
    }
  };

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
      default:
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

  private checkLocalStorage(): void {
    if (!SettingsService.isServer) {
      this.alreadyApplied =
        JSON.parse(localStorage.getItem(this.APPLIED_KEY)) &&
        (this.utmSource !== 'phone' || this.corpType === CORP_TYPE.STAFF_AUG);
    }
  }

  private validatePhone(API: FieldInteractionApi): void {
    const phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    if (!phoneNumberPattern.test(API.getActiveValue())) {
      API.markAsInvalid(API.getActiveKey(), 'Invalid Phone Number');
    }
  }

  private validateEmail(API: FieldInteractionApi): void {
    if (EMAIL_TYPOS.some((typo) => API.getActiveValue().endsWith(typo))) {
      API.markAsInvalid(API.getActiveKey(), 'Invalid Email Address');
    }
  }

  private validateZip(API: FieldInteractionApi): void {
    if (API.getActiveValue().length !== 5) {
      API.markAsInvalid(API.getActiveKey(), 'Invalid Zip');
    }
  }

  private getMilitaryStatus = (): string => {
    switch (this.form.value.isMilitary) {
      case 'Yes':
        return this.form.value.militaryStatus;
      case 'No':
        return 'Civilian';
      case 'Undisclosed':
        return 'Undisclosed';
    }
  };

  private getHardwareSkills = () => {
    return this.form.value.hardwareSkills1 === 'Yes' ||
      this.form.value.hardwareSkills2 == 'Yes' ||
      this.form.value.hardwareSkills3 === 'Yes'
      ? 'Yes'
      : 'No';
  };

  private toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
  };

  public save(): void {
    if (this.form.valid) {
      this.applying = true;
      this.analytics.trackEvent(`Apply to corpId: ${this.job.corpId}, Job: ${this.job.id}`);
      let requestParams: any = {};
      if (this.corpType === CORP_TYPE.APPRENTICESHIP) {
        requestParams = {
          firstName: encodeURIComponent(this.toTitleCase(this.form.value.firstName.trim())),
          lastName: encodeURIComponent(this.toTitleCase(this.form.value.lastName.trim())),
          nickName: encodeURIComponent(this.form.value.nickName.trim()),
          email: encodeURIComponent(this.form.value.email.trim()),
          phone: encodeURIComponent(this.form.value.phone.trim()),
          ...(this.form.value.resume[0] && {
            format: this.form.value.resume[0].name.substring(this.form.value.resume[0].name.lastIndexOf('.') + 1),
          }),
          workAuthorization: encodeURIComponent(this.form.value.workAuthorization),
          relocation: encodeURIComponent(this.form.value.relocation),
          city: encodeURIComponent(this.form.value.city.trim()),
          state: encodeURIComponent(this.form.value.state),
          zip: encodeURIComponent(this.form.value.zip),
          codingAbility: encodeURIComponent(this.form.value.codingAbility),
          yearsOfExperience: encodeURIComponent(this.form.value.yearsOfExperience),
          currentlyStudent: encodeURIComponent(this.form.value.currentlyStudent),
          ...(this.form.value.graduationMonth &&
            this.form.value.graduationYear && {
              graduationDate: encodeURIComponent(
                `${this.form.value.graduationMonth}/01/${this.form.value.graduationYear}`
              ),
            }),
          ...(this.form.value.degreeExpected && {
            degreeExpected: encodeURIComponent(this.form.value.degreeExpected),
          }),
          ...(this.form.value.highestDegree && {
            highestDegree: encodeURIComponent(this.form.value.highestDegree),
          }),
          ...(this.form.value.major && { major: encodeURIComponent(this.form.value.major.trim()) }),
          gender: encodeURIComponent(this.form.value.gender),
          race: encodeURIComponent(this.form.value.race),
          disability: encodeURIComponent(this.form.value.disability),
          militaryStatus: encodeURIComponent(this.getMilitaryStatus()),
          ...(this.form.value.militaryBranch && { militaryBranch: encodeURIComponent(this.form.value.militaryBranch) }),
          ...(this.form.value.techSelection && { techSelection: encodeURIComponent(this.form.value.techSelection) }),
          ...(this.form.value.hardwareDesign && {
            hardwareDesign: encodeURIComponent(this.form.value.hardwareDesign),
          }),
          ...(this.form.value.hardwareDesign === 'Yes' && {
            hardwareSkills: this.getHardwareSkills(),
          }),
          ...(this.utmSource && { utmSource: encodeURIComponent(this.utmSource) }),
          ...(this.isContactUs && { utmSource: encodeURIComponent('contact_us') }),
          ...(this.utmMedium && { utmMedium: encodeURIComponent(this.utmMedium) }),
          ...(this.utmCampaign && { utmCampaign: encodeURIComponent(this.utmCampaign) }),
          ...(this.utmTerm && { utmTerm: encodeURIComponent(this.utmTerm) }),
          ...(this.linkedin && { linkedin: encodeURIComponent(this.form.value.linkedin.trim()) }),
          ...(this.instagram && { instagram: encodeURIComponent(this.form.value.instagram.trim()) }),
          deviceType: this.deviceService.isMobile() ? 'mobile' : 'desktop',
        };
      }
      if (this.corpType === CORP_TYPE.STAFF_AUG) {
        requestParams = {
          firstName: encodeURIComponent(this.toTitleCase(this.form.value.firstName.trim())),
          lastName: encodeURIComponent(this.toTitleCase(this.form.value.lastName.trim())),
          nickName: encodeURIComponent(this.form.value.nickName.trim()),
          email: encodeURIComponent(this.form.value.email.trim()),
          phone: encodeURIComponent(this.form.value.phone.trim()),
          format: this.form.value.resume[0].name.substring(this.form.value.resume[0].name.lastIndexOf('.') + 1),
          city: encodeURIComponent(this.form.value.city.trim()),
          state: encodeURIComponent(this.form.value.state),
          zip: encodeURIComponent(this.form.value.zip),
          workAuthorization: encodeURIComponent(this.form.value.workAuthorization),
          willRelocate: encodeURIComponent(this.form.value.relocation),
          yearsOfProfessionalExperience: encodeURIComponent(this.form.value.yearsOfProfessionalExperience),
        };
      }

      let formData: FormData = new FormData();
      if (this.form.value.resume[0]) {
        formData.append('resume', this.form.value.resume[0].file);
      }
      this.applyService
        .apply(this.job.id, requestParams, formData, this.corpType)
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
    this.applying = false;
    const state = {
      jobTitle: this.job.title,
      schedulingLink: res ? res.schedulingLink : undefined,
      challengeInfo: res && res.jobOrder ? res.jobOrder.customTextBlock1 : this.job.customTextBlock1,
    };
    this.router.navigate(['/jobs/success/'], { state });
  }

  private applyOnFailure(res: any): void {
    this.hasError = true;
    this.applying = false;
  }

  private storehasApplied(): void {
    localStorage.setItem(this.APPLIED_KEY, 'true');
  }

  public handleEdit(e: any) {
    console.log('This is an Edit Action!', e); // tslint:disable-line
  }

  private isResumeRequired() {
    return (
      (this.corpType !== CORP_TYPE.APPRENTICESHIP || !this.deviceService.isMobile()) &&
      (this.corpType !== CORP_TYPE.APPRENTICESHIP || this.utmSource !== 'phone')
    );
  }
}
