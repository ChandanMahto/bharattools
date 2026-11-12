import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { calculateGst, GstMode, GstSupplyType } from '../../tools/gst';
import { formatINR } from '../../core/format';
import { AccountService } from '../../core/account.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bt-gst-calculator',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="tool-page">
      <a class="back-link" href="/">← All tools</a>
      <div class="eyebrow">FINANCE · INDIA</div>
      <h1>GST Calculator</h1>
      <p class="tool-intro">
        Work out GST on a price, or remove GST from an inclusive amount. See the CGST + SGST or IGST
        split instantly.
      </p>
      <div class="calculator-layout">
        <div class="calculator-panel">
          <label class="field-label"
            >Amount (₹)
            <input type="number" min="0" step="0.01" [(ngModel)]="amount" />
          </label>
          <label class="field-label"
            >GST rate
            <select [(ngModel)]="rate">
              @for (r of rates; track r) {
                <option [ngValue]="r">{{ r }}%</option>
              }
            </select>
          </label>
          <div class="field-label">
            Price type
            <div class="segmented">
              <button
                type="button"
                [class.active]="mode === 'exclusive'"
                (click)="mode = 'exclusive'"
              >
                Add GST
              </button>
              <button
                type="button"
                [class.active]="mode === 'inclusive'"
                (click)="mode = 'inclusive'"
              >
                Remove GST
              </button>
            </div>
          </div>
          <div class="field-label">
            Supply type
            <div class="segmented">
              <button
                type="button"
                [class.active]="supply === 'intra-state'"
                (click)="supply = 'intra-state'"
              >
                Within state
              </button>
              <button
                type="button"
                [class.active]="supply === 'inter-state'"
                (click)="supply = 'inter-state'"
              >
                Between states
              </button>
            </div>
          </div>
          <p class="field-hint">
            Select the rate and supply type applicable to your transaction. This tool does not
            determine place of supply.
          </p>
        </div>
        <div class="result-panel">
          <span class="result-label">TOTAL AMOUNT</span>
          <strong class="result-total">{{ money(result.totalAmount) }}</strong>
          <div class="result-row">
            <span>Taxable value</span><b>{{ money(result.taxableValue) }}</b>
          </div>
          <div class="result-row">
            <span>GST amount</span><b>{{ money(result.gstAmount) }}</b>
          </div>
          @if (supply === 'intra-state') {
            <div class="result-row">
              <span>CGST ({{ rate / 2 }}%)</span><b>{{ money(result.cgst) }}</b>
            </div>
            <div class="result-row">
              <span>SGST ({{ rate / 2 }}%)</span><b>{{ money(result.sgst) }}</b>
            </div>
          } @else {
            <div class="result-row">
              <span>IGST ({{ rate }}%)</span><b>{{ money(result.igst) }}</b>
            </div>
          }
          <div class="result-note">Indicative calculation · Rounded to 2 decimal places</div>
          <button type="button" class="primary-button save-button" (click)="save()">
            Save calculation
          </button>
          @if (message) {
            <p class="status-message" role="status">
              {{ message }} <a routerLink="/account">Open account</a>
            </p>
          }
        </div>
      </div>
      <article class="explain-card">
        <h2>How GST is calculated</h2>
        <p>
          <b>Adding GST:</b> GST = taxable amount × rate ÷ 100. The GST is added to the taxable
          amount.
        </p>
        <p><b>Removing GST:</b> Taxable value = GST-inclusive amount ÷ (1 + rate ÷ 100).</p>
        <p>
          For an intra-state supply, GST is split into CGST and SGST. For an inter-state supply,
          IGST applies. Confirm the applicable rate and place-of-supply treatment for your
          transaction.
        </p>
      </article>
    </section>
  `,
})
export class GstCalculatorComponent {
  private account = inject(AccountService);
  message = '';
  amount = 1000;
  rate = 18;
  mode: GstMode = 'exclusive';
  supply: GstSupplyType = 'intra-state';
  readonly rates = [0, 0.25, 3, 5, 12, 18, 28];
  get result() {
    return calculateGst(
      Math.max(0, Number(this.amount) || 0),
      Number(this.rate),
      this.mode,
      this.supply,
    );
  }
  money = formatINR;
  save() {
    if (!this.account.signedIn) {
      this.message = 'Sign in to save this calculation.';
      return;
    }
    this.account
      .save({
        toolSlug: 'gst',
        title: 'GST calculation',
        inputs: { amount: this.amount, rate: this.rate, mode: this.mode, supply: this.supply },
        result: this.result,
      })
      .subscribe({
        next: () => (this.message = 'Calculation saved to your account.'),
        error: () => (this.message = 'Could not save. Please try again.'),
      });
  }
}
