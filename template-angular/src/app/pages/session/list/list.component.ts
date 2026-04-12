import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from 'src/app/models/Sessions/session.model';
import { SessionService } from 'src/app/services/Session/session.service';
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  sessions: Session[] = [];

  constructor(private sessionsService:SessionService,
              private router:Router) { }

 ngOnInit(): void {
    this.list();

 }
list(){
    this.sessionsService.list().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        console.log(this.sessions);
      }
    });
  }
getUserName(user: any): string {
    return user ? user.name : 'Sin usuario';
 }


}
