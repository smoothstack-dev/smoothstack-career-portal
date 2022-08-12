import { Component, Input } from '@angular/core';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { ShareService } from '../services/share/share.service';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent {
  @Input() job: any;
  @Input() id: any;
  public showShareButtons: boolean = false;

  constructor(private shareService: ShareService, private analytics: AnalyticsService) {}

  public toggleShareButtons(): void {
    this.showShareButtons = !this.showShareButtons;
  }

  public shareFacebook(): void {
    this.shareService.facebook(this.job);
    const analyticsString = `Shared Job: ${this.id} via Facebook`;
    this.analytics.trackEvent(analyticsString);
  }

  public shareTwitter(): void {
    this.shareService.twitter(this.job);
    const analyticsString = `Shared Job: ${this.id} via Twitter`;
    this.analytics.trackEvent(analyticsString);
  }

  public shareLinkedin(): void {
    this.shareService.linkedin(this.job);
    const analyticsString = `Shared Job: ${this.id} via LinkedIn`;
    this.analytics.trackEvent(analyticsString);
  }

  public emailLink(): void {
    window.open(this.shareService.emailLink(this.job));
    const analyticsString = `Shared Job: ${this.id} via Email`;
    this.analytics.trackEvent(analyticsString);
  }

  public print(): void {
    window.focus();
    window.print();
  }
}
