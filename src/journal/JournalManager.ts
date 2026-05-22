export class JournalManager {
  private static templates = [
    "Your companion waited near the {place}.",
    "The {place} felt quiet without you.",
    "A soft rain fell while you were away.",
    "Your companion found comfort in the {place}.",
    "The world aged gently in your absence.",
    "New stars appeared in the sky.",
  ];

  private static places = ["lake", "pond", "ancient tree", "fox den", "flower field"];

  public static generateReturnMessages(days: number, hours: number): string[] {
    const messages: string[] = [];

    if (days > 0) {
      messages.push(`You were gone for ${days} ${days === 1 ? 'day' : 'days'}.`);
    } else {
      messages.push(`You were away for ${Math.floor(hours)} ${Math.floor(hours) === 1 ? 'hour' : 'hours'}.`);
    }

    // Add a random narrative message
    const template = this.templates[Math.floor(Math.random() * this.templates.length)];
    const place = this.places[Math.floor(Math.random() * this.places.length)];
    messages.push(template.replace("{place}", place));

    return messages;
  }
}
