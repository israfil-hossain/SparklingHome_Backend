export class DateTimeHelper {
  private date: Date;
  private months: string[] = [
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

  constructor(date: Date = new Date()) {
    this.date = new Date(date.toISOString());
    this.date.setUTCHours(0, 0, 0, 0);
  }

  formatDate(): string {
    const day = this.getDayOfMonth();
    const month = this.getMonthAbbreviation();
    const year = this.date.getUTCFullYear();
    return `${day} ${month}, ${year}`;
  }

  formatTime(): string {
    const hours = this.getPaddedHours();
    const minutes = this.getPaddedMinutes();
    return `${hours}:${minutes}`;
  }

  formatDateTime(): string {
    const date = this.formatDate();
    const time = this.formatTime();
    return `${date} - ${time}`;
  }

  private getDayOfMonth(): string {
    return this.date.getUTCDate().toString().padStart(2, "0");
  }

  private getMonthAbbreviation(): string {
    return this.months[this.date.getUTCMonth()];
  }

  private getPaddedHours(): string {
    return this.date.getUTCHours().toString().padStart(2, "0");
  }

  private getPaddedMinutes(): string {
    return this.date.getUTCMinutes().toString().padStart(2, "0");
  }
}
