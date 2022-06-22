import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss'],
})
export class SuccessPageComponent {
  @Input()
  schedulingLink: SafeResourceUrl;
  challengeInfo: string;
  jobTitle: string;

  constructor(private route: ActivatedRoute, private router: Router) {}

  public ngOnInit(): void {
    const defaultChallengeInfo =
      'Based on your application, you are eligible to move forward to the next step in the process, a coding challenge!<br />Please schedule your challenge below for a day and time that works best for you.<br />';
    const state = history.state;
    this.schedulingLink = state.schedulingLink;
    this.challengeInfo = state.challengeInfo || defaultChallengeInfo;
    this.jobTitle = state.jobTitle;
  }

  public goToSSWebsite(): void {
    window.location.href = 'https://smoothstack.com/';
  }
}
