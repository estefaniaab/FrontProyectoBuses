import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SecurityService } from '../../services/security.service';
import { User } from '../../models/Users/user.model';
import { Subscription } from 'rxjs';
import { ProfileService } from '../../services/Profile/profile.service';
import { Profile } from '../../models/Profiles/profile.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  public focus: boolean;
  public listTitles: any[];
  public location: Location;

  currentUser: User | null = null;
  userSubscription!: Subscription;

  displayName: string = 'Usuario';
  profileImage: string = 'assets/img/theme/team-4-800x800.jpg';
  myProfileId: string = '';

  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    public securityService: SecurityService,
    private profileService: ProfileService
  ) {
    this.location = location;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);

    this.userSubscription = this.securityService.theUser.subscribe((user: User) => {
      if (!user || !user.id) return;

      this.currentUser = user;

      this.displayName = user.githubUsername && user.githubUsername.trim() !== ''
        ? user.githubUsername
        : (user.name || 'Usuario');

      this.profileService.getMyProfile().subscribe({
        next: (profile: Profile) => {
          this.myProfileId = profile?.id || '';

          if (profile?.photo && profile.photo.trim() !== '') {
            this.profileImage = profile.photo;
          } else {
            this.profileImage = 'assets/img/theme/team-4-800x800.jpg';
          }
        },
        error: (error) => {
          console.error('Error cargando perfil:', error);
          this.profileImage = 'assets/img/theme/team-4-800x800.jpg';
        }
      });
    });
  }

  goToMyProfile(): void {
    if (this.myProfileId) {
      this.router.navigate(['/profiles/update', this.myProfileId]);
    } else {
      console.error('No se encontró el profileId del usuario logueado');
    }
  }

  logout(): void {
    this.securityService.logout();
  }

  getTitle() {
    let titlee = this.location.prepareExternalUrl(this.location.path());

    if (titlee.charAt(0) === '#') {
      titlee = titlee.slice(1);
    }

    for (let item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) {
        return this.listTitles[item].title;
      }
    }

    return 'Dashboard';
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
