import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

// Components
import { HomeComponent } from './components/home.component';

@NgModule({
    declarations: [
        HomeComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([
            { path: '', component: HomeComponent }
        ])
    ]
})
export class HomeModule { }