import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  NovoFormGroup,
  FormUtils,
  TextBoxControl,
  FieldInteractionApi,
  SelectControl,
  TilesControl,
} from 'novo-elements';
import { states } from './util/states';

@Component({
  selector: 'app-apply-form-salesforce',
  templateUrl: './apply-form-salesforce.component.html',
  styleUrls: ['./../apply-form/apply-form.component.scss', './../utils/apply-form-overwrite.component.scss'],
})
export class ApplyFormSalesforceComponent implements OnInit {
  @Input() formType: 'BUILD' | 'RECRUIT';
  public formTitle: string = '';
  public firstName: TextBoxControl = {} as any;
  public lastName: TextBoxControl = {} as any;
  public email: TextBoxControl = {} as any;
  public phoneNumber: TextBoxControl = {} as any;
  public title: TextBoxControl = {} as any;
  public company: TextBoxControl = {} as any;
  public location: SelectControl = {} as any;
  public comment: TextBoxControl = {} as any;
  public organizationName: TextBoxControl = {} as any;
  public typeOfOrganization: TilesControl = {} as any;
  public formControls: any[] = [];
  public form: NovoFormGroup;
  public loading: boolean = true;
  public hasError: boolean = false;
  public applying: boolean = false;

  constructor(private formUtils: FormUtils, private http: HttpClient) {}

  public ngOnInit(): void {
    switch (this.formType) {
      case 'BUILD':
        this.formTitle = 'Contact Us to Build Your Team';
        break;
      case 'RECRUIT':
        this.formTitle = 'Contact Us to Become A Recruiting Partner';
        break;
    }
    this.setupForm();
  }

  public setupForm(): void {
    this.firstName = new TextBoxControl({
      key: 'firstName',
      label: 'FIRST NAME*',
      required: true,
      hidden: false,
    });
    this.lastName = new TextBoxControl({
      key: 'lastName',
      label: 'LAST NAME*',
      required: true,
      hidden: false,
    });
    this.email = new TextBoxControl({
      key: 'email',
      label: 'EMAIL*',
      type: 'email',
      required: true,
      hidden: false,
    });
    this.phoneNumber = new TextBoxControl({
      key: 'phoneNumber',
      label: 'PHONE*',
      type: 'tel',
      required: true,
      hidden: false,
      interactions: [{ event: 'change', script: this.validatePhone, invokeOnInit: false }],
    });
    this.location = new SelectControl({
      key: 'location',
      label: 'Location*',
      required: true,
      hidden: false,
      options: states,
    });
    this.title = new TextBoxControl({
      key: 'title',
      label: 'Title*',
      required: true,
      hidden: false,
    });
    this.company = new TextBoxControl({
      key: 'company',
      label: 'Company*',
      required: true,
      hidden: false,
    });
    this.organizationName = new TextBoxControl({
      key: 'organizationName',
      label: 'Organization Name*',
      required: true,
      hidden: false,
    });
    this.typeOfOrganization = new TilesControl({
      key: 'typeOfOrganization',
      label: 'Type of Organization*',
      required: true,
      options: ['UNIVERSITY', 'BOOTCAMP', 'MILITARY', 'WORKFORCE DEVELOPMENT', 'CAREER CENTER', 'OTHER'],
    });
    this.comment = new TextBoxControl({
      key: 'comment',
      label: 'Comments/Questions',
      required: false,
      hidden: false,
    });

    if (this.formType === 'BUILD')
      this.formControls = [this.firstName, this.lastName, this.email, this.company, this.comment];
    else if (this.formType === 'RECRUIT')
      this.formControls = [
        this.firstName,
        this.lastName,
        this.email,
        this.phoneNumber,
        this.title,
        this.organizationName,
        this.typeOfOrganization,
        this.location,
        this.comment,
      ];

    this.form = this.formUtils.toFormGroup([...this.formControls]);
    this.loading = false;
  }

  private validatePhone(API: FieldInteractionApi): void {
    const phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    if (!phoneNumberPattern.test(API.getActiveValue())) {
      API.markAsInvalid(API.getActiveKey(), 'Invalid Phone Number');
    }
  }

  private toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
  };

  public save(): void {
    if (this.form.valid) {
      this.applying = true;
      let requestParams: any = {};
      console.log('this.form.value', this.form.value);

      switch (this.formType) {
        case 'BUILD':
          requestParams = {
            oid: '00Df4000004JCvU',
            retURL: 'http://',
            lead_source: 'Contact Us',
            country: 'United States',
            first_name: this.toTitleCase(this.form.value.firstName.trim()),
            last_name: this.toTitleCase(this.form.value.lastName.trim()),
            email: this.form.value.email.trim(),
            company: this.form.value.company.trim(),
            Comments__c: this.form.value.comment.trim(),
          };
          break;
        case 'RECRUIT':
          requestParams = {
            oid: '00Df4000004JCvU',
            retURL: 'http://',
            lead_source: 'Contact Us',
            country: 'United States',
            first_name: this.toTitleCase(this.form.value.firstName.trim()),
            last_name: this.toTitleCase(this.form.value.lastName.trim()),
            email: this.form.value.email.trim(),
            phone: this.form.value.phoneNumber.trim(),
            title: this.form.value.title.trim(),
            organizationName: this.form.value.organizationName,
            Organization_Type__c: this.form.value.typeOfOrganization,
            state: this.form.value.location,
            Comments__c: this.form.value.comment.trim(),
          };
          break;
      }
      // TODO apply
      this.apply(requestParams);
    }
  }

  private apply(params: any) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8';
    form.target = 'salesforce';
    for (const [key, value] of Object.entries(params)) {
      form.appendChild(this.createHiddenInput(key, value as string));
    }
    document.body.appendChild(form);
    form.submit();
    this.applyOnSuccess();
  }

  private createHiddenInput(name: string, value: string) {
    const input = document.createElement('input');
    input.name = name;
    input.value = value;
    input.setAttribute('type', 'hidden');
    return input;
  }

  private applyOnSuccess(): void {
    this.applying = false;
    switch (this.formType) {
      case 'BUILD':
        window.location.href = 'https://smoothstack.com/contact-smoothstack/thank-you-build-your-team/';
        break;
      case 'RECRUIT':
        window.location.href = 'https://smoothstack.com/contact-smoothstack/thank-you-become-a-recruiting-partner/';
        break;
    }
  }

  private applyOnFailure(res: any): void {
    this.hasError = true;
    this.applying = false;
  }
}
