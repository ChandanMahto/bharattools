import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GstCalculatorComponent } from './pages/tools/gst-calculator.component';
import { EmiCalculatorComponent } from './pages/tools/emi-calculator.component';
import { PercentageCalculatorComponent } from './pages/tools/percentage-calculator.component';
import { AccountComponent } from './pages/account/account.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'BharatTools – Free Online Tools for India' },
  {
    path: 'tools/gst-calculator',
    component: GstCalculatorComponent,
    title: 'GST Calculator India – CGST, SGST & IGST | BharatTools',
  },
  {
    path: 'tools/emi-calculator',
    component: EmiCalculatorComponent,
    title: 'EMI Calculator India – Monthly Loan EMI | BharatTools',
  },
  { path: 'account', component: AccountComponent, title: 'Your Saved Calculations | BharatTools' },
  {
    path: 'tools/percentage-calculator',
    component: PercentageCalculatorComponent,
    title: 'Percentage Calculator – Free Online Tool | BharatTools',
  },
  { path: '**', redirectTo: '' },
];
