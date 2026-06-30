// Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { CompanyScrollerComponent } from './components/company-scroller/company-scroller.component';
import { ProjectCardComponent } from './components/project-card/project-card.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SafeHtmlPipe } from './pipes/safehtml.pipe';
import { ToolTipComponent } from './components/tooltips/tooltip.component';

@NgModule({
    declarations: [
        FooterComponent,
        HeaderComponent,
        ThemeToggleComponent,
        CompanyScrollerComponent,
        ProjectCardComponent,
        SpinnerComponent,
        ToolTipComponent,
        SafeHtmlPipe
    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        FooterComponent,
        HeaderComponent,
        ThemeToggleComponent,
        CompanyScrollerComponent,
        ProjectCardComponent,
        SpinnerComponent,
        ToolTipComponent,
        SafeHtmlPipe
    ],
    providers: [FormGroupDirective]
})
export class SharedModule { }