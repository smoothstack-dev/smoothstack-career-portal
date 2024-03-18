import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { SearchService } from '../services/search/search.service';
import { Title, Meta } from '@angular/platform-browser';
import { SettingsService } from '../services/settings/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from 'chomsky';
import { forkJoin } from 'rxjs';
import { CORPORATION, CORP_TYPE } from '../typings/corporation';
import { JOBLIST_TYPE } from '../typings/jobList';
import { PreviousRoute } from '../services/previouseRoute/previouseRoute.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss'],
})
export class JobListComponent implements OnChanges {
  @Input() public filter: any;
  @Input() public filterCount: number;
  @Input() public sidebarVisible: boolean = false;
  @Input() public jobListType: JOBLIST_TYPE;
  @Output() public displaySidebar: EventEmitter<any> = new EventEmitter();
  @Output() public showLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() public showError: EventEmitter<boolean> = new EventEmitter();

  public jobs: any[] = [];
  public title: string;
  public _loading: boolean = true;
  public moreAvailable: boolean = true;
  public moreSAAvailable: boolean = true;
  public total: number | '...' = '...';
  private start: number = 0;
  private saStart: number = 0;

  constructor(
    private http: SearchService,
    private titleService: Title,
    private meta: Meta,
    private router: Router,
    private route: ActivatedRoute,
    private previousRoute: PreviousRoute
  ) {
    const jobListType = this.route.snapshot.routeConfig.path;
    this.jobListType = jobListType ? (jobListType.toUpperCase() as JOBLIST_TYPE) : JOBLIST_TYPE.LAUNCH;
  }

  public ngOnChanges(changes: SimpleChanges): any {
    this.getData();
  }

  public getData(loadMore: boolean = false): void {
    this.start = loadMore && this.moreAvailable ? this.start + 30 : 0;
    this.saStart = loadMore && this.moreSAAvailable ? this.saStart + 30 : 0;
    this.titleService.setTitle(`${SettingsService.settings.companyName} - Careers`);
    let description: string = TranslateService.translate('PAGE_DESCRIPTION');
    this.meta.updateTag({ name: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'description', content: description });
    const jobCall = this.http.getJobs();
    const saJobCall = this.http.getSAJobs(
      {
        saJobFilter: 'employmentType:Contract OR employmentType:"Direct Hire" OR employmentType:"Contract To Hire"',
      },
      { start: this.saStart }
    );
    const saCorpJobCall = this.http.getSAJobs({ saCorpFilter: 'employmentType:Corporate' }, { start: this.saStart });
    switch (this.jobListType) {
      case JOBLIST_TYPE.SENIOR:
        saJobCall.subscribe({ next: this.onSuccess.bind(this), error: this.onFailure.bind(this) });
        this.title = 'OPEN SENIOR POSITIONS';
        break;
      case JOBLIST_TYPE.CORPORATE:
        saCorpJobCall.subscribe({ next: this.onSuccess.bind(this), error: this.onFailure.bind(this) });
        this.title = 'OPEN CORPORATE POSITIONS';
        break;
      default:
        jobCall.subscribe({ next: this.onSuccess.bind(this), error: this.onFailure.bind(this) });
        this.title = 'Open Entry Level Positions';
        break;
    }
  }

  public loadMore(): void {
    this.getData(true);
  }

  public openSidebar(): void {
    this.displaySidebar.emit(true);
  }

  public loadJob(jobId: number, corpType: CORP_TYPE = CORP_TYPE.APPRENTICESHIP): void {
    const jobUrl = `jobs/${SettingsService.settings[CORPORATION[corpType].serviceName].corpToken}/${jobId}`;
    this.router.navigate([jobUrl]);
    this.loading = true;
  }

  get loading(): boolean {
    return this._loading;
  }

  set loading(value: boolean) {
    this.showLoading.emit(value);
    this._loading = value;
  }

  private onSuccess(results: any[] | any): void {
    let saRes = [],
      appRes = [];
    let saTotalCount = 0,
      appTotalCount = 0;
    switch (this.jobListType) {
      case JOBLIST_TYPE.CORPORATE:
      case JOBLIST_TYPE.SENIOR: {
        const corpType = CORP_TYPE.STAFF_AUG;
        saRes = results.data.map((r) => {
          return {
            ...r,
            corpType,
            corpId: CORPORATION[corpType].corpId,
          };
        });
        saTotalCount = results.count || 0;
        break;
      }
      case JOBLIST_TYPE.LAUNCH: {
        appRes = results
          .map((r) => {
            const corpType = CORP_TYPE.APPRENTICESHIP;
            return {
              ...r,
              id: r.Job_ID__c,
              corpType,
              corpId: CORPORATION[corpType].corpId,
              title: r.Job_Title__c,
            };
          })
          .flatMap((i) => {
            return i.Job_ID__c === 1 || i.Job_ID__c === 2 ? Array.from({ length: 5 }).fill(i) : [];
          });
        appTotalCount = appRes.length;
        break;
      }
    }
    this.jobs = [...appRes, ...saRes];
    if (this.jobs.length === 1) this.loadJob(this.jobs[0].id, this.jobs[0].corpType);
    else {
      this.moreAvailable = false;
      this.moreSAAvailable = saRes.length === 30;
      this.total = this.jobs.length;
      this.loading = false;
    }
  }

  private onFailure(res: any): void {
    this.loading = false;
    this.jobs = [];
    this.total = 0;
    this.moreAvailable = false;
    this.moreSAAvailable = false;
    this.showError.emit(true);
  }
}
