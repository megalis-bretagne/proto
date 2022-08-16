import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DeliberationsComponent } from './components/deliberations.component';
import { AuthGuard } from './services/auth-guard.service';
import { DashboardComponent } from './components/dashboard.component';
import { ActesAutresComponent } from './components/actes-autres.component';



const routes: Routes = [
 {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard]
},
{
  path: 'deliberations',
  component: DeliberationsComponent,
  canActivate: [AuthGuard]
},
{
  path: 'autres-actes',
  component: ActesAutresComponent,
  canActivate: [AuthGuard]
},
{
  path: 'home',
  component: HomeComponent,
  canActivate: [AuthGuard]
}
,{
  path: '**',
  redirectTo: ''
}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]

})
export class AppRoutingModule { }