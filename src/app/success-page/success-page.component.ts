import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { tryParseJSONObject } from '../utils/helpers';
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
    this.challengeInfo = tryParseJSONObject(state.challengeInfo)
      ? JSON.parse(state.challengeInfo)
      : defaultChallengeInfo;
    this.jobTitle = state.jobTitle;
  }

  public goToSSWebsite(): void {
    window.location.href = 'https://smoothstack.com/';
  }
}
