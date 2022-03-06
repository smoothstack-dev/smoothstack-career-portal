import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NovoModalParams, NovoModalRef } from 'novo-elements';
import { Router } from '@angular/router';

@Component({
  selector: 'success-modal',
  template: `
    <div *ngIf="schedulingLink">
      <novo-notification type="success">
        <h1>Success!</h1>
        <h2>
          Based on your application, you are eligible to move forward to the next step in the process, a coding
          challenge!<br />
          <strong>Click on the button below</strong> to schedule your challenge for a day and time that works best for
          you.<br />
        </h2>
        <button theme="primary" icon="check" (click)="redirect()">Schedule your Coding Challenge</button>
      </novo-notification>
    </div>
    <div *ngIf="!schedulingLink">
      <novo-notification type="success">
        <h1>Thank you!</h1>
        <h2>
          Thank you for applying to our <strong>{{ jobTitle }}</strong> position at Smoothstack! <br />
          We have received your application and will get back to you shortly, after our team has a chance to review your
          application.
        </h2>
        <button theme="primary" (click)="close()">Close</button>
      </novo-notification>
    </div>
  `,
  styleUrls: ['./success-modal.component.scss'],
})
export class SuccessModal {
  public schedulingLink: string;
  public jobTitle: string;

  constructor(
    private modalRef: NovoModalRef,
    private params: NovoModalParams,
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.schedulingLink = this.params['schedulingLink'];
    this.jobTitle = this.params['jobTitle'];
  }

  redirect() {
    this.document.location.href = this.schedulingLink;
  }

  close() {
    this.modalRef.close();
    this.goToJobList();
  }

  goToJobList(): void {
    this.router.navigate(['/']);
  }
}
