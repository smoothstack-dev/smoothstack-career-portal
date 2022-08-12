import { Component } from '@angular/core';
import { Location } from '@angular/common';
import * as LINKS from '../utils/links';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  public learnMoreWPLink: string;
  public privacyWPLink: string;
  public infoEMailAddress: string;
  public logoLink: string;

  constructor() {
    this.learnMoreWPLink = LINKS.learnMoreWPLink;
    this.privacyWPLink = LINKS.privacyWPLink;
    this.infoEMailAddress = LINKS.infoEMailAddress;
    this.logoLink = LINKS.logoLink;
  }

  public shareLinks(mediaDestination: string): void {
    let destLink = '';
    switch (mediaDestination) {
      case 'twitter':
        destLink = LINKS.twitterLink;
        break;
      case 'facebook':
        destLink = LINKS.facebookLink;
        break;
      case 'linkedin':
        destLink = LINKS.linkedinLink;
        break;
    }
    window.open(destLink, '_blank');
  }
}
