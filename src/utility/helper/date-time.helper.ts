export class DateTimeHelper {
  private date: Date;
  private readonly months: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  constructor(date?: Date) {
    this.date = new Date(date || Date.now());
  }

  formatDate(): string {
    const day = this.getPaddedNumber(this.date.getDate());
    const month = this.getMonthAbbreviation(this.date);
    const year = this.date.getFullYear();
    return `${day} ${month}, ${year}`;
  }

  formatTime(): string {
    const hours = this.getPaddedNumber(this.date.getHours());
    const minutes = this.getPaddedNumber(this.date.getMinutes());
    return `${hours}:${minutes}`;
  }

  formatDateTime(): string {
    const date = this.formatDate();
    const time = this.formatTime();
    return `${date} - ${time}`;
  }

  formatEndTime(serviceDuration: number): string {
    const endDateTime = new Date(this.date);
    endDateTime.setMinutes(endDateTime.getMinutes() + serviceDuration * 60);
    const hours = this.getPaddedNumber(endDateTime.getHours());
    const minutes = this.getPaddedNumber(endDateTime.getMinutes());
    return `${hours}:${minutes}`;
  }

  private getMonthAbbreviation(date: Date): string {
    return this.months[date.getMonth()];
  }

  private getPaddedNumber(num: number): string {
    return num.toString().padStart(2, "0");
  }
}
