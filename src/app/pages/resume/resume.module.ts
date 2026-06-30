import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

// Components
import { ResumeComponent } from './components/resume.component';

@NgModule({
    declarations: [
        ResumeComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([
            { path: '', component: ResumeComponent }
        ])
    ]
})
export class ResumeModule { }