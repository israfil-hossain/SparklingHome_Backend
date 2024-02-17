export class PaymentIntentResponseDto {
  public stipeKey: string;
  public stripeSecret: string;
  public bookingCode: string;
  public bookingPrice: number;
  public status: string;
  public currency: string;
}
