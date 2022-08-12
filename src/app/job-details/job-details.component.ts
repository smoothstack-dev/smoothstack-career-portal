import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../services/search/search.service';
import { NovoModalService } from 'novo-elements';
import { SettingsService } from '../services/settings/settings.service';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { ApplyModalComponent } from '../apply-modal/apply-modal.component';
import { ErrorModalComponent } from '../error-modal/error-modal.component';
import { Title, Meta } from '@angular/platform-browser';
import { JobBoardPost } from '@bullhorn/bullhorn-types';
import { ServerResponseService } from '../services/server-response/server-response.service';
import { TranslateService } from 'chomsky';
import { CORPORATION, CORP_TYPE, getCorpTypeByCorpId } from '../typings/corporation';
import { PreviousRoute } from '../services/previouseRoute/previouseRoute.service';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss'],
})
export class JobDetailsComponent implements OnInit {
  public job: JobBoardPost | any;
  public id: string;
  public corpType: CORP_TYPE;
  public source: string;
  public loading: boolean = true;
  public relatedJobs: any;
  public alreadyApplied: boolean = false;
  public jobInfoChips: [string | any];
  public showCategory: boolean;
  public isSafariAgent: boolean = false;
  private APPLIED_JOBS_KEY: string = 'APPLIED_JOBS_KEY';
  public scrollBtmClassName: string = 'go-to-apply-form no-print';

  constructor(
    private service: SearchService,
    private route: ActivatedRoute,
    private router: Router,
    private previousRoute: PreviousRoute,
    private analytics: AnalyticsService,
    private modalService: NovoModalService,
    private viewContainerRef: ViewContainerRef,
    private titleService: Title,
    private meta: Meta,
    private serverResponse: ServerResponseService,
    private scroller: ViewportScroller
  ) {
    this.modalService.parentViewContainer = this.viewContainerRef;
  }

  public ngOnInit(): void {
    if (!SettingsService.isServer) {
      this.isSafariAgent = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    }
    this.loading = true;
    this.id = this.route.snapshot.paramMap.get('id');
    const corpId = this.route.snapshot.paramMap.get('corpId');
    this.corpType = getCorpTypeByCorpId(corpId);
    this.jobInfoChips = SettingsService.settings[CORPORATION[this.corpType].serviceName].jobInfoChips;
    this.showCategory = SettingsService.settings[CORPORATION[this.corpType].serviceName].showCategory;

    this.source = this.route.snapshot.queryParams.source;
    this.analytics.trackEvent(`Open Job: ${this.id}`);
    this.checkSessionStorage();
    this.setJob();
  }

  // TODO: check seession storage and add service num
  public checkSessionStorage(): void {
    if (!SettingsService.isServer) {
      let alreadyAppliedJobs: any = sessionStorage.getItem(this.APPLIED_JOBS_KEY);
      if (alreadyAppliedJobs) {
        let alreadyAppliedJobsArray: any = JSON.parse(alreadyAppliedJobs);
        this.alreadyApplied = alreadyAppliedJobsArray.indexOf(parseInt(this.id)) !== -1; // tslint:disable-line
      }
    }
  }

  public getRelatedJobs(): any {
    if (this.job && this.job.publishedCategory) {
      this.service
        .getJobs(
          { 'publishedCategory.id': [this.job.publishedCategory.id] },
          {},
          SettingsService.settings[CORPORATION[this.corpType].serviceName].batchSize
        )
        .subscribe((res: any) => {
          this.relatedJobs = res.data;
        });
    }
  }

  public apply(): void {
    this.analytics.trackEvent(`Open Apply Form ${this.job.id}`);
    this.modalService
      .open(ApplyModalComponent, {
        job: this.job,
        source: this.source,
        viewContainer: this.viewContainerRef,
      })
      .onClosed.then(this.checkSessionStorage.bind(this));
  }

  public goToJobList(): void {
    const previous = this.previousRoute.getPreviousUrl();
    const jobListPages = ['/launch', '/corporate', '/senior'];
    if (previous && jobListPages.includes(previous)) this.router.navigate([previous]);
    else this.router.navigate(['/']);
  }

  public numberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private setJob(): void {
    let res: any = this.route.snapshot.data.message;
    if (res.data && res.data.length > 0) {
      this.job = res.data[0];
      const details =
        '{\r\n "sectionOne":\r\n   [\r\n     {\r\n       "title":"Training & Career Opportunity for Entry Level Software Engineer",\r\n       "contentType":"PARAGRAPH",\r\n       "contents":[\r\n         "Are you looking to join an elite team of Software Developers, trained by the best, creating the products and services that transform our world for the better?",\r\n         "The path to a successful technology career can be confusing and unclear. You bring the talent and the motivation, and Smoothstack will provide the training, mentorship, network, and access to extremely desirable roles to launch your career!",\r\n         "Once selected and hired as a W-2 employee of Smoothstack, you will receive 14-20 weeks of paid, remote training in an Agile environment, complete with scrum masters, product owners, code reviewers, and more. Trainees will be paid a biweekly stipend (plus benefits) to train and will start with a salary of $60,000+/year while working on client projects."\r\n       ]\r\n     }\r\n   ],\r\n   "sectionTwo":[\r\n     {\r\n       "title": "Successful Applicants Must:",\r\n       "contentType":"LIST",\r\n       "contents": [\r\n         "Pass a Coding Challenge",\r\n         "Be legally authorized to work in the U.S., without employer sponsorship",\r\n         "Be willing to relocate",\r\n         "Have the ability to obtain Interim Secret Clearance"\r\n       ]\r\n     },\r\n     {\r\n       "title": "Qualifications:",\r\n       "contentType":"LIST",\r\n       "contents": [\r\n         "Must have hands-on coding experience, equivalent training or course work.",\r\n         "No prior professional experience required.",\r\n         "Excitement, eagerness, and ability to learn new technologies quickly."\r\n       ]\r\n     },\r\n     {\r\n      "title": "Test:",\r\n      "contentType":"LIST",\r\n      "contents": [\r\n        "Must have hands-on coding experience, equivalent training or course work.",\r\n        "No prior professional experience required.",\r\n        "Excitement, eagerness, and ability to learn new technologies quickly.",\r\n        "Excitement, eagerness, and ability to learn new technologies quickly.",\r\n        "Excitement, eagerness, and ability to learn new technologies quickly."\r\n      ]\r\n    }\r\n   ],\r\n   "sectionThree":[\r\n     {\r\n       "title": "Benefits:",\r\n       "contentType":"LIST",\r\n       "contents": [\r\n         "Paid Training",\r\n         "Health Insurance including Vision and Dental",\r\n         "Matching 401K",\r\n         "Employee Assistance Program",\r\n         "Voluntary Life Insurance",\r\n         "Relocation Reimbursement",\r\n         "10 paid days off a year (Federal holidays)",\r\n         "Industry Certifications",\r\n         "Tuition Reimbursement assistance",\r\n         "Amazing company culture!"\r\n       ]\r\n     },\r\n     {\r\n       "title": "Entry Level Software Engineer Responsibilities:",\r\n       "contentType":"LIST",\r\n       "contents": [\r\n         "Development in Java, Spring Boot, Microservices, API while providing expertise in the full software development lifecycle, from concept and design to testing, designing, developing and delivering high-volume, low-latency applications for mission-critical systems.",\r\n         "Participate in technical solution and design discussions.",\r\n         "Perform proofs of concept and comprehensive solutions throughout the development lifecycle.",\r\n         "Add new features while improving efficiency, reliability, and scalability to address client needs."\r\n       ]\r\n     }\r\n   ],\r\n   "sectionFour":[\r\n    {\r\n      "title": "",\r\n      "contentType":"PARAGRAPH",\r\n      "contents": [\r\n        "Our internal training is designed to prepare you to get valuable hands-on field experience in simulated environments that mimic client environments.",\r\n        "Smoothstack is 100% technology-focused.  We specialize in Full Stack Java development, Cloud, DevSecOps, Networking, Cyber Security, Artificial Intelligence (AI), Business Intelligence (BI), Data Science, and Machine Learning related initiatives.",\r\n        "Smoothstack  is dedicated to removing bias in hiring and increasing representation and diversity in IT. Smoothstack is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees."\r\n      ]\r\n    },\r\n    {\r\n      "title": "Essential Duties:",\r\n      "contentType":"LIST",\r\n      "contents": [\r\n        "Must be be legally authorized to work in the U.S., without employer sponsorship.",\r\n        "Must pass background check and drug screening.",\r\n        "Must be vaccinated against Covid-19 unless you need a reasonable accommodation for religion or a health-related need."\r\n      ]\r\n    },\r\n    {\r\n      "title": "",\r\n      "contentType":"PARAGRAPH",\r\n      "contents": [\r\n        "Principles only. Recruiters please do not contact this job poster.",\r\n        "Do NOT contact us with unsolicited services or offers."\r\n      ]\r\n    }\r\n  ]\r\n }';
      this.job.details = JSON.parse(details);
      this.titleService.setTitle(this.job.title);
      this.meta.updateTag({ name: 'og:title', content: this.job.title });
      this.meta.updateTag({ name: 'titter:title', content: this.job.title });
      this.meta.updateTag({ name: 'og:image', content: SettingsService.settings.companyLogoPath });
      this.meta.updateTag({ name: 'og:url', content: `${SettingsService.urlRoot}${this.router.url}` });
      this.meta.updateTag({ name: 'og:description', content: this.job.publicDescription });
      this.meta.updateTag({ name: 'twitter:description', content: this.job.publicDescription });
      this.meta.updateTag({ name: 'description', content: this.job.publicDescription });
      this.loading = false;
    } else {
      this.serverResponse.setNotFound();
      this.modalService
        .open(ErrorModalComponent, {
          title: TranslateService.translate('ERROR'),
          message: TranslateService.translate('MISSING_JOB_ERROR'),
        })
        .onClosed.then(this.goToJobList.bind(this));
    }
  }

  public goToApplyForm() {
    document.getElementById('applyForm').scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }

  // This section is to determin whether we are showing the Apply scrolling buttom
  @ViewChild('applyForm', { read: ElementRef })
  private applyForm: ElementRef;

  ngAfterViewInit() {
    if (this.applyForm) {
      const threshold = 0.2;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.scrollBtmClassName = 'hide-go-to-form-btm no-print';
            } else {
              this.scrollBtmClassName = 'go-to-form-btm no-print';
            }
          });
        },
        { threshold }
      );
      observer.observe(this.applyForm.nativeElement);
    }
  }
}
