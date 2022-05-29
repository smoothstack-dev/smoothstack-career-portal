import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';

import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SearchService } from './services/search/search.service';
import { ServerResponseService } from './services/server-response/server-response.service';
import { getCorpTypeByCorpId } from './typings/corporation';

@Injectable()
export class JobResolver implements Resolve<any> {
  constructor(private searchService: SearchService, private serverResponse: ServerResponseService) {}

  public resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const jobId = route.paramMap.get('id');
    const corpId = route.paramMap.get('corpId');
    const corpType = getCorpTypeByCorpId(corpId);

    return this.searchService.openJob(jobId, corpType).pipe(
      catchError(() => {
        this.serverResponse.setNotFound();
        console.error('invalid job id'); // tslint:disable-line
        return of({ jobs: [] });
      })
    );
  }
}
