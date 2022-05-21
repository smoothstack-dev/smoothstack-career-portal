import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';

import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SearchService } from './services/search/search.service';
import { ServerResponseService } from './services/server-response/server-response.service';

@Injectable()
export class JobResolver implements Resolve<any> {
  constructor(private searchService: SearchService, private serverResponse: ServerResponseService) { }

  public resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const jobId = route.paramMap.get('id');
    const serviceNum = route.paramMap.get('service');
    
    return this.searchService.openJob(jobId,serviceNum).pipe(catchError( () => {
      this.serverResponse.setNotFound();
      console.error('invalid job id'); // tslint:disable-line
      return of({jobs: []});
    },
    ));
  }
}
