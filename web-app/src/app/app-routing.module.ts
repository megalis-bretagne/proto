import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './services/auth-guard.service';



const routes: Routes = [
 {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
},
{
  path: '**',
  redirectTo: '/home'
},
{
   path: 'home',
   component: HomeComponent,
   canActivate: [AuthGuard],
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]

})
export class AppRoutingModule { }