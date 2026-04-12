import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from '../../../services/security.service';

@Component({
  selector: 'app-github-success',
  templateUrl: './github-success.component.html',
  styleUrls: ['./github-success.component.scss']
})
export class GithubSuccessComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private securityService: SecurityService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        this.securityService.saveOAuthSession(token);
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
