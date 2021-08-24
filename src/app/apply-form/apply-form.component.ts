import { Component, Input, OnInit } from '@angular/core';
import {
  NovoFormGroup,
  FormUtils,
  TextBoxControl,
  FileControl,
  NovoToastService,
  FieldInteractionApi,
} from 'novo-elements';
import { TranslateService } from 'chomsky';
import { SettingsService } from '../services/settings/settings.service';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { ApplyService } from '../services/apply/apply.service';
import { Router } from '@angular/router';

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
  public form: NovoFormGroup;
  public resume: FileControl;
  public loading: boolean = true;
  public hasError: boolean = false;
  public formControls: any[] = [this.firstName, this.lastName, this.email, this.phoneNumber];
  public applying: boolean = false;
  public showCategory: boolean = SettingsService.settings.service.showCategory;
  private APPLIED_JOBS_KEY: string = 'APPLIED_JOBS_KEY';

  constructor(
    private formUtils: FormUtils,
    private applyService: ApplyService,
    private analytics: AnalyticsService,
    private toaster: NovoToastService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.setupForm();
  }
  public setupForm(): void {
    this.firstName = new TextBoxControl({
      key: 'firstName',
      label: TranslateService.translate('FIRST_NAME'),
      required: true,
      hidden: false,
      value: '',
    });
    this.lastName = new TextBoxControl({
      key: 'lastName',
      label: TranslateService.translate('LAST_NAME'),
      required: true,
      hidden: false,
      value: '',
    });
    this.email = new TextBoxControl({
      key: 'email',
      label: TranslateService.translate('EMAIL'),
      type: 'email',
      required: true,
      hidden: false,
      value: '',
    });
    this.phoneNumber = new TextBoxControl({
      key: 'phone',
      label: TranslateService.translate('PHONE'),
      type: 'tel',
      required: true,
      hidden: false,
      value: '',
      interactions: [{ event: 'change', script: this.validatePhone, invokeOnInit: false }],
    });

    this.resume = new FileControl({
      key: 'resume',
      required: true,
      hidden: false,
      description: `${TranslateService.translate(
        'ACCEPTED_RESUME'
      )} ${SettingsService.settings.acceptedResumeTypes.toString()}`,
    });

    this.formControls = [this.firstName, this.lastName, this.email, this.phoneNumber, this.resume];

    this.form = this.formUtils.toFormGroup([...this.formControls]);
    this.loading = false;
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
    this.goToJobList();
    this.applying = false;
  }

  private applyOnFailure(res: any): void {
    this.hasError = true;
    this.applying = false;
  }
}
