import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from '../../../services/security.service';

@Component({
  selector: 'app-microsoft-success',
  templateUrl: './microsoft-success.component.html',
  styleUrls: ['./microsoft-success.component.scss']
})
export class MicrosoftSuccessComponent implements OnInit {

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
