import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { defaultChallengeInfo } from './../../static/job-scheduler.template';

@Component({
  selector: 'success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss'],
})
export class SuccessPageComponent {
  @Input()
  schedulingLink: SafeResourceUrl;
  challengeInfo: any;
  jobTitle: string;

  constructor() {}

  public ngOnInit(): void {
    const state = history.state;
    this.schedulingLink = state.schedulingLink;
    // this.schedulingLink =
    // 'https://app.squarespacescheduling.com/schedule.php?owner=23045512&appointmentType=33218120&firstName=Scarlett&lastName=Cobain&email=scarlettxcobain%40gmail.com&phone=631-834-8110&field:11569425=27873';
    // this.challengeInfo = state.challengeInfo || defaultChallengeInfo;
    this.challengeInfo = defaultChallengeInfo;
    this.jobTitle = state.jobTitle;
  }

  public goToSSWebsite(): void {
    window.location.href = 'https://smoothstack.com/';
  }
}
