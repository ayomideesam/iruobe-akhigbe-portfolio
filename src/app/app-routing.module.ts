import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module')
      .then(m => m.HomeModule)
  },
  {
    path: 'resume',
    loadChildren: () => import('./pages/resume/resume.module')
      .then(m => m.ResumeModule)
  },
  {
    path: 'projects',
    loadChildren: () => import('./pages/projects/projects.module')
      .then(m => m.ProjectsModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('./pages/contact/contact.module')
      .then(m => m.ContactModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      initialNavigation: 'enabledBlocking',
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }