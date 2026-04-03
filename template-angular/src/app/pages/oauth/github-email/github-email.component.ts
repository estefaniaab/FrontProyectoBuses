import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GithubAuthService } from '../../../services/OAuth/github-auth.service';
import { SecurityService } from '../../../services/security.service';

@Component({
  selector: 'app-github-email',
  templateUrl: './github-email.component.html',
  styleUrls: ['./github-email.component.scss']
})
export class GithubEmailComponent implements OnInit {
  email: string = '';
  githubUsername: string = '';
  name: string = '';
  photo: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private githubAuthService: GithubAuthService,
    private securityService: SecurityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // data = "githubUsername:photo:name"
    const data = this.activatedRoute.snapshot.queryParams['data'];
    const parts = data.split('|');
    this.githubUsername = parts[0];
    this.photo = parts[1];
    this.name = parts[2];
  }

  submitEmail() {
    this.githubAuthService.completeRegistration(
      this.githubUsername,
      this.name,
      this.photo,
      this.email
    ).subscribe({
      next: (res) => {
        this.securityService.saveToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => console.error(err)
    });
  }
}
