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
import { tryParseJSONObject } from '../utils/helpers';

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
      this.job.details = tryParseJSONObject(this.job.customTextBlock2)
        ? JSON.parse(this.job.customTextBlock2)
        : undefined;
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
